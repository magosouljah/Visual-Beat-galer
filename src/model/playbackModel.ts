import { MarkerType, type Edge, type Node } from '@xyflow/react'

export type VisualLevel = 'product' | 'system' | 'concept' | 'flow' | 'operation' | 'implementation'
export type VisualViewId = 'beatgaler' | 'playback' | 'playback-start'
export type VisualMapKind = 'overview' | 'relationships' | 'sequence'

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
  kind: VisualMapKind
  nodes: Node<VisualNodeData>[]
  edges: Edge[]
}

const sourceRef = 'BeatGaler PR #129 · issue-97-definitive-web-startup-playback'
const relationship = (id: string, source: string, target: string): Edge => ({
  id,
  source,
  target,
  className: 'relationship-edge',
})
const enter = (id: string, source: string, target: string): Edge => ({
  id,
  source,
  target,
  className: 'enter-edge',
})
const sequence = (id: string, source: string, target: string): Edge => ({
  id,
  source,
  target,
  className: 'sequence-edge',
  markerEnd: { type: MarkerType.ArrowClosed },
})

const overviewMap: VisualMap = {
  id: 'beatgaler',
  title: 'BeatGaler',
  sourceRef,
  kind: 'overview',
  nodes: [
    {
      id: 'beatgaler',
      position: { x: 0, y: 0 },
      data: {
        label: 'BeatGaler',
        subtitle: 'Current code reality',
        level: 'product',
        details: 'Only systems that have actually been mapped from current code appear here.',
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
        details: 'Current Web playback path mapped from Issue #97 / PR #129.',
        targetView: 'playback',
      },
      draggable: false,
    },
  ],
  edges: [relationship('e-beatgaler-playback', 'beatgaler', 'playback')],
}

const playbackSystemMap: VisualMap = {
  id: 'playback',
  title: 'BeatGaler / Playback',
  sourceRef,
  kind: 'relationships',
  nodes: [
    {
      id: 'playback',
      position: { x: 340, y: 0 },
      data: {
        label: 'Playback',
        subtitle: 'Turn a Play request into continuous audio',
        level: 'system',
        details: 'These lines show parts of Playback and how they depend on one another. They do not mean execution order.',
      },
      draggable: false,
    },
    {
      id: 'intent',
      position: { x: 0, y: 205 },
      data: {
        label: 'Know which beat is current',
        subtitle: 'Older tracked Play requests cannot take over',
        level: 'concept',
        details: 'The latest Web playback intent identifies which requested beat is still allowed to become active.',
        source: 'src/features/playback/webPlaybackIntent.ts',
      },
      draggable: false,
    },
    {
      id: 'route',
      position: { x: 340, y: 205 },
      data: {
        label: 'Know where the audio lives',
        subtitle: 'beat → Telegram message',
        level: 'concept',
        details: 'A local routing cache stores the Telegram message ID and media information used to locate the MASTER.',
        source: 'src/features/playback/webPlaybackRoutingCache.ts',
      },
      draggable: false,
    },
    {
      id: 'focus',
      position: { x: 680, y: 205 },
      data: {
        label: 'Prioritize the playing beat',
        subtitle: 'Playback gets Direct focus over background work',
        level: 'concept',
        details: 'Playback focus raises the active message above warm/background work and can be restored or released as playback changes.',
        source: 'src/features/playback/webStartupPlaybackCoordinator.ts',
      },
      draggable: false,
    },
    {
      id: 'prepare',
      position: { x: 170, y: 420 },
      data: {
        label: 'Prepare playable audio',
        subtitle: 'Reuse warm bytes or obtain what is missing',
        level: 'concept',
        details: 'The source manager can adopt or promote existing warm work instead of throwing it away and redownloading it.',
        source: 'src/features/playback/webPlaybackSource.ts',
      },
      draggable: false,
    },
    {
      id: 'continuity',
      position: { x: 510, y: 420 },
      data: {
        label: 'Keep playback supplied',
        subtitle: 'Continue streaming from retained bytes',
        level: 'concept',
        details: 'MediaSource receives available bytes while the stream continues from the prefix byte length instead of restarting from zero.',
        source: 'src/features/playback/webPlaybackSource.ts',
      },
      draggable: false,
    },
    {
      id: 'start-flow',
      position: { x: 340, y: 655 },
      data: {
        label: 'Start Playback',
        subtitle: 'Open the actual execution sequence',
        level: 'flow',
        details: 'This is a flow, not another architectural component. Enter it to see time/order.',
        targetView: 'playback-start',
      },
      draggable: false,
    },
  ],
  edges: [
    relationship('e-p-intent', 'playback', 'intent'),
    relationship('e-p-route', 'playback', 'route'),
    relationship('e-p-focus', 'playback', 'focus'),
    relationship('e-intent-prepare', 'intent', 'prepare'),
    relationship('e-route-prepare', 'route', 'prepare'),
    relationship('e-focus-prepare', 'focus', 'prepare'),
    relationship('e-prepare-continuity', 'prepare', 'continuity'),
    enter('e-flow-entry', 'playback', 'start-flow'),
  ],
}

