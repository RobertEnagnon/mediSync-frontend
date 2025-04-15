import React, { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

// Layout principal de l'application
export const Layout = ({ children }: LayoutProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen relative">
      <div className="lg:block hidden">
        <AppSidebar open={open} setOpen={setOpen} />
       
      </div>
      <div className="lg:hidden absolute top-1 left-1 z-50">
        {/* <AppSidebar open={open} setOpen={setOpen} /> */}
        <Button
          onClick={() => setOpen(!open)}
          variant="ghost"
          className="px-2 py-2"
        >
          {open ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;