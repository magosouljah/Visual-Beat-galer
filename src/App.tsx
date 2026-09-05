import { Background, Controls, ReactFlow, type Node } from '@xyflow/react'

const nodes: Node[] = [
  {
    id: 'beatgaler',
    position: { x: 0, y: 0 },
    data: { label: 'BeatGaler' },
    draggable: false,
    selectable: false,
  },
]

export function App() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <strong>Visual BeatGaler</strong>
          <span>read-only map</span>
        </div>
        <span className="status">No BeatGaler model loaded</span>
      </header>

      <section className="canvas" aria-label="BeatGaler visual map">
        <ReactFlow nodes={nodes} edges={[]} fitView nodesDraggable={false} nodesConnectable={false}>
          <Background gap={28} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </section>
    </main>
  )
}
