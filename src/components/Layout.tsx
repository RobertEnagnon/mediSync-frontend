import React, { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent } from './ui/sheet';
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
      {/* Menu desktop */}
      <div className="lg:block hidden">
        <AppSidebar open={open} setOpen={setOpen} />
      </div>

      {/* Menu mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-muted-foreground hover:bg-accent"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Menu mobile slide-out */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <AppSidebar open={open} setOpen={setOpen} />
        </SheetContent>
      </Sheet>

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