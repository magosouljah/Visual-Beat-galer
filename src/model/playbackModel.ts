import type { Edge, Node } from '@xyflow/react'

export type VisualLevel = 'product' | 'system' | 'concept' | 'flow' | 'operation' | 'implementation'
export type VisualViewId = 'beatgaler' | 'playback' | 'playback-start'

export interface VisualNodeData extends Record<string, unknown> {
  label: string
  subtitle?: string
  level: VisualLevel
  details?: string
  source?: string
  targetView?: VisualViewId
}

export interface VisualMap {
  id: VisualViewId
  title: string
  sourceRef: string
  nodes: Node<VisualNodeData>[]
  edges: Edge[]
}

const sourceRef = 'BeatGaler PR #129 · issue-97-definitive-web-startup-playback'

const overviewMap: VisualMap = {
  id: 'beatgaler',
  title: 'BeatGaler',
  sourceRef,
  nodes: [
    {
      id: 'beatgaler',
      position: { x: 0, y: 0 },
      data: {
        label: 'BeatGaler',
        subtitle: 'Current code reality',
        level: 'product',
        details: 'Top-level visual map. Only systems that have been mapped from current code appear here.',
      },
      draggable: false,
    },
    {
      id: 'playback',
      position: { x: 0, y: 190 },
      data: {
        label: 'Playback',
        subtitle: 'How a beat becomes audible',
        level: 'system',
        details: 'Current Web playback path mapped from the Issue #97 implementation.',
        targetView: 'playback',
      },
      draggable: false,
    },
  ],
  edges: [{ id: 'e-beatgaler-playback', source: 'beatgaler', target: 'playback' }],
}

const playbackSystemMap: VisualMap = {
  id: 'playback',
  title: 'BeatGaler / Playback',
  sourceRef,
  nodes: [
    {
      id: 'playback',
      position: { x: 310, y: 0 },
      data: {
        label: 'Playback',
        subtitle: 'Turn a Play request into continuous audio',
        level: 'system',
        details: 'Coordinates the selected beat, its Telegram route, Direct priority, prepared bytes and browser audio.',
      },
      draggable: false,
    },
    {
      id: 'intent',
      position: { x: 0, y: 190 },
      data: {
        label: 'Know which beat the user wants now',
        subtitle: 'Old tracked Play requests cannot take over',
        level: 'concept',
        source: 'src/features/playback/webPlaybackIntent.ts',
      },
      draggable: false,
    },
    {
      id: 'route',
      position: { x: 310, y: 190 },
      data: {
        label: 'Know where that audio lives',
        subtitle: 'beat → Telegram message',
        level: 'concept',
        source: 'src/features/playback/webPlaybackRoutingCache.ts',
      },
      draggable: false,
    },
    {
      id: 'priority',
      position: { x: 620, y: 190 },
      data: {
        label: 'Prioritize the beat being played',
        subtitle: 'Playback takes focus over background work',
        level: 'concept',
        source: 'src/features/playback/webStartupPlaybackCoordinator.ts',
      },
      draggable: false,
    },
    {
      id: 'source',
      position: { x: 155, y: 380 },
      data: {
        label: 'Prepare enough audio to begin',
        subtitle: 'Reuse warm bytes or obtain what is missing',
        level: 'concept',
        source: 'src/features/playback/webPlaybackSource.ts',
      },
      draggable: false,
    },
    {
      id: 'audio',
      position: { x: 465, y: 380 },
      data: {
        label: 'Keep audio playing',
        subtitle: 'Start with available bytes, then continue streaming',
        level: 'concept',
        source: 'src/features/playback/webPlaybackSource.ts',
      },
      draggable: false,
    },
    {
      id: 'start-flow',
      position: { x: 310, y: 585 },
      data: {
        label: 'Start Playback',
        subtitle: 'Enter the real execution flow',
        level: 'flow',
        targetView: 'playback-start',
      },
      draggable: false,
    },
  ],
  edges: [
    { id: 'e-p-intent', source: 'playback', target: 'intent' },
    { id: 'e-p-route', source: 'playback', target: 'route' },
    { id: 'e-p-priority', source: 'playback', target: 'priority' },
    { id: 'e-intent-source', source: 'intent', target: 'source' },
    { id: 'e-route-source', source: 'route', target: 'source' },
    { id: 'e-priority-audio', source: 'priority', target: 'audio' },
    { id: 'e-source-audio', source: 'source', target: 'audio' },
    { id: 'e-audio-flow', source: 'audio', target: 'start-flow' },
  ],
}

