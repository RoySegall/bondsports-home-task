# Overwolf home assignment

This is my solution to the Overwolf home assignment.

## Setup

You can do:
```bash
npm install
```

But because you probably have a lot of tasks to check, you might want to do:

```bash
pnpm install
```

## Running
As always:

```bash
npm run dev
```

## Interacting with the app
In the app we have several videos I took from the internet. They are located in the `videos` folder. They are small,
pretty small, so... no worries :)

The app requires a CSV file so you can create it via:

```bash
npm run generate:csv
```

In there you'll be asked how many files you want in the csv, how many non-video files and how many non-existing files.
All file paths will be adjusted to the current running machine, so no need to worry about that.

Then the file will be in `sample-files.csv` - it's untracked, so don't worry about committing it :)

## The decisions
The why behind every non-obvious call - state, virtualization, the `vault://` protocol, testing, why no Tailwind - is written up in [DECISIONS.md](DECISIONS.md).

And if you'd rather look at something pretty: open [`docs/decisions.html`](docs/decisions.html) in a browser. Same decisions, but as a little interactive page - an animated data-flow, a live virtualization demo, and a testing-ROI chart. All hand-rolled SVG, no D3 :)
