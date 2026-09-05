import fs from 'node:fs/promises'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(scriptDir, '..')
const repoRoot = path.resolve(process.argv[2] || process.env.BEATGALER_REPO || path.join(appRoot, '..', 'BeatGaler'))
const outputPath = path.join(appRoot, 'src', 'generated', 'beatgaler-map.json')

const files = {
  adapter: 'src/platform/webAdapter.ts',
  intent: 'src/features/playback/webPlaybackIntent.ts',
  routing: 'src/features/playback/webPlaybackRoutingCache.ts',
  coordinator: 'src/features/playback/webStartupPlaybackCoordinator.ts',
  source: 'src/features/playback/webPlaybackSource.ts',
}

async function read(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath)
  try {
    return await fs.readFile(absolutePath, 'utf8')
  } catch (error) {
    throw new Error(`Cannot read ${relativePath} from BeatGaler repo at ${repoRoot}: ${error.message}`)
  }
}

function git(...args) {
  try {
    return execFileSync('git', ['-C', repoRoot, ...args], { encoding: 'utf8' }).trim()
  } catch {
    return 'unknown'
  }
}

function requireEvidence(name, source, patterns) {
  const missing = patterns.filter(pattern => !pattern.test(source))
  if (missing.length > 0) {
    throw new Error(`Playback evidence check failed: ${name}. The analyzer refuses to generate a map from assumptions.`)
  }
}

const source = Object.fromEntries(await Promise.all(
  Object.entries(files).map(async ([key, relativePath]) => [key, await read(relativePath)]),
))

