'use client';

import { useMemo, useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import { useOrgTree } from '@/hooks/useOrgTree';
import { useAuth } from '@/context/AuthContext';
import { OrgTreeNode } from './OrgTreeNode';
import { ReporteesPanel } from './ReporteesPanel';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import type { OrgTreeNode as OrgTreeType } from '@/types';

const nodeTypes = { orgNode: OrgTreeNode };

function layoutWithDagre(tree: OrgTreeType[]): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 80, ranksep: 120 });

  // Flatten tree and add to dagre
  const allNodes: OrgTreeType[] = [];
  const queue = [...tree];
  while (queue.length) {
    const node = queue.shift()!;
    allNodes.push(node);
    queue.push(...node.children);
  }

  for (const node of allNodes) {
    g.setNode(node._id, { width: 220, height: 80 });
  }

  const edges: Edge[] = [];
  for (const node of allNodes) {
    for (const child of node.children) {
      g.setEdge(node._id, child._id);
      edges.push({
        id: `${node._id}-${child._id}`,
        source: node._id,
        target: child._id,
        type: 'smoothstep',
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
      });
    }
  }

  dagre.layout(g);

  const nodes: Node[] = allNodes.map((node) => {
    const pos = g.node(node._id);
    return {
      id: node._id,
      type: 'orgNode',
      position: { x: pos.x - 110, y: pos.y - 40 },
      data: {
        label: node.name,
        designation: node.designation,
        department: node.department,
        role: node.role,
        profileImage: node.profileImage,
      },
    };
  });

  return { nodes, edges };
}

export function OrgChart() {
  const { data, isLoading } = useOrgTree();
  const { user } = useAuth();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!data?.data) return { nodes: [], edges: [] };
    return layoutWithDagre(data.data);
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const isAdmin = user?.role === 'super_admin';

  const onNodeDragStop = useCallback(
    (_: any, draggedNode: Node) => {
      if (!isAdmin) return;
      // Find nearest node by position (simplified overlap check for v12+)
      const otherNodes = nodes.filter((n) => n.id !== draggedNode.id);
      const dragged = draggedNode.position;
      let closest: Node | null = null;
      let minDist = Infinity;
      for (const node of otherNodes) {
        if (!node.position) continue;
        const dx = dragged.x - node.position.x;
        const dy = dragged.y - node.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // React Flow node hit radius ≈ 200px
        if (dist < minDist && dist < 200) {
          minDist = dist;
          closest = node;
        }
      }
      if (closest) {
        toast.info(`Assign ${draggedNode.data.label} → reports to ${closest.data.label}`);
      }
    },
    [isAdmin, nodes],
  );

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  if (isLoading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="relative h-[calc(100vh-12rem)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        nodesDraggable={isAdmin}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-background"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>

      {selectedNodeId && (
        <ReporteesPanel
          employeeId={selectedNodeId}
          open={!!selectedNodeId}
          onOpenChange={(open) => !open && setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}
