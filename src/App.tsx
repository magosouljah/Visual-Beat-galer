import { useMemo, useState } from 'react'
import { Background, Controls, ReactFlow, type Node } from '@xyflow/react'
import { visualMaps, type VisualNodeData, type VisualViewId } from './model/playbackModel'

const viewTrail: Record<VisualViewId, VisualViewId[]> = {
  beatgaler: ['beatgaler'],
  playback: ['beatgaler', 'playback'],
  'playback-start': ['beatgaler', 'playback', 'playback-start'],
}

const viewLabels: Record<VisualViewId, string> = {
  beatgaler: 'BeatGaler',
  playback: 'Playback',
  'playback-start': 'Start Playback',
}

function nodeClassName(node: Node<VisualNodeData>) {
  return `visual-node visual-node--${node.data.level}${node.data.targetView ? ' visual-node--enterable' : ''}`
}

export function App() {
  const [viewId, setViewId] = useState<VisualViewId>('beatgaler')
  const [selected, setSelected] = useState<Node<VisualNodeData> | null>(null)
  const map = visualMaps[viewId]
  const nodes = useMemo(
    () => map.nodes.map(node => ({ ...node, className: nodeClassName(node) })),
    [map],
  )

  function enterView(target: VisualViewId) {
    setSelected(null)
    setViewId(target)
  }

  function handleNodeClick(node: Node<VisualNodeData>) {
    if (node.data.targetView) {
      enterView(node.data.targetView)
      return
    }
    setSelected(node)
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-group">
          <strong>Visual BeatGaler</strong>
          <nav className="breadcrumbs" aria-label="Map location">
            {viewTrail[viewId].map((trailView, index, trail) => (
              <span key={trailView}>
                <button type="button" onClick={() => enterView(trailView)} disabled={trailView === viewId}>
                  {viewLabels[trailView]}
                </button>
                {index < trail.length - 1 && <span className="crumb-separator">/</span>}
              </span>
            ))}
          </nav>
        </div>
        <span className="status">{map.sourceRef}</span>
      </header>

      <section className="workspace">
        <section className="canvas" aria-label="BeatGaler visual map">
          <ReactFlow
            key={viewId}
            nodes={nodes}
            edges={map.edges}
            fitView
            fitViewOptions={{ padding: 0.28 }}
            minZoom={0.4}
            maxZoom={1.9}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
            onNodeClick={(_, node) => handleNodeClick(node as Node<VisualNodeData>)}
            onPaneClick={() => setSelected(null)}
          >
            <Background gap={28} size={1} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </section>

        {selected && (
          <aside className="inspector" aria-label="Selected map item">
            <span className="eyebrow">{selected.data.level}</span>
            <h2>{selected.data.label}</h2>
            {selected.data.subtitle && <p className="subtitle">{selected.data.subtitle}</p>}
            {selected.data.details && <p>{selected.data.details}</p>}
            {selected.data.source && (
              <div className="source-ref">
                <span>Implementation</span>
                <code>{selected.data.source}</code>
              </div>
            )}
          </aside>
        )}
      </section>
    </main>
  )
}
