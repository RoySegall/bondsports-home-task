# Decisions

Design and engineering decisions worth recording — the "why" behind choices that
aren't obvious from the code.

## CSS
I went with CSS and pure CSS:
1. Today browsers support good features like nesting CSS and variables out of the box.
2. Tailwind and the DOM - as the styling gets complex the HTML gets ugly. This might also affect CSS selectors as the app grows.


## 3rd party libraries
1. Tanstack Query - TSQ is the data layer; it handles the mutation and stores the data from it, thus being a single 
   source of truth.
2. Tanstack Virtual - used for not rendering all rows at once (though the best approach here is to use pagination - but 
   the task is to browse a local CSV with no backend to page against, so windowing a flat list gives the same DOM savings). 
   We need to handle 5,000+ files, and mounting a video cell for each would freeze the DOM - so only the rows in the 
   viewport are mounted, and they recycle as you scroll. The DOM stays small no matter how big the list.
3. Zustand - small state management to manage the component "pyrotechnic" - which video is playing etc. etc. A lot of people would
   say "use hooks, they're good enough" but they're good, IMO, for a simple component. Not for global data we need to 
   pass to other components (context, or a custom hook, but I find both get boilerplate-y as the app grows - and context 
   re-renders every consumer - so a small store is cleaner).

Full disclosure - at scale I'd reach for MobX. `computed` + fine-grained reactivity kill the derive-with-hooks trap 
(no selectors, no `useShallow` dance - derivations just recompute when their inputs change). I went Zustand for a 
take-home because "1KB, no magic, readable in 30 seconds" beats "elegant, but you have to trust the observer". 
The community picked explicit-and-small over elegant-and-magic - alignment with React's grain, not merit - and for 
something a reviewer reads fast, that's the safe side to be on.

### More on my state approach
By having the data in the TSQ layer we can keep the state purely for handling the data. If we look at how we had state before:
it was probably MobX or Redux, where both needed to keep the data, show its loading state and more. This led to a lot of boilerplate (though fromPromise of MobX is pretty awesome!)
and in our unit tests we need to cover that - loading state, error, reject and more.

Tanstack Query took this headache from us, and now our data sits there - cached, invalidated in smart ways, battle tested and more - so that means our state is purely logical. If we want to unit test it, we can just pass data to the function. No need to mock network requests.
And that's why TSQ only needs to hold the data, and this will drill down to the components and state - like water flowing down the river and branching out.

## Playing video without real files - the vault:// protocol
The renderer can't load `file://` (Electron blocks it, plus CORS). So the main process registers a custom `vault://` scheme: it pulls the path out of the URL and streams that real file off disk - with HTTP Range support so the player can seek - falling back to a small bundled dummy clip for paths that don't exist. Either way each cell gets a real, playable `<video>` with no `file://`.

## Per-cell fetching
Metadata is fetched with one React Query per cell (keyed by the path), not one big request. That's what gives us loading / error / retry per cell - a single failed lookup shows a retry button on that one card instead of blanking the whole grid. The mock fails ~10% of the time on purpose to exercise it.

## The mock API is per-path, not batch
The brief describes "send an array, get a list back". I went per-path (`getFileMetadata(path)`) on purpose - it's what makes the per-cell states above possible. A batch call would collapse everything into one shared loading/error state for the whole page.

## Testing: invest in logic and state, treat rendering as a smoke check

The suite is deliberately weighted:

- **Unit tests for the pure logic** — CSV parsing (RFC 4180 quoting/escaping), the
  name filter (`filterPaths`), and the human-readable formatters (size / duration).
  These are deterministic and catch the off-by-one / edge-case bugs that actually
  break import and display.
- **State + data-layer tests** — the store's UI actions (`setSearchTerm`,
  `setPlayingIndex`, `reset`) and the `useLibrary` hook, which reads the React Query
  cache and filters it through the query's `select`.
- **One component/router test** — enough to prove the React Query cache drives which
  screen renders (no library → `EmptyState`, a list → `LibraryView`).

That single render test is included to show the wiring works, **not** as a safety
net — and this is a deliberate stance. Testing "did this component render X?"
against a mocked DOM gives low confidence as an app grows: jsdom mocks away the
very browser behaviors (layout, element sizing, `ResizeObserver`, real paint) where
the real bugs live. The router test is a case in point — it can't even mount the
grid without us stubbing `ResizeObserver`, because jsdom has no layout engine. A
test that has to fake the browser isn't testing the browser.

So the confidence ladder is: **pure logic + state (unit tests) → real rendering and
interaction (E2E in a real engine, e.g. Playwright)**. React Testing Library sits
in between and, in my experience, is the lowest-ROI rung for a UI-heavy app that
needs thorough coverage — it's most useful as a quick smoke check that the tree
composes, which is exactly how it's used here.
