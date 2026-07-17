import { Employee, IEmployeeDocument } from '../models/Employee';

export interface OrgNode {
  _id: string;
  name: string;
  designation: string;
  department: string;
  role: string;
  status: string;
  profileImage?: string | null;
  reportingManager?: string | null;
  taskCount?: number;
  tasks?: any[];
  children: OrgNode[];
}

/**
 * Checks if assigning newManagerId as the manager of targetId would create a cycle.
 * Walks UP the manager chain from newManagerId — if targetId appears, it's a cycle.
 */
export function wouldCreateCycle(
  allEmployees: Array<{ _id: string; reportingManager?: string | null }>,
  targetId: string,
  newManagerId: string
): boolean {
  const empMap = new Map(allEmployees.map((e) => [e._id.toString(), e]));
  let current: string | null = newManagerId;
  const visited = new Set<string>();

  while (current) {
    if (current === targetId) return true; // cycle detected
    if (visited.has(current)) return true; // existing cycle guard
    visited.add(current);
    const emp = empMap.get(current);
    current = emp?.reportingManager?.toString() ?? null;
  }
  return false;
}

/**
 * Builds a nested tree structure from a flat employee list.
 * Returns root nodes (those with no reportingManager or unknown manager).
 */
export function buildOrgTree(employees: IEmployeeDocument[]): OrgNode[] {
  const nodeMap = new Map<string, OrgNode>();

  // Initialise all nodes
  for (const emp of employees) {
    nodeMap.set(emp._id.toString(), {
      _id: emp._id.toString(),
      name: emp.name,
      designation: emp.designation,
      department: emp.department,
      role: emp.role,
      status: emp.status,
      profileImage: emp.profileImage,
      reportingManager: emp.reportingManager?.toString() ?? null,
      taskCount: (emp as any).taskCount || 0,
      tasks: (emp as any).tasks || [],
      children: [],
    });
  }

  const roots: OrgNode[] = [];

  // Wire up parent-child relationships
  for (const node of nodeMap.values()) {
    const managerId = node.reportingManager;
    if (managerId && nodeMap.has(managerId)) {
      nodeMap.get(managerId)!.children.push(node);
    } else {
      roots.push(node); // no manager or manager not in set → root
    }
  }

  return roots;
}
