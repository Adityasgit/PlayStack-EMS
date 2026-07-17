import { ActivityLog } from '../models/ActivityLog';

export function logActivity(
  action: string,
  entity: 'task' | 'employee',
  entityId: string,
  performedBy: string,
  meta?: Record<string, unknown>
): void {
  // Fire-and-forget — never await this in a request handler
  ActivityLog.create({ action, entity, entityId, performedBy, meta }).catch((err) => {
    console.error('[ActivityLog] Failed to log activity:', err.message);
  });
}
