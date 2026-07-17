'use client';

import { useMemo, useCallback, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import { useOrgTree } from '@/hooks/useOrgTree';
import { useAuth } from '@/context/AuthContext';
import { useCreateEmployee } from '@/hooks/useEmployees';
import { api } from '@/lib/api';
import { OrgTreeNode } from './OrgTreeNode';
import { NodeDetailPanel } from './NodeDetailPanel';
import { TaskNode } from './TaskNode';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';
import { toast } from 'sonner';
import type { OrgTreeNode as OrgTreeType, ITask, TaskStatus } from '@/types';
import { Network, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

// ── React Flow setup ──────────────────────────────────────────────────────────

const nodeTypes = { orgNode: OrgTreeNode, taskNode: TaskNode };

// ── Layout ────────────────────────────────────────────────────────────────────

function layoutWithDagre(
  tree: OrgTreeType[],
  unassignedTasks?: ITask[],
  onAssignTask?: (empId: string) => void,
  onCycleTaskStatus?: (taskId: string, currentStatus: TaskStatus) => void
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 80, ranksep: 120 });

  // Flatten tree via BFS
  const allNodes: OrgTreeType[] = [];
  const queue = [...tree];
  while (queue.length) {
    const node = queue.shift()!;
    allNodes.push(node);
    queue.push(...node.children);
  }

  // Set employee nodes in dagre
  for (const node of allNodes) {
    g.setNode(node._id, { width: 240, height: 100 });
  }

  // Process employee reporting edges and task nodes/edges
  const edges: Edge[] = [];
  for (const node of allNodes) {
    // 1. Employee direct reports
    for (const child of node.children) {
      g.setEdge(node._id, child._id);
      edges.push({
        id: `${node._id}-${child._id}`,
        source: node._id,
        target: child._id,
        type: 'smoothstep',
        style: { stroke: 'var(--primary)', strokeWidth: 2 },
        animated: false,
      });
    }

    // 2. Employee tasks
    if (node.tasks) {
      for (const task of node.tasks) {
        const taskIdStr = `task-${task._id}`;
        g.setNode(taskIdStr, { width: 180, height: 60 });
        g.setEdge(node._id, taskIdStr);
        edges.push({
          id: `${node._id}-${taskIdStr}`,
          source: node._id,
          target: taskIdStr,
          type: 'smoothstep',
          style: { stroke: 'var(--color-violet-500)', strokeWidth: 1.5, strokeDasharray: '4 4' },
          animated: false,
        });
      }
    }
  }

  // 3. Set unassigned task nodes in dagre
  if (unassignedTasks) {
    for (const task of unassignedTasks) {
      const taskIdStr = `task-${task._id}`;
      g.setNode(taskIdStr, { width: 180, height: 60 });
    }
  }

  dagre.layout(g);

  // Map employee cards
  const nodes: Node[] = allNodes.map((node) => {
    const pos = g.node(node._id);
    return {
      id: node._id,
      type: 'orgNode',
      position: { x: pos.x - 120, y: pos.y - 50 },
      data: {
        label: node.name,
        designation: node.designation,
        department: node.department,
        role: node.role,
        status: node.status,
        profileImage: node.profileImage,
        employeeId: node._id,
        taskCount: node.taskCount ?? 0,
        onAssignTask,
      },
    };
  });

  // Map task cards
  const taskNodes: Node[] = [];
  for (const node of allNodes) {
    if (node.tasks) {
      for (const task of node.tasks) {
        const taskIdStr = `task-${task._id}`;
        const pos = g.node(taskIdStr);
        taskNodes.push({
          id: taskIdStr,
          type: 'taskNode',
          position: { x: pos.x - 90, y: pos.y - 30 },
          data: {
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate,
            taskId: task._id,
            employeeId: node._id,
            employeeName: node.name,
            onCycleTaskStatus,
          },
        });
      }
    }
  }

  // Map unassigned task cards
  const unassignedTaskNodes: Node[] = [];
  if (unassignedTasks) {
    for (const task of unassignedTasks) {
      const taskIdStr = `task-${task._id}`;
      const pos = g.node(taskIdStr);
      unassignedTaskNodes.push({
        id: taskIdStr,
        type: 'taskNode',
        position: { x: pos.x - 90, y: pos.y - 30 },
        data: {
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate,
          taskId: task._id,
          employeeId: null,
          employeeName: null,
          onCycleTaskStatus,
        },
      });
    }
  }

  return { nodes: [...nodes, ...taskNodes, ...unassignedTaskNodes], edges };
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function OrgChartSkeleton() {
  return (
    <div className="relative h-[calc(100vh-12rem)] bg-background rounded-xl border border-border overflow-hidden flex flex-col items-center justify-start pt-16 gap-10 animate-pulse">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <Network className="h-6 w-6 text-primary animate-pulse" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Loading org chart…</p>
      </div>
      <div className="relative z-10 flex flex-col items-center gap-6 w-full px-8">
        <div className="h-24 w-60 rounded-xl bg-muted/60 border border-border" />
        <div className="h-6 w-0.5 bg-border" />
        <div className="flex gap-6 justify-center w-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-4">
              <div className="h-24 w-52 rounded-xl bg-muted/40 border border-border" />
              <div className="flex gap-4">
                {i === 2 &&
                  [1, 2].map((j) => (
                    <div key={j} className="h-20 w-44 rounded-xl bg-muted/30 border border-border" />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Drag confirm dialog ───────────────────────────────────────────────────────

function DragAssignDialog({
  employeeName,
  managerName,
  onConfirm,
  onCancel,
}: {
  employeeName: string;
  managerName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AlertDialog open onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reassign reporting manager?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">{employeeName}</span> will now report to{' '}
            <span className="font-medium text-foreground">{managerName}</span>.
            This change will update the org hierarchy immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── Add member dialog ─────────────────────────────────────────────────────────

const addSchema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
  department: z.enum([
    'Engineering', 'HR', 'Finance', 'Marketing',
    'Sales', 'Operations', 'Design', 'Legal',
  ]),
  designation: z.string().min(2, 'Designation required'),
  role: z.enum(['super_admin', 'hr_manager', 'employee']).default('employee'),
});
type AddFormData = z.infer<typeof addSchema>;

function AddMemberDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const createEmployee = useCreateEmployee();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddFormData>({
    resolver: zodResolver(addSchema),
    defaultValues: { role: 'employee', department: 'Engineering' },
  });

  const onSubmit = async (data: AddFormData) => {
    try {
      await createEmployee.mutateAsync(data as Record<string, unknown>);
      toast.success(`${data.name} added to the organization`);
      onOpenChange(false);
      onCreated();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create employee');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Organization Member
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input placeholder="Full name" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Email *</Label>
            <Input type="email" placeholder="email@company.com" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Password *</Label>
            <Input type="password" placeholder="Min. 6 characters" {...register('password')} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Department *</Label>
              <Select
                value={watch('department')}
                onValueChange={(v) => setValue('department', v as AddFormData['department'])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['Engineering', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Design', 'Legal'] as const).map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Role *</Label>
              <Select
                value={watch('role')}
                onValueChange={(v) => setValue('role', v as AddFormData['role'])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="hr_manager">HR Manager</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Designation *</Label>
            <Input placeholder="e.g. Senior Engineer" {...register('designation')} />
            {errors.designation && <p className="text-xs text-destructive">{errors.designation.message}</p>}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main OrgChart ─────────────────────────────────────────────────────────────

export function OrgChart() {
  const { data, isLoading, refetch } = useOrgTree();
  const { user } = useAuth();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  // Task assignment states
  const [selectedNodeForTask, setSelectedNodeForTask] = useState<string | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  const handleAssignTask = useCallback((empId: string) => {
    setSelectedNodeForTask(empId);
    setTaskDialogOpen(true);
  }, []);

  const onCycleTaskStatus = useCallback(async (taskId: string, currentStatus: TaskStatus) => {
    const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
      todo: 'in_progress',
      in_progress: 'done',
      done: 'todo',
    };
    const next = NEXT_STATUS[currentStatus];
    try {
      await api.put(`/api/tasks/${taskId}`, { status: next });
      toast.success(`Task status changed to ${next.replace('_', ' ')}`);
      refetch();
    } catch {
      toast.error('Failed to cycle task status');
    }
  }, [refetch]);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!data?.data) return { nodes: [], edges: [] };
    const { tree, unassignedTasks } = data.data;
    return layoutWithDagre(tree, unassignedTasks, handleAssignTask, onCycleTaskStatus);
  }, [data, handleAssignTask, onCycleTaskStatus]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Re-sync when data reloads, preserving custom dragged positions
  useEffect(() => {
    setNodes((prevNodes) => {
      const currentPosMap = new Map(
        prevNodes.map((n) => [n.id, n.position])
      );
      return initialNodes.map((node) => {
        const currentPos = currentPosMap.get(node.id);
        if (currentPos) {
          return {
            ...node,
            position: currentPos,
          };
        }
        return node;
      });
    });
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const isAdmin = user?.role === 'super_admin';
  const isHR = user?.role === 'hr_manager';
  const canEdit = isAdmin || isHR;

  // Drag proximity detection → open confirm dialog
  const onNodeDragStop = useCallback(
    async (_: any, draggedNode: Node) => {
      if (!isAdmin) return;
      const isTask = draggedNode.id.startsWith('task-');
      const otherNodes = nodes.filter((n) => n.id !== draggedNode.id);

      let closest: Node | null = null;
      let minDist = Infinity;

      for (const node of otherNodes) {
        if (!node.position || node.type !== 'orgNode') continue; // Tasks can only be mapped to employee cards
        const dx = draggedNode.position.x - node.position.x;
        const dy = draggedNode.position.y - node.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist && dist < 200) {
          minDist = dist;
          closest = node;
        }
      }

      if (closest) {
        if (isTask) {
          const taskId = draggedNode.id.replace('task-', '');
          if (draggedNode.data.employeeId === closest.id) {
            setNodes(initialNodes);
            setEdges(initialEdges);
            return;
          }
          const employeeName = String(closest.data.label);
          try {
            await api.put(`/api/tasks/${taskId}`, { assignedTo: closest.id });
            toast.success(`Task assigned to ${employeeName}`);
            refetch();
          } catch (err: any) {
            toast.error(err.message || 'Failed to reassign task');
            setNodes(initialNodes);
            setEdges(initialEdges);
          }
        } else {
          const employeeId = draggedNode.id;
          const managerId = closest.id;
          const employeeName = String(draggedNode.data.label);
          const managerName = String(closest.data.label);
          try {
            await api.patch(`/api/employees/${employeeId}/manager`, { managerId });
            toast.success(`${employeeName} now reports to ${managerName}`);
            refetch();
          } catch (err: any) {
            toast.error(err.message || 'Failed to assign manager');
            setNodes(initialNodes);
            setEdges(initialEdges);
          }
        }
      }
    },
    [isAdmin, nodes, initialNodes, initialEdges, setNodes, setEdges, refetch],
  );

  const onNodeClick = useCallback((_: any, node: Node) => {
    if (node.id.startsWith('task-')) return; // Details panel only for employee nodes
    setSelectedNodeId(node.id);
    setPanelOpen(true);
  }, []);

  const onEdgeClick = useCallback(
    async (event: any, edge: Edge) => {
      event.stopPropagation();
      if (!isAdmin) return; // Only administrators can break connections

      const isTaskEdge = edge.id.includes('-task-');

      if (isTaskEdge) {
        const parts = edge.id.split('-task-');
        const employeeId = parts[0];
        const taskId = parts[1];

        const employeeNode = nodes.find((n) => n.id === employeeId);
        const taskNode = nodes.find((n) => n.id === `task-${taskId}`);

        if (employeeNode && taskNode) {
          const taskTitle = String(taskNode.data.title);
          try {
            await api.put(`/api/tasks/${taskId}`, { assignedTo: null });
            toast.success(`Unassigned task "${taskTitle}"`);
            refetch();
          } catch (err: any) {
            toast.error(err.message || 'Failed to break connection');
          }
        }
      } else {
        const employeeNode = nodes.find((n) => n.id === edge.target);
        if (employeeNode) {
          const employeeName = String(employeeNode.data.label);
          try {
            await api.patch(`/api/employees/${edge.target}/manager`, { managerId: null });
            toast.success(`Removed reporting manager from ${employeeName}`);
            refetch();
          } catch (err: any) {
            toast.error(err.message || 'Failed to break connection');
          }
        }
      }
    },
    [isAdmin, nodes, refetch]
  );

  const onConnect = useCallback(
    async (connection: Connection) => {
      if (!isAdmin) return;

      const sourceId = connection.source;
      const targetId = connection.target;

      if (!sourceId || !targetId) return;

      const isSourceTask = sourceId.startsWith('task-');
      const isTargetTask = targetId.startsWith('task-');

      // Case A: Connecting employee to employee -> manager assignment
      if (!isSourceTask && !isTargetTask) {
        const managerNode = nodes.find((n) => n.id === sourceId);
        const employeeNode = nodes.find((n) => n.id === targetId);

        if (managerNode && employeeNode) {
          const employeeId = employeeNode.id;
          const managerId = managerNode.id;
          const employeeName = String(employeeNode.data.label);
          const managerName = String(managerNode.data.label);
          try {
            await api.patch(`/api/employees/${employeeId}/manager`, { managerId });
            toast.success(`${employeeName} now reports to ${managerName}`);
            refetch();
          } catch (err: any) {
            toast.error(err.message || 'Failed to assign manager');
          }
        }
      }
      // Case B: Connecting employee to task -> task assignment
      else if (isSourceTask !== isTargetTask) {
        const employeeId = isSourceTask ? targetId : sourceId;
        const taskId = (isSourceTask ? sourceId : targetId).replace('task-', '');

        const employeeNode = nodes.find((n) => n.id === employeeId);
        const taskNode = nodes.find((n) => n.id === `task-${taskId}`);

        if (employeeNode && taskNode) {
          const employeeName = String(employeeNode.data.label);
          try {
            await api.put(`/api/tasks/${taskId}`, { assignedTo: employeeId });
            toast.success(`Task assigned to ${employeeName}`);
            refetch();
          } catch (err: any) {
            toast.error(err.message || 'Failed to assign task');
          }
        }
      }
    },
    [isAdmin, nodes, refetch]
  );

  if (isLoading) return <OrgChartSkeleton />;

  return (
    <>
      <div className="relative h-[calc(100vh-12rem)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          nodesDraggable={isAdmin}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          className="bg-background"
        >
          <Background />
          <Controls />
        </ReactFlow>

        {/* Floating "Add member" button — SA/HR only */}
        {canEdit && (
          <Button
            size="sm"
            className="absolute top-4 right-4 z-10 shadow-lg"
            onClick={() => setAddMemberOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        )}
      </div>

      {/* Node detail panel (click a node) */}
      <NodeDetailPanel
        employeeId={selectedNodeId}
        open={panelOpen}
        onOpenChange={(open) => {
          setPanelOpen(open);
          if (!open) setSelectedNodeId(null);
        }}
        onDelete={() => refetch()}
      />

      {/* Task form assignment dialog via Flow node + click */}
      <TaskFormDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={null}
        defaultAssignedTo={selectedNodeForTask}
      />

      {/* Add new top-level member */}
      {addMemberOpen && (
        <AddMemberDialog
          open={addMemberOpen}
          onOpenChange={setAddMemberOpen}
          onCreated={() => refetch()}
        />
      )}
    </>
  );
}
