"use client";

import React, { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  MarkerType,
} from "reactflow";

import "reactflow/dist/style.css";

type Props = {
  className?: string;
};

export default function ArchitectureDiagram({ className }: Props) {
  const nodes = useMemo<Node[]>(
    () => [
      {
        id: "clients",
        position: { x: 20, y: 80 },
        data: { label: "Clients\n• Manager Web App\n• Admin Dashboard\n• Mobile" },
        style: baseNodeStyle,
      },
      {
        id: "edge",
        position: { x: 330, y: 20 },
        data: { label: "Edge\n• CDN / WAF\n• Load Balancer" },
        style: baseNodeStyle,
      },
      {
        id: "platform",
        position: { x: 330, y: 160 },
        data: {
          label:
            "Mizan Cloud Platform\n• API Gateway • Auth & RBAC\n• Scheduling • Tasks/Checklists\n• Incidents • Notifications\n• Reporting & Analytics\n• Integration Hub • Jobs/Queue",
        },
        style: platformNodeStyle,
      },
      {
        id: "ai",
        position: { x: 760, y: 160 },
        data: {
          label:
            "AI Layer\n• LLM Orchestrator\n• Rules & Constraints\n• Prompt & Audit Logs\n• (Optional) Vector Store",
        },
        style: accentNodeStyle,
      },
      {
        id: "data",
        position: { x: 330, y: 430 },
        data: { label: "Data Layer\n• Postgres\n• Redis Cache\n• Object Storage" },
        style: baseNodeStyle,
      },
      {
        id: "integrations",
        position: { x: 760, y: 390 },
        data: { label: "External Integrations\n• POS • Reservations\n• Payroll • Inventory\n• Accounting" },
        style: baseNodeStyle,
      },
      {
        id: "observability",
        position: { x: 20, y: 430 },
        data: { label: "Observability\n• Monitoring\n• Logging\n• Tracing\n• Security & Audit" },
        style: baseNodeStyle,
      },
    ],
    [],
  );

  const edges = useMemo<Edge[]>(
    () => [
      mkEdge("clients", "edge"),
      mkEdge("edge", "platform"),
      mkEdge("platform", "data", true),
      mkEdge("platform", "ai"),
      mkEdge("ai", "platform", true),
      mkEdge("platform", "integrations"),
      mkEdge("observability", "platform", true),
    ],
    [],
  );

  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag
        zoomOnScroll
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} size={1} color="#eef2f7" />
        <MiniMap
          pannable
          zoomable
          nodeStrokeWidth={2}
          maskColor="rgba(255,255,255,0.55)"
          style={{ borderRadius: 12 }}
        />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

const baseNodeStyle: React.CSSProperties = {
  width: 285,
  borderRadius: 16,
  border: "1px solid rgba(15, 23, 42, 0.12)",
  background: "rgba(255,255,255,0.95)",
  boxShadow: "0 18px 40px rgba(15,23,42,0.10)",
  padding: 14,
  fontSize: 12,
  lineHeight: 1.35,
  whiteSpace: "pre-wrap",
  color: "#0f172a",
};

const platformNodeStyle: React.CSSProperties = {
  ...baseNodeStyle,
  width: 390,
  border: "1px solid rgba(16, 185, 129, 0.28)",
  background: "rgba(236, 253, 245, 0.95)",
};

const accentNodeStyle: React.CSSProperties = {
  ...baseNodeStyle,
  width: 320,
  border: "1px solid rgba(16, 185, 129, 0.28)",
  background: "rgba(255,255,255,0.95)",
};

function mkEdge(source: string, target: string, muted = false): Edge {
  return {
    id: `${source}-${target}`,
    source,
    target,
    animated: !muted,
    style: { stroke: muted ? "#94a3b8" : "#10b981", strokeWidth: 2.5 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: muted ? "#94a3b8" : "#10b981",
    },
  };
}