const playbackStartMap: VisualMap = {
  id: 'playback-start',
  title: 'BeatGaler / Playback / Start Playback',
  sourceRef,
  nodes: [
    {
      id: 'request',
      position: { x: 0, y: 0 },
      data: {
        label: 'User chooses a beat',
        subtitle: 'A new Play request becomes the current intent',
        level: 'flow',
        details: 'The Web path tracks the latest Play intent so an older prepared request cannot later replace the beat the user most recently selected.',
        source: 'src/features/playback/webPlaybackIntent.ts',
      },
      draggable: false,
    },
    {
      id: 'route',
      position: { x: 0, y: 155 },
      data: {
        label: 'BeatGaler finds the audio',
        subtitle: 'Resolve the beat to its Telegram message',
        level: 'flow',
        details: 'The local routing cache stores message ID, MIME type and optional size for known beats.',
        source: 'src/features/playback/webPlaybackRoutingCache.ts',
      },
      draggable: false,
    },
    {
      id: 'focus',
      position: { x: 0, y: 310 },
      data: {
        label: 'BeatGaler prioritizes this beat',
        subtitle: 'Give current playback Direct focus',
        level: 'flow',
        details: 'The coordinator records the current playback message and asks the transport to focus it. Direct startup can proceed in parallel.',
        source: 'src/features/playback/webStartupPlaybackCoordinator.ts',
      },
      draggable: false,
    },
    {
      id: 'prefix',
      position: { x: 0, y: 465 },
      data: {
        label: 'Prepare enough audio to start',
        subtitle: 'Reuse already-warmed bytes or fetch what is missing',
        level: 'flow',
        details: 'The source manager keeps prefetched prefixes and can promote existing warm work instead of discarding and redownloading it.',
        source: 'src/features/playback/webPlaybackSource.ts',
      },
      draggable: false,
    },
    {
      id: 'audio',
      position: { x: 0, y: 620 },
      data: {
        label: 'Audio starts',
        subtitle: 'The browser can consume the available playable bytes',
        level: 'flow',
        details: 'Prepared Web playback uses MediaSource/SourceBuffer when supported, allowing the beginning to be appended before the entire file arrives.',
        source: 'src/features/playback/webPlaybackSource.ts',
      },
      draggable: false,
    },
    {
      id: 'stream',
      position: { x: 0, y: 775 },
      data: {
        label: 'The rest keeps arriving',
        subtitle: 'Continue after the bytes already retained',
        level: 'flow',
        details: 'The stream continues after the retained prefix rather than restarting the same file from byte zero.',
        source: 'src/features/playback/webPlaybackSource.ts',
      },
      draggable: false,
    },
  ],
  edges: [
    { id: 'e-request-route', source: 'request', target: 'route' },
    { id: 'e-route-focus', source: 'route', target: 'focus' },
    { id: 'e-focus-prefix', source: 'focus', target: 'prefix' },
    { id: 'e-prefix-audio', source: 'prefix', target: 'audio' },
    { id: 'e-audio-stream', source: 'audio', target: 'stream' },
  ],
}

export const visualMaps: Record<VisualViewId, VisualMap> = {
  beatgaler: overviewMap,
  playback: playbackSystemMap,
  'playback-start': playbackStartMap,
}
