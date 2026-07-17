import mongoose, { Document, Schema, Model } from 'mongoose';

export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;
export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface ITask {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string | null;
  assignedTo?: mongoose.Types.ObjectId | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ITaskDocument = ITask & Document;

const TaskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true,
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: 'todo',
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

TaskSchema.index({ assignedTo: 1, status: 1 });

export const Task: Model<ITaskDocument> = mongoose.model<ITaskDocument>(
  'Task',
  TaskSchema
);