requireEvidence('current Play intent', source.intent, [
  /beginWebPlaybackIntent/,
  /latestIntent/,
  /shouldAcceptWebPlaybackRequest/,
])
requireEvidence('local playback routing', source.routing, [
  /WEB_PLAYBACK_ROUTING_CACHE_KEY/,
  /messageId/,
  /readWebPlaybackRoutingCache/,
])
requireEvidence('shared playback coordinator', source.coordinator, [
  /WebStartupPlaybackCoordinator/,
  /focusPlayback/,
  /getPlaybackSources/,
])
requireEvidence('playback preparation and warm adoption', source.source, [
  /promotePrefetchForPlayback/,
  /prepare\(/,
  /MediaSource/,
])
requireEvidence('exact stream continuation', source.source, [
  /offsetBytes/,
  /prefix\.byteLength/,
  /streamFile/,
])
requireEvidence('route recovery', source.adapter, [
  /recoverPlaybackRoute/,
  /ROUTE_MISSING/,
  /MEDIA_UNAVAILABLE/,
])
requireEvidence('superseded Play protection', source.adapter, [
  /beginWebPlaybackIntent/,
  /isCurrentWebPlaybackIntent/,
  /supersededWebPlaybackUrl/,
])

const sha = git('rev-parse', 'HEAD')
const branch = git('branch', '--show-current')
const generatedAt = new Date().toISOString()
const sourceRef = `BeatGaler ${branch || 'detached'} @ ${sha.slice(0, 12)}`

const model = {
  schemaVersion: 1,
  generated: true,
  generatedAt,
  repositoryPath: repoRoot,
  sourceSha: sha,
  sourceBranch: branch,
  sourceRef,
  views: {
    beatgaler: {
      id: 'beatgaler',
      title: 'BeatGaler',
      kind: 'overview',
      nodes: [
        { id: 'beatgaler', x: 0, y: 0, label: 'BeatGaler', subtitle: 'Current code reality', level: 'product', details: 'Only systems proven by the analyzer appear here.' },
        { id: 'playback', x: 0, y: 190, label: 'Playback', subtitle: 'How a beat becomes audible', level: 'system', details: 'Generated from the current Web playback implementation.', targetView: 'playback' },
      ],
      edges: [{ id: 'e-beatgaler-playback', source: 'beatgaler', target: 'playback', kind: 'relationship' }],
    },
    playback: {
      id: 'playback',
      title: 'BeatGaler / Playback',
      kind: 'relationships',
      nodes: [
        { id: 'playback', x: 360, y: 300, label: 'Playback', subtitle: 'Turn a Play request into continuous audio', level: 'system', details: 'Relationships in this view are not execution order.' },
        { id: 'intent', x: 40, y: 70, label: 'Know which beat is current', subtitle: 'Older tracked Play requests cannot take over', level: 'concept', details: 'The latest Web playback intent identifies the requested beat still allowed to become active.', source: files.intent },
        { id: 'route', x: 360, y: 20, label: 'Know where the audio lives', subtitle: 'beat → Telegram message', level: 'concept', details: 'A local routing cache stores the Telegram message and media information needed to locate the MASTER.', source: files.routing },
        { id: 'focus', x: 680, y: 70, label: 'Prioritize the playing beat', subtitle: 'Playback gets Direct focus over background work', level: 'concept', details: 'The active Telegram message receives playback focus instead of background warm priority.', source: files.coordinator },
        { id: 'prepare', x: 80, y: 520, label: 'Prepare playable audio', subtitle: 'Reuse warm bytes or obtain what is missing', level: 'concept', details: 'Matching warm work is adopted or promoted instead of discarded and redownloaded.', source: files.source },
        { id: 'continuity', x: 640, y: 520, label: 'Keep playback supplied', subtitle: 'Continue streaming from retained bytes', level: 'concept', details: 'The stream continues from the retained prefix byte offset rather than restarting at zero.', source: files.source },
        { id: 'start-flow', x: 360, y: 700, label: 'Start Playback', subtitle: 'Open the actual execution sequence', level: 'flow', details: 'Enter this flow to see execution order.', targetView: 'playback-start' },
      ],
      edges: [
        { id: 'e-p-intent', source: 'playback', target: 'intent', kind: 'relationship' },
        { id: 'e-p-route', source: 'playback', target: 'route', kind: 'relationship' },
        { id: 'e-p-focus', source: 'playback', target: 'focus', kind: 'relationship' },
        { id: 'e-p-prepare', source: 'playback', target: 'prepare', kind: 'relationship' },
        { id: 'e-p-continuity', source: 'playback', target: 'continuity', kind: 'relationship' },
        { id: 'e-flow-entry', source: 'playback', target: 'start-flow', kind: 'enter' },
      ],
    },
    'playback-start': {
      id: 'playback-start',
      title: 'BeatGaler / Playback / Start Playback',
      kind: 'sequence',
      nodes: [
        { id: 'request', x: 0, y: 0, label: 'User chooses a beat', subtitle: 'Create a new current Play intent', level: 'flow', details: 'A new Web playback intent is created for the selected beat.', source: `${files.adapter} · ${files.intent}` },
        { id: 'route', x: 0, y: 155, label: 'BeatGaler resolves its audio route', subtitle: 'Use the cached beat → Telegram message mapping', level: 'flow', details: 'The Web adapter resolves the Telegram message from the playback routing cache.', source: `${files.adapter} · ${files.routing}` },
        { id: 'source-manager', x: 0, y: 310, label: 'Playback source becomes ready', subtitle: 'Use the shared startup/playback coordinator', level: 'flow', details: 'The Web path resolves the shared coordinator/source manager and checks that the intent is still current.', source: `${files.adapter} · ${files.coordinator}` },
        { id: 'focus', x: 0, y: 465, label: 'This beat gets playback priority', subtitle: 'Existing warm work is adopted or promoted when possible', level: 'flow', details: 'Matching prefetch work is promoted/adopted and the message receives playback focus.', source: `${files.source} · ${files.coordinator}` },
        { id: 'prepare', x: 0, y: 620, label: 'Playable bytes are prepared', subtitle: 'Reuse active playback, replay cache or a warm prefix when available', level: 'flow', details: 'The source manager reuses existing playable data or prepares MediaSource/Blob playback.', source: files.source },
        { id: 'url', x: 0, y: 775, label: 'Browser receives a playable URL', subtitle: 'The beginning can be available before the full file', level: 'flow', details: 'MediaSource allows a playable URL to exist while later bytes are still arriving.', source: files.source },
        { id: 'stream', x: 0, y: 930, label: 'Streaming continues from what is already retained', subtitle: 'offset = retained prefix byte length', level: 'flow', details: 'When a usable prefix exists, streaming continues at prefix.byteLength instead of byte zero.', source: files.source },
        { id: 'recovery', x: 360, y: 155, label: 'If the route is stale, reconcile and retry', subtitle: 'Only for ROUTE_MISSING / MEDIA_UNAVAILABLE', level: 'operation', details: 'A recoverable route failure refreshes authoritative library state and retries with a repaired route.', source: files.adapter },
        { id: 'superseded', x: 360, y: 360, label: 'If a newer Play wins, stop this request', subtitle: 'Superseded tracked playback does not take over', level: 'operation', details: 'Intent checks prevent stale preparation from replacing the newest selected beat.', source: `${files.adapter} · ${files.intent}` },
      ],
      edges: [
        { id: 'e-request-route', source: 'request', target: 'route', kind: 'sequence' },
        { id: 'e-route-source', source: 'route', target: 'source-manager', kind: 'sequence' },
        { id: 'e-source-focus', source: 'source-manager', target: 'focus', kind: 'sequence' },
        { id: 'e-focus-prepare', source: 'focus', target: 'prepare', kind: 'sequence' },
        { id: 'e-prepare-url', source: 'prepare', target: 'url', kind: 'sequence' },
        { id: 'e-url-stream', source: 'url', target: 'stream', kind: 'sequence' },
        { id: 'e-route-recovery', source: 'route', target: 'recovery', kind: 'branch', label: 'route failure' },
        { id: 'e-recovery-route', source: 'recovery', target: 'route', kind: 'branch', label: 'repaired route' },
        { id: 'e-source-superseded', source: 'source-manager', target: 'superseded', kind: 'branch', label: 'newer Play' },
      ],
    },
  },
  evidence: Object.values(files),
}

await fs.mkdir(path.dirname(outputPath), { recursive: true })
await fs.writeFile(outputPath, `${JSON.stringify(model, null, 2)}\n`, 'utf8')
console.log(`Generated ${path.relative(appRoot, outputPath)}`)
console.log(`Source: ${sourceRef}`)
