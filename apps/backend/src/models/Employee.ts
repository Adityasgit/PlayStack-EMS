import mongoose, { Document, Schema, Model } from 'mongoose';

export const DEPARTMENTS = [
  'Engineering',
  'HR',
  'Finance',
  'Marketing',
  'Sales',
  'Operations',
  'Design',
  'Legal',
] as const;

export const ROLES = ['super_admin', 'hr_manager', 'employee'] as const;
export const STATUSES = ['active', 'inactive'] as const;

export type Department = (typeof DEPARTMENTS)[number];
export type Role = (typeof ROLES)[number];
export type Status = (typeof STATUSES)[number];

export interface IEmployee {
  _id: mongoose.Types.ObjectId;
  employeeId: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  department: Department;
  designation: string;
  salary: number;
  joiningDate: Date;
  status: Status;
  role: Role;
  reportingManager?: mongoose.Types.ObjectId;
  profileImage?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type IEmployeeDocument = IEmployee & Document;

const EmployeeSchema = new Schema<IEmployeeDocument>(
  {
    employeeId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // never returned in queries by default
    },
    phone: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      enum: DEPARTMENTS,
      required: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    salary: {
      type: Number,
      min: 0,
      default: 0,
    },
    joiningDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'active',
      index: true,
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'employee',
      index: true,
    },
    reportingManager: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true,
    },
    profileImage: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Compound indexes ───────────────────────────────────────────────────────────
EmployeeSchema.index({ isDeleted: 1, status: 1 });
EmployeeSchema.index({ isDeleted: 1, department: 1 });
EmployeeSchema.index({ isDeleted: 1, role: 1 });
EmployeeSchema.index({ reportingManager: 1, isDeleted: 1 });
// Text index for full-text search on name + email
EmployeeSchema.index({ name: 'text', email: 'text' });

// ── Pre-find hook: automatically exclude soft-deleted docs ────────────────────
EmployeeSchema.pre(/^find/, function (this: mongoose.Query<unknown, IEmployeeDocument>) {
  // Only add filter if not already set (allows admin overrides)
  const filter = this.getFilter();
  if (!('isDeleted' in filter)) {
    this.where({ isDeleted: false });
  }
});

export const Employee: Model<IEmployeeDocument> = mongoose.model<IEmployeeDocument>(
  'Employee',
  EmployeeSchema
);
