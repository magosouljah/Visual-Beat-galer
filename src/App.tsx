import { useMemo, useState } from 'react'
import { Background, Controls, ReactFlow, type Node } from '@xyflow/react'
import { playbackMap, type VisualNodeData } from './model/playbackModel'

function nodeClassName(node: Node<VisualNodeData>) {
  return `visual-node visual-node--${node.data.level}`
}

export function App() {
  const [selected, setSelected] = useState<Node<VisualNodeData> | null>(null)
  const nodes = useMemo(
    () => playbackMap.nodes.map(node => ({ ...node, className: nodeClassName(node) })),
    [],
  )

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <strong>Visual BeatGaler</strong>
          <span>{playbackMap.title}</span>
        </div>
        <span className="status">{playbackMap.sourceRef}</span>
      </header>

      <section className="workspace">
        <section className="canvas" aria-label="BeatGaler visual map">
          <ReactFlow
            nodes={nodes}
            edges={playbackMap.edges}
            fitView
            minZoom={0.4}
            maxZoom={1.8}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
            onNodeClick={(_, node) => setSelected(node as Node<VisualNodeData>)}
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
