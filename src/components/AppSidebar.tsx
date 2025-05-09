import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Clock,
  Settings,
  Bell,
  FileText,
  Menu,
  LogOut,
  User,
  X,
  Receipt,
  FileBox,
  CalendarDays
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    title: 'Tableau de bord',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Calendrier',
    href: '/calendar',
    icon: Calendar,
  },
  {
    title: 'Rendez-vous',
    href: '/appointments',
    icon: Clock,
  },
  {
    title: 'Historique',
    href: '/appointment-history',
    icon: FileText,
  },
  {
    title: 'Clients',
    href: '/clients',
    icon: Users,
  },
  {
    title: 'Documents',
    href: '/documents',
    icon: FileBox,
  },
  {
    title: 'Événements',
    href: '/events',
    icon: CalendarDays,
  },
  {
    title: 'Factures',
    href: '/invoices',
    icon: Receipt,
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
  {
    title: 'Paramètres',
    href: '/settings',
    icon: Settings,
  },
];

export const AppSidebar = ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("auth-storage")
    localStorage.removeItem("token")
    navigate('/login');
  };

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profileImage} alt={user?.firstName} />
            <AvatarFallback>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link to="/" className="flex items-center gap-2 border-t-2">
          <img src="/logo.png" alt="Logo" className="h-[80%] w-[80%]" />
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-colors',
                pathname === item.href ? 'bg-accent' : 'transparent'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <UserMenu />
      </div>
    </div>
  );

  return (
    <div className="h-full w-72 border-r bg-background">
      <SidebarContent />
    </div>
  );
};

export default AppSidebar;