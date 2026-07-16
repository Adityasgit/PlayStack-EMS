'use client';

import { useAuth } from '@/context/AuthContext';
import { useEmployee, useUpdateEmployee } from '@/hooks/useEmployees';
import { AvatarUpload } from '@/components/employees/AvatarUpload';
import { StatusBadge } from '@/components/employees/StatusBadge';
import { RoleBadge } from '@/components/employees/RoleBadge';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatDate, getInitials } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Loader2, Mail, Phone, Calendar, Building2 } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { data, isLoading } = useEmployee(user?.id);
  const updateMutation = useUpdateEmployee(user?.id || '');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');

  useEffect(() => {
    if (data?.data) {
      setName(data.data.name);
      setPhone(data.data.phone || '');
      setProfileImage(data.data.profileImage || '');
    }
  }, [data]);

  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  const emp = data?.data;
  if (!emp) return null;

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ name, phone, profileImage });
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    }
  };

  return (
    <div>
      <PageHeader title="My Profile" subtitle="View and edit your profile information" />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <AvatarUpload
                currentImage={emp.profileImage}
                name={emp.name}
                onUpload={setProfileImage}
                size="lg"
              />
              <div>
                <h2 className="text-xl font-bold">{emp.name}</h2>
                <p className="text-muted-foreground">{emp.designation}</p>
                <div className="flex gap-2 mt-2">
                  <StatusBadge status={emp.status} />
                  <RoleBadge role={emp.role} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2"><Mail className="h-4 w-4 text-primary" /></div>
              <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium">{emp.email}</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2"><Phone className="h-4 w-4 text-blue-500" /></div>
              <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium">{emp.phone || 'Not provided'}</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2"><Building2 className="h-4 w-4 text-emerald-500" /></div>
              <div><p className="text-xs text-muted-foreground">Department</p><p className="text-sm font-medium">{emp.department}</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-orange-500/10 p-2"><Calendar className="h-4 w-4 text-orange-500" /></div>
              <div><p className="text-xs text-muted-foreground">Joined</p><p className="text-sm font-medium">{formatDate(emp.joiningDate)}</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Form */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Edit Profile</h3>
            <div className="space-y-3">
              <div>
                <Label>Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" />
              </div>
            </div>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