const playbackStartMap: VisualMap = {
  id: 'playback-start',
  title: 'BeatGaler / Playback / Start Playback',
  sourceRef,
  kind: 'sequence',
  nodes: [
    {
      id: 'request',
      position: { x: 0, y: 0 },
      data: {
        label: 'User chooses a beat',
        subtitle: 'Create a new current Play intent',
        level: 'flow',
        details: 'preparePlayback begins a new Web playback intent for the selected beat. Later checks prevent an older tracked request from taking over.',
        source: 'src/platform/webAdapter.ts · src/features/playback/webPlaybackIntent.ts',
      },
      draggable: false,
    },
    {
      id: 'route',
      position: { x: 0, y: 155 },
      data: {
        label: 'BeatGaler resolves its audio route',
        subtitle: 'Use the cached beat → Telegram message mapping',
        level: 'flow',
        details: 'The Web adapter resolves the message ID from the playback routing cache first. If an authoritative cache says no route exists, it does not silently fall back to stale presentation data.',
        source: 'src/platform/webAdapter.ts · src/features/playback/webPlaybackRoutingCache.ts',
      },
      draggable: false,
    },
    {
      id: 'source-manager',
      position: { x: 0, y: 310 },
      data: {
        label: 'Playback source becomes ready',
        subtitle: 'Use the shared startup/playback coordinator',
        level: 'flow',
        details: 'The Web adapter resolves the coordinator/source manager and checks again that this Play intent is still current before preparing media.',
        source: 'src/platform/webAdapter.ts · src/features/playback/webStartupPlaybackCoordinator.ts',
      },
      draggable: false,
    },
    {
      id: 'focus',
      position: { x: 0, y: 465 },
      data: {
        label: 'This beat gets playback priority',
        subtitle: 'Existing warm work is adopted or promoted when possible',
        level: 'flow',
        details: 'prepare() promotes/adopts a matching prefetch. The promotion path gives the Telegram message playback focus before continuing.',
        source: 'src/features/playback/webPlaybackSource.ts · src/features/playback/webStartupPlaybackCoordinator.ts',
      },
      draggable: false,
    },
    {
      id: 'prepare',
      position: { x: 0, y: 620 },
      data: {
        label: 'Playable bytes are prepared',
        subtitle: 'Reuse active playback, replay cache or a warm prefix when available',
        level: 'flow',
        details: 'The source manager reuses an active entry when possible. Otherwise it consumes an existing prefix and prepares MediaSource, or falls back to a Blob path when MediaSource is unavailable.',
        source: 'src/features/playback/webPlaybackSource.ts',
      },
      draggable: false,
    },
    {
      id: 'url',
      position: { x: 0, y: 775 },
      data: {
        label: 'Browser receives a playable URL',
        subtitle: 'The beginning can be available before the full file',
        level: 'flow',
        details: 'On the MediaSource path, BeatGaler can return a URL while additional bytes continue arriving in the background.',
        source: 'src/features/playback/webPlaybackSource.ts',
      },
      draggable: false,
    },
    {
      id: 'stream',
      position: { x: 0, y: 930 },
      data: {
        label: 'Streaming continues from what is already retained',
        subtitle: 'offset = retained prefix byte length',
        level: 'flow',
        details: 'When a usable prefix exists, streamFile starts at prefix.byteLength instead of byte zero. Runtime waiting can return playback to critical priority until enough buffer is stable again.',
        source: 'src/features/playback/webPlaybackSource.ts',
      },
      draggable: false,
    },
    {
      id: 'recovery',
      position: { x: 360, y: 155 },
      data: {
        label: 'If the route is stale, reconcile and retry',
        subtitle: 'Only for ROUTE_MISSING / MEDIA_UNAVAILABLE',
        level: 'operation',
        details: 'A recoverable route failure refreshes the authoritative library/index, reads the repaired route and retries preparation if the same Play intent is still current.',
        source: 'src/platform/webAdapter.ts',
      },
      draggable: false,
    },
    {
      id: 'superseded',
      position: { x: 360, y: 360 },
      data: {
        label: 'If a newer Play wins, stop this request',
        subtitle: 'Superseded tracked playback does not take over',
        level: 'operation',
        details: 'Intent checks and AbortError handling convert stale preparation into a superseded URL instead of allowing the old request to replace the newer beat.',
        source: 'src/platform/webAdapter.ts · src/features/playback/webPlaybackIntent.ts',
      },
      draggable: false,
    },
  ],
  edges: [
    sequence('e-request-route', 'request', 'route'),
    sequence('e-route-source', 'route', 'source-manager'),
    sequence('e-source-focus', 'source-manager', 'focus'),
    sequence('e-focus-prepare', 'focus', 'prepare'),
    sequence('e-prepare-url', 'prepare', 'url'),
    sequence('e-url-stream', 'url', 'stream'),
    { id: 'e-route-recovery', source: 'route', target: 'recovery', className: 'branch-edge', label: 'route failure' },
    { id: 'e-recovery-route', source: 'recovery', target: 'route', className: 'branch-edge', label: 'repaired route' },
    { id: 'e-source-superseded', source: 'source-manager', target: 'superseded', className: 'branch-edge', label: 'newer Play' },
  ],
}

export const visualMaps: Record<VisualViewId, VisualMap> = {
  beatgaler: overviewMap,
  playback: playbackSystemMap,
  'playback-start': playbackStartMap,
}
