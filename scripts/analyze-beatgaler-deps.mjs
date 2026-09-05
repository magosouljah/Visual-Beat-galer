import fs from 'node:fs/promises'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(scriptDir, '..')
const repoRoot = path.resolve(process.argv[2] || process.env.BEATGALER_REPO || path.join(appRoot, '..', 'BeatGaler'))
const baseAnalyzer = path.join(scriptDir, 'analyze-beatgaler.mjs')
const outputPath = path.join(appRoot, 'src', 'generated', 'beatgaler-map.json')

const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']
const IGNORED_DIRS = new Set(['.git', 'node_modules', 'dist', 'target', 'coverage', '.vite'])

execFileSync(process.execPath, [baseAnalyzer, repoRoot], { stdio: 'inherit' })

const model = JSON.parse(await fs.readFile(outputPath, 'utf8'))
const areas = Array.isArray(model.inventory?.areas) ? model.inventory.areas : []

async function listFiles(relativeRoot) {
  const files = []
  const absoluteRoot = path.join(repoRoot, relativeRoot)

  async function walk(currentAbsolute, currentRelative) {
    let entries
    try {
      entries = await fs.readdir(currentAbsolute, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) {
          await walk(path.join(currentAbsolute, entry.name), path.join(currentRelative, entry.name))
        }
        continue
      }

      if (entry.isFile() && CODE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
        files.push(path.join(currentRelative, entry.name).replaceAll('\\', '/'))
      }
    }
  }

  await walk(absoluteRoot, relativeRoot)
  return files
}

function extractSpecifiers(source) {
  const output = new Set()
  const patterns = [
    /\b(?:import|export)\s+(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]/g,
    /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g,
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(source))) output.add(match[1])
  }
  return [...output]
}

function candidateTargets(importer, specifier) {
  if (!specifier.startsWith('.')) return []
  const raw = path.posix.normalize(path.posix.join(path.posix.dirname(importer), specifier))
  const candidates = [raw]
  for (const extension of CODE_EXTENSIONS) candidates.push(`${raw}${extension}`)
  for (const extension of CODE_EXTENSIONS) candidates.push(`${raw}/index${extension}`)
  return candidates
}

function areaForFile(file, areaFiles) {
  let best = null
  for (const [areaId, files] of areaFiles) {
    if (!files.has(file)) continue
    const area = areas.find(item => item.id === areaId)
    if (!area) continue
    if (!best || area.path.length > best.path.length) best = area
  }
  return best
}

const areaFiles = new Map()
const allFiles = new Set()
for (const area of areas) {
  const files = await listFiles(area.path)
  const set = new Set(files)
  areaFiles.set(area.id, set)
  for (const file of files) allFiles.add(file)
}

const dependencyCounts = new Map()
const dependencyEvidence = new Map()

for (const sourceArea of areas) {
  const files = areaFiles.get(sourceArea.id) || new Set()
  for (const importer of files) {
    let source
    try {
      source = await fs.readFile(path.join(repoRoot, importer), 'utf8')
    } catch {
      continue
    }

    for (const specifier of extractSpecifiers(source)) {
      const resolved = candidateTargets(importer, specifier).find(candidate => allFiles.has(candidate))
      if (!resolved) continue
      const targetArea = areaForFile(resolved, areaFiles)
      if (!targetArea || targetArea.id === sourceArea.id) continue

      const key = `${sourceArea.id}->${targetArea.id}`
      dependencyCounts.set(key, (dependencyCounts.get(key) || 0) + 1)
      if (!dependencyEvidence.has(key)) dependencyEvidence.set(key, [])
      const evidence = dependencyEvidence.get(key)
      if (evidence.length < 5) evidence.push({ importer, specifier, resolved })
    }
  }
}

const dependencies = [...dependencyCounts.entries()]
  .map(([key, importCount]) => {
    const [source, target] = key.split('->')
    return {
      source,
      target,
      importCount,
      evidence: dependencyEvidence.get(key) || [],
    }
  })
  .sort((a, b) => b.importCount - a.importCount || a.source.localeCompare(b.source) || a.target.localeCompare(b.target))

model.inventory.dependencies = dependencies
model.views.beatgaler.edges = dependencies.map(dependency => ({
  id: `dep-${dependency.source}-${dependency.target}`,
  source: dependency.source,
  target: dependency.target,
  kind: 'dependency',
  label: dependency.importCount > 1 ? String(dependency.importCount) : undefined,
}))

const beatGalerNode = model.views.beatgaler.nodes.find(node => node.id === 'beatgaler')
if (beatGalerNode) {
  beatGalerNode.subtitle = `${areas.length} code areas · ${dependencies.length} detected dependencies`
  beatGalerNode.details = `Generated from the current checkout. Surrounding nodes are discovered code areas. Arrows are direct relative imports found between those areas; no dependency is drawn unless the analyzer can point to source files that import target files.`
}

await fs.writeFile(outputPath, `${JSON.stringify(model, null, 2)}\n`, 'utf8')
console.log(`Dependencies: ${dependencies.length} area-to-area edges`)
for (const dependency of dependencies.slice(0, 12)) {
  console.log(`  ${dependency.source} -> ${dependency.target} (${dependency.importCount})`)
}
