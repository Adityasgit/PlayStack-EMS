'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateEmployee, useEmployees, useUpdateEmployee } from '@/hooks/useEmployees';
import { useAuth } from '@/context/AuthContext';
import { AvatarUpload } from './AvatarUpload';
import { DEPARTMENTS, ROLES, type IEmployee } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Loader2 } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8).optional(),
  department: z.string().min(1),
  designation: z.string().min(2),
  salary: z.number().min(0).optional(),
  joiningDate: z.string().min(1),
  status: z.enum(['active', 'inactive']).default('active'),
  role: z.enum(['super_admin', 'hr_manager', 'employee']).default('employee'),
  reportingManager: z.string().optional(),
  profileImage: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EmployeeFormProps {
  mode: 'create' | 'edit';
  employee?: IEmployee;
}

const STEPS = ['Personal', 'Employment', 'Hierarchy', 'Review'];

export function EmployeeForm({ mode, employee }: EmployeeFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [profileImage, setProfileImage] = useState(employee?.profileImage || '');

  const { data: allEmps } = useEmployees({ limit: '200' });
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee(employee?._id || '');

  const { register, handleSubmit, watch, trigger, formState: { errors }, setValue } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: employee?.name || '',
      email: employee?.email || '',
      phone: employee?.phone || '',
      department: employee?.department || '',
      designation: employee?.designation || '',
      salary: employee?.salary || 0,
      joiningDate: employee?.joiningDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      status: employee?.status || 'active',
      role: employee?.role || 'employee',
      reportingManager: typeof employee?.reportingManager === 'object' ? (employee?.reportingManager as any)?._id : employee?.reportingManager || '',
    },
  });

  const formValues = watch();

  const STEP_FIELDS: Record<number, string[]> = {
    0: ['name', 'email'],
    1: ['department', 'designation', 'joiningDate'],
    2: ['role'],
    3: [],
  };

  const goNext = async () => {
    const valid = await trigger(STEP_FIELDS[currentStep] as any);
    if (valid) setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (data: FormData) => {
    const payload = { ...data, profileImage, salary: Number(data.salary) || 0 };
    try {
      if (mode === 'create') {
        if (!payload.password) { toast.error('Password is required'); return; }
        await createMutation.mutateAsync(payload);
        toast.success('Employee created successfully');
      } else {
        const { password, email, ...updatePayload } = payload;
        await updateMutation.mutateAsync(updatePayload);
        toast.success('Employee updated successfully');
      }
      router.push('/employees');
    } catch (err: any) {
      toast.error(err.message || 'Failed');
    }
  };

  const managers = (allEmps?.data || []).filter((e) => e._id !== employee?._id);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center flex-1 last:flex-0">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                  i < currentStep && 'bg-primary text-primary-foreground',
                  i === currentStep && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                  i > currentStep && 'bg-muted text-muted-foreground border border-border',
                )}
              >
                {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className="text-xs mt-1 text-muted-foreground whitespace-nowrap">{step}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-0.5 mx-3 mb-5 transition-colors', i < currentStep ? 'bg-primary' : 'bg-border')} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="glass-card rounded-2xl p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <div className="flex justify-center mb-4">
                    <AvatarUpload currentImage={profileImage} name={formValues.name || 'New'} onUpload={setProfileImage} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name *</Label>
                      <Input {...register('name')} placeholder="John Doe" />
                      {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input {...register('email')} type="email" placeholder="john@company.com" disabled={mode === 'edit'} />
                      {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                    </div>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input {...register('phone')} placeholder="+1 (555) 123-4567" />
                  </div>
                  {mode === 'create' && (
                    <div>
                      <Label>Password *</Label>
                      <Input {...register('password')} type="password" placeholder="Min. 8 characters" />
                      {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
                    </div>
                  )}
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Employment Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Department *</Label>
                      <select {...register('department')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                        <option value="">Select department</option>
                        {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      {errors.department && <p className="text-xs text-destructive mt-1">{errors.department.message}</p>}
                    </div>
                    <div>
                      <Label>Designation *</Label>
                      <Input {...register('designation')} placeholder="Senior Engineer" />
                      {errors.designation && <p className="text-xs text-destructive mt-1">{errors.designation.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Salary</Label>
                      <Input {...register('salary', { valueAsNumber: true })} type="number" min="0" placeholder="0" />
                    </div>
                    <div>
                      <Label>Joining Date *</Label>
                      <Input {...register('joiningDate')} type="date" />
                    </div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <select {...register('status')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Hierarchy & Role</h3>
                  <div>
                    <Label>Role *</Label>
                    <select
                      {...register('role')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="employee">Employee</option>
                      <option value="hr_manager">HR Manager</option>
                      {user?.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                    </select>
                  </div>
                  <div>
                    <Label>Reporting Manager</Label>
                    <select {...register('reportingManager')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">No manager (top level)</option>
                      {managers.map((emp) => (
                        <option key={emp._id} value={emp._id}>{emp.name} — {emp.designation}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Review & Submit</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Name:</span> {formValues.name}</div>
                    <div><span className="text-muted-foreground">Email:</span> {formValues.email}</div>
                    <div><span className="text-muted-foreground">Department:</span> {formValues.department}</div>
                    <div><span className="text-muted-foreground">Designation:</span> {formValues.designation}</div>
                    <div><span className="text-muted-foreground">Role:</span> {formValues.role?.replace('_', ' ')}</div>
                    <div><span className="text-muted-foreground">Status:</span> {formValues.status}</div>
                    <div><span className="text-muted-foreground">Joining:</span> {formValues.joiningDate}</div>
                    <div><span className="text-muted-foreground">Salary:</span> ${formValues.salary || 0}</div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={goBack} disabled={currentStep === 0}>
              Back
            </Button>
            {currentStep < STEPS.length - 1 ? (
              <Button type="button" onClick={goNext}>Next</Button>
            ) : (
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Create Employee' : 'Save Changes'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
