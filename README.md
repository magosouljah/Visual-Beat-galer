# Visual BeatGaler

Read-only visual map of how BeatGaler actually works.

The app translates BeatGaler's current implementation into a navigable visual model. It does not describe the desired architecture, edit BeatGaler, or act as a second source of truth.

## Stage 1

This repository currently contains only the viewer foundation:

- React + TypeScript + Vite
- React Flow canvas
- read-only interaction
- no hardcoded BeatGaler architecture
- no analyzer yet

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Source repository

The analyzer introduced in the next stage will consume a BeatGaler checkout/reference and generate a disposable semantic model for this viewer. The generated model must never become a manually maintained source of truth.
