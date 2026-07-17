'use client';

import { usePathname } from 'next/navigation';
import { useCommandStore } from '@/store/commandStore';
import { Button } from '@/components/ui/button';
import { Search, Bell } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/employees': 'Employees',
  '/employees/new': 'Create Employee',
  '/organization': 'Organization',
  '/kanban': 'Kanban Board',
  '/tasks': 'Tasks',
  '/activity': 'Activity Logs',
  '/profile': 'My Profile',
};

export function Topbar() {
  const pathname = usePathname();
  const { setOpen } = useCommandStore();

  // Match title from path
  let title = 'EMS';
  for (const [path, t] of Object.entries(PAGE_TITLES)) {
    if (pathname === path || pathname.startsWith(path + '/')) {
      title = t;
      break;
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-6">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Search trigger (Cmd+K) */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="hidden sm:flex items-center gap-2 h-9 text-muted-foreground"
        >
          <Search className="h-4 w-4" />
          <span className="text-sm">Search...</span>
          <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            3
          </span>
        </Button>
      </div>
    </header>
  );
}
