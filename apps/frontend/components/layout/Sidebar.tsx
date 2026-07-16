'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebarStore } from '@/store/sidebarStore';
import { useAuth } from '@/context/AuthContext';
import { cn, getInitials } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Network,
  Columns3,
  UserCircle,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Shield,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Employees', href: '/employees', icon: Users },
  { label: 'Org Chart', href: '/organization', icon: Network },
  { label: 'Kanban', href: '/kanban', icon: Columns3, roles: ['super_admin', 'hr_manager'] },
  { label: 'Profile', href: '/profile', icon: UserCircle, roles: ['employee'] },
];

export function Sidebar() {
  const { collapsed, toggle } = useSidebarStore();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const filteredItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  return (
    <TooltipProvider delay={0}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative flex h-full flex-col border-r border-border bg-card overflow-hidden shrink-0"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 h-16">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
            P
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-lg font-bold tracking-tight whitespace-nowrap"
              >
                PlayStack
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger>
                  <button
                    onClick={() => router.push(item.href)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" sideOffset={8}>
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        <Separator />

        {/* User section */}
        <div className="px-2 py-3 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={user?.profileImage || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
                {user ? getInitials(user.name) : '?'}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate capitalize">{user?.role?.replace('_', ' ')}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggle}
          className="absolute top-4 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground hover:text-foreground transition-colors shadow-sm"
        >
          {collapsed ? <ChevronsRight className="h-3 w-3" /> : <ChevronsLeft className="h-3 w-3" />}
        </button>
      </motion.aside>
    </TooltipProvider>
  );
}
