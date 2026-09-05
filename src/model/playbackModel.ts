import { MarkerType, type Edge, type Node } from '@xyflow/react'
import generatedModel from '../generated/beatgaler-map.json'

export type VisualLevel = 'product' | 'system' | 'concept' | 'flow' | 'operation' | 'implementation'
export type VisualViewId = 'beatgaler' | 'playback' | 'playback-start'
export type VisualMapKind = 'overview' | 'relationships' | 'sequence'

type GeneratedEdgeKind = 'relationship' | 'dependency' | 'enter' | 'sequence' | 'branch'

interface GeneratedNode {
  id: string
  x: number
  y: number
  label: string
  subtitle?: string
  level: VisualLevel
  details?: string
  source?: string
  targetView?: VisualViewId
}

interface GeneratedEdge {
  id: string
  source: string
  target: string
  kind: GeneratedEdgeKind
  label?: string
}

interface GeneratedView {
  id: VisualViewId
  title: string
  kind: VisualMapKind
  nodes: GeneratedNode[]
  edges: GeneratedEdge[]
}

interface GeneratedModel {
  schemaVersion: number
  generated: boolean
  generatedAt: string | null
  sourceSha: string
  sourceBranch: string
  sourceRef: string
  views: Record<VisualViewId, GeneratedView>
}

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

const model = generatedModel as GeneratedModel

if (model.schemaVersion !== 1) {
  throw new Error(`Unsupported BeatGaler map schema: ${model.schemaVersion}`)
}

function edgeFromGenerated(edge: GeneratedEdge): Edge {
  if (edge.kind === 'sequence' || edge.kind === 'dependency') {
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      className: edge.kind === 'sequence' ? 'sequence-edge' : 'dependency-edge',
      markerEnd: { type: MarkerType.ArrowClosed },
      label: edge.label,
    }
  }

  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    className: edge.kind === 'relationship'
      ? 'relationship-edge'
      : edge.kind === 'enter'
        ? 'enter-edge'
        : 'branch-edge',
    label: edge.label,
  }
}

function viewFromGenerated(view: GeneratedView): VisualMap {
  return {
    id: view.id,
    title: view.title,
    sourceRef: model.sourceRef,
    kind: view.kind,
    nodes: view.nodes.map(node => ({
      id: node.id,
      position: { x: node.x, y: node.y },
      data: {
        label: node.label,
        subtitle: node.subtitle,
        level: node.level,
        details: node.details,
        source: node.source,
        targetView: node.targetView,
      },
      draggable: false,
    })),
    edges: view.edges.map(edgeFromGenerated),
  }
}

export const visualMaps: Record<VisualViewId, VisualMap> = {
  beatgaler: viewFromGenerated(model.views.beatgaler),
  playback: viewFromGenerated(model.views.playback),
  'playback-start': viewFromGenerated(model.views['playback-start']),
}

export const modelMetadata = {
  generated: model.generated,
  generatedAt: model.generatedAt,
  sourceSha: model.sourceSha,
  sourceBranch: model.sourceBranch,
  sourceRef: model.sourceRef,
}
