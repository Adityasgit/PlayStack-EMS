'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCommandStore } from '@/store/commandStore';
import { useTheme } from 'next-themes';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/lib/utils';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { LayoutDashboard, Users, Network, Columns3, Moon, Sun, Plus, CheckSquare, Activity } from 'lucide-react';

export function CommandPalette() {
  const { open, setOpen } = useCommandStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const { data } = useEmployees({ limit: '50' });
  const employees = data?.data || [];

  // Global keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  const isAdmin = user?.role === 'super_admin' || user?.role === 'hr_manager';

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search employees, navigate, or run actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          {isAdmin && (
            <CommandItem
              onSelect={() => { router.push('/employees/new'); setOpen(false); }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Employee
            </CommandItem>
          )}
          <CommandItem
            onSelect={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setOpen(false); }}
          >
            {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => { router.push('/dashboard'); setOpen(false); }}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          {isAdmin && (
            <CommandItem onSelect={() => { router.push('/employees'); setOpen(false); }}>
              <Users className="mr-2 h-4 w-4" />
              Employees
            </CommandItem>
          )}
          <CommandItem onSelect={() => { router.push('/organization'); setOpen(false); }}>
            <Network className="mr-2 h-4 w-4" />
            Org Chart
          </CommandItem>
          <CommandItem onSelect={() => { router.push('/tasks'); setOpen(false); }}>
            <CheckSquare className="mr-2 h-4 w-4" />
            Tasks
          </CommandItem>
          {isAdmin && (
            <CommandItem onSelect={() => { router.push('/kanban'); setOpen(false); }}>
              <Columns3 className="mr-2 h-4 w-4" />
              Kanban Board
            </CommandItem>
          )}
          {isAdmin && (
            <CommandItem onSelect={() => { router.push('/activity'); setOpen(false); }}>
              <Activity className="mr-2 h-4 w-4" />
              Activity Logs
            </CommandItem>
          )}
        </CommandGroup>

        {isAdmin && employees.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Employees">
              {employees.slice(0, 15).map((emp) => (
                <CommandItem
                  key={emp._id}
                  onSelect={() => { router.push('/employees'); setOpen(false); }}
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary mr-2">
                    {getInitials(emp.name)}
                  </div>
                  <span>{emp.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{emp.department}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
