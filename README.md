# Visual BeatGaler

Read-only visual map of how BeatGaler actually works.

The app translates BeatGaler's current implementation into a navigable visual model. It does not describe the desired architecture, edit BeatGaler, or act as a second source of truth.

## Current stage

Stage 3 has started: Playback is no longer rendered from a hand-written React Flow model. The viewer reads `src/generated/beatgaler-map.json`, and `scripts/analyze-beatgaler.mjs` can regenerate that file from a local BeatGaler checkout after verifying concrete code evidence.

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
npm run dev
```

Or set `BEATGALER_REPO` and run `npm run analyze`.

The generated file is disposable. If the map is wrong, fix the analyzer or BeatGaler; do not hand-edit the generated JSON as architectural truth.

## Build

```bash
npm run build
```

## Current analyzer scope

The first vertical slice is Web Playback. It verifies and maps evidence from:

- `src/platform/webAdapter.ts`
- `src/features/playback/webPlaybackIntent.ts`
- `src/features/playback/webPlaybackRoutingCache.ts`
- `src/features/playback/webStartupPlaybackCoordinator.ts`
- `src/features/playback/webPlaybackSource.ts`

This is not yet a general automatic architecture discovery engine. It is the first deterministic analyzer slice used to prove that a trusted generated model can replace the manually maintained Playback map.
