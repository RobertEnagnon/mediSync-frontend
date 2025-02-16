import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";

// Layout principal de l'application
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;