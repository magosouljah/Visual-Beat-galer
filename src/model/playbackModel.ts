import type { Edge, Node } from '@xyflow/react'

export type VisualLevel = 'system' | 'flow' | 'operation' | 'implementation'

export interface VisualNodeData {
  label: string
  subtitle?: string
  level: VisualLevel
  details?: string
  source?: string
}

export interface VisualMap {
  title: string
  sourceRef: string
  nodes: Node<VisualNodeData>[]
  edges: Edge[]
}

export const playbackMap: VisualMap = {
  title: 'Playback · current Web path',
  sourceRef: 'BeatGaler PR #129 · issue-97-definitive-web-startup-playback',
  nodes: [
    {
      id: 'playback',
      position: { x: 0, y: 0 },
      data: {
        label: 'Playback',
        subtitle: 'Web playback path',
        level: 'system',
        details: 'Coordinates a user Play request with routing, Direct focus, prefetched audio and streaming.',
      },
      draggable: false,
    },
    {
      id: 'intent',
      position: { x: 0, y: 150 },
      data: {
        label: 'Accept latest Play',
        subtitle: 'Older tracked Play requests are rejected',
        level: 'flow',
        details: 'A monotonically increasing playback intent identifies the latest requested beat. Tracked prepared URLs are accepted only when they belong to that latest intent.',
        source: 'src/features/playback/webPlaybackIntent.ts',
      },
      draggable: false,
    },
    {
      id: 'route',
      position: { x: 0, y: 300 },
      data: {
        label: 'Resolve audio route',
        subtitle: 'beat → Telegram message',
        level: 'flow',
        details: 'The local playback routing cache stores the Telegram message ID, MIME type and optional size for each beat. Startup keeps up to 14 ordered routes.',
        source: 'src/features/playback/webPlaybackRoutingCache.ts',
      },
      draggable: false,
    },
    {
      id: 'focus',
      position: { x: 0, y: 450 },
      data: {
        label: 'Give this beat PLAY focus',
        subtitle: 'Direct can start in parallel',
        level: 'flow',
        details: 'The startup/playback coordinator records the current playback message and asks the transport to focus it. Direct startup is dispatched without forcing Play to wait for the whole startup warm batch.',
        source: 'src/features/playback/webStartupPlaybackCoordinator.ts',
      },
      draggable: false,
    },
    {
      id: 'prefix',
      position: { x: 0, y: 600 },
      data: {
        label: 'Reuse or obtain playable prefix',
        subtitle: 'Warm data is promoted instead of discarded',
        level: 'flow',
        details: 'The source manager keeps prefetched prefixes per beat, raises visible work above nearby work, and can promote/adopt already-warmed bytes for playback.',
        source: 'src/features/playback/webPlaybackSource.ts',
      },
      draggable: false,
    },
    {
      id: 'audio',
      position: { x: 0, y: 750 },
      data: {
        label: 'Start audio',
        subtitle: 'MediaSource consumes available bytes',
        level: 'flow',
        details: 'Prepared playback is exposed as a URL backed by MediaSource/SourceBuffer when supported. The playable prefix can be appended before the rest of the file arrives.',
        source: 'src/features/playback/webPlaybackSource.ts',
      },
      draggable: false,
    },
    {
      id: 'stream',
      position: { x: 0, y: 900 },
      data: {
        label: 'Continue stream',
        subtitle: 'Continue after cached prefix',
        level: 'flow',
        details: 'Streaming continues from the byte offset already retained by the prefix rather than starting the file again.',
        source: 'src/features/playback/webPlaybackSource.ts',
      },
      draggable: false,
    },
  ],
  edges: [
    { id: 'e-play-intent', source: 'playback', target: 'intent' },
    { id: 'e-intent-route', source: 'intent', target: 'route' },
    { id: 'e-route-focus', source: 'route', target: 'focus' },
    { id: 'e-focus-prefix', source: 'focus', target: 'prefix' },
    { id: 'e-prefix-audio', source: 'prefix', target: 'audio' },
    { id: 'e-audio-stream', source: 'audio', target: 'stream' },
  ],
}
