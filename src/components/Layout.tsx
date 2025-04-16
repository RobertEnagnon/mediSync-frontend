import React, { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';
import NotificationCenter  from './Notifications/NotificationCenter';
import { useNotifications } from '@/hooks/useNotifications';

interface LayoutProps {
  children: React.ReactNode;
}

// Layout principal de l'application
export const Layout = ({ children }: LayoutProps) => {
  const [open, setOpen] = useState(false);
  // Utiliser le hook de notifications
  useNotifications();

  return (
    <div className="flex min-h-screen relative">
      <div className="lg:block hidden">
        <AppSidebar open={open} setOpen={setOpen} />
      </div>
      <div className="lg:hidden absolute top-1 left-1 z-50">
        <AppSidebar open={open} setOpen={setOpen} />
      </div>
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto p-6">
          <div className="fixed top-4 right-4 z-50">
            <NotificationCenter />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;