'use client';

import { useState, useEffect } from 'react';
import { useUpdateEmployee, useReportees } from '@/hooks/useEmployees';
import { useAuth } from '@/context/AuthContext';
import { AvatarUpload } from './AvatarUpload';
import { StatusBadge } from './StatusBadge';
import { RoleBadge } from './RoleBadge';
import { formatDate, getInitials, cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Mail, Phone, Calendar, MapPin, Briefcase } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';

interface EmployeeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: any;
}

export function EmployeeSheet({ open, onOpenChange, employee }: EmployeeSheetProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const updateMutation = useUpdateEmployee(employee?._id || '');

  const isOwn = user?.id === employee?._id;
  const canEdit = user?.role === 'super_admin' || user?.role === 'hr_manager' || isOwn;

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setPhone(employee.phone || '');
      setProfileImage(employee.profileImage || '');
    }
  }, [employee]);

  if (!employee) return null;

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ name, phone, profileImage });
      toast.success('Employee updated');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-4">
            <AvatarUpload
              currentImage={employee.profileImage}
              name={employee.name}
              onUpload={(url) => setProfileImage(url)}
              size="lg"
            />
            <div>
              <SheetTitle className="text-xl">{employee.name}</SheetTitle>
              <SheetDescription>{employee.designation} · {employee.department}</SheetDescription>
              <div className="flex gap-2 mt-1">
                <StatusBadge status={employee.status} />
                <RoleBadge role={employee.role} />
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
            <TabsTrigger value="reportees" className="flex-1">Reportees</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Employee ID</Label>
                <p className="text-sm font-mono">{employee.employeeId}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {employee.email}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Phone</Label>
                {canEdit ? (
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-9 text-sm" />
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    {employee.phone || 'Not provided'}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Joining Date</Label>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatDate(employee.joiningDate)}
                </div>
              </div>
              {employee.salary !== undefined && user?.role !== 'employee' && (
                <div>
                  <Label className="text-xs text-muted-foreground">Salary</Label>
                  <p className="text-sm font-medium">${employee.salary?.toLocaleString()}</p>
                </div>
              )}
            </div>

            {canEdit && (
              <Button onClick={handleSave} disabled={updateMutation.isPending} className="w-full">
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            )}
          </TabsContent>

          <TabsContent value="reportees">
            <ReporteeList managerId={employee._id} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function ReporteeList({ managerId }: { managerId: string }) {
  const { data, isLoading } = useReportees(managerId);

  if (isLoading) return <LoadingSpinner size="sm" className="py-8" />;
  if (!data?.data?.length) {
    return <EmptyState title="No direct reports" className="py-8" />;
  }

  return (
    <div className="space-y-2 mt-4">
      {data.data.map((emp: any) => (
        <div key={emp._id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {getInitials(emp.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{emp.name}</p>
            <p className="text-xs text-muted-foreground">{emp.designation}</p>
          </div>
          <StatusBadge status={emp.status} />
        </div>
      ))}
    </div>
  );
}
