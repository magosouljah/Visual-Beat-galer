# Visual BeatGaler

Read-only visual map of how BeatGaler actually works.

The app translates BeatGaler's current implementation into a navigable visual model. It does not describe the desired architecture, edit BeatGaler, or act as a second source of truth.

## Current stage

Stage 3 is building the analyzer. The viewer reads `src/generated/beatgaler-map.json`, and `scripts/analyze-beatgaler.mjs` regenerates that disposable model from a local BeatGaler checkout.

The analyzer now has two layers:

- **repository inventory:** discovers real code areas from the current checkout (`src/features/*`, platform code, Tauri/Desktop, and detected service directories) and counts their actual code files;
- **validated semantic slice:** Playback has a deeper map only because the analyzer verifies concrete implementation evidence for that path.

A discovered directory is **not automatically called a canonical architecture**. The global map shows that the code area exists. Deeper semantic meaning is added only when supported by stronger evidence.

The analyzer is intentionally conservative. If expected Playback evidence disappears, it fails instead of inventing a replacement map.

## Run the viewer

```bash
npm install
npm run dev
```

## Regenerate from BeatGaler

Pass the local BeatGaler repository path:

```bash
npm run analyze -- "C:\path\to\BeatGaler"
npm run build
npm run dev
```

Or set `BEATGALER_REPO` and run `npm run analyze`.

The generated file is disposable. If the map is wrong, fix the analyzer or BeatGaler; do not hand-edit the generated JSON as architectural truth.

## Current semantic scope

The first deep vertical slice is Web Playback. It verifies evidence from:

- `src/platform/webAdapter.ts`
- `src/features/playback/webPlaybackIntent.ts`
- `src/features/playback/webPlaybackRoutingCache.ts`
- `src/features/playback/webStartupPlaybackCoordinator.ts`
- `src/features/playback/webPlaybackSource.ts`

Other discovered code areas currently appear in the global map as factual repository inventory. They are not yet given invented flows or dependencies.
