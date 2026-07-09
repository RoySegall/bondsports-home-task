# Decisions

Design and engineering decisions worth recording — the "why" behind choices that
aren't obvious from the code.

## Testing: invest in logic and state, treat rendering as a smoke check

The suite is deliberately weighted:

- **Unit tests for the pure logic** — CSV parsing (RFC 4180 quoting/escaping),
  HTTP `Range` resolution (which drives video seeking), and the human-readable
  formatters. These are deterministic and catch the off-by-one / edge-case bugs
  that actually break import and playback.
- **Store tests** — the Zustand actions (`setFilePaths`, `setSearchTerm`,
  `setPlayingIndex`, `reset`) and the `filterPaths` derivation. This is where the
  app's state transitions live, and they're verifiable with no DOM at all.
- **One component/router test** — enough to prove the store actually drives which
  screen renders (`import → EmptyState`, `grid → LibraryView`).

That single render test is included to show the wiring works, **not** as a safety
net — and this is a deliberate stance. Testing "did this component render X?"
against a mocked DOM gives low confidence as an app grows: jsdom mocks away the
very browser behaviors (layout, element sizing, `ResizeObserver`, real paint) where
the real bugs live. The router test is a case in point — it can't even mount the
grid without us stubbing `ResizeObserver`, because jsdom has no layout engine. A
test that has to fake the browser isn't testing the browser.

So the confidence ladder is: **pure logic + store (unit tests) → real rendering and
interaction (E2E in a real engine, e.g. Playwright)**. React Testing Library sits
in between and, in my experience, is the lowest-ROI rung for a UI-heavy app that
needs thorough coverage — it's most useful as a quick smoke check that the tree
composes, which is exactly how it's used here.
