import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IActivityLog {
  _id: mongoose.Types.ObjectId;
  action: string;
  entity: 'task' | 'employee';
  entityId: string;
  performedBy: mongoose.Types.ObjectId;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type IActivityLogDocument = IActivityLog & Document;

const ActivityLogSchema = new Schema<IActivityLogDocument>(
  {
    action: { type: String, required: true },
    entity: { type: String, enum: ['task', 'employee'], required: true },
    entityId: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Keep only the latest 500 logs (capped by index)
ActivityLogSchema.index({ createdAt: -1 });

export const ActivityLog: Model<IActivityLogDocument> = mongoose.model<IActivityLogDocument>(
  'ActivityLog',
  ActivityLogSchema
);
