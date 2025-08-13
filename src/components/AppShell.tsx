import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";

export const AppShell = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (!user) {
    return <Outlet />;
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        {/* Mobile header with trigger */}
        {isMobile && (
          <div className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center bg-card border-b border-border px-4">
            <SidebarTrigger className="mr-2 p-2">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle sidebar</span>
            </SidebarTrigger>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">F</span>
              </div>
              <span className="font-bold text-sm bg-gradient-primary bg-clip-text text-transparent">
                FocusFlow
              </span>
            </div>
          </div>
        )}
        
        <main className={`flex-1 overflow-auto ${isMobile ? 'mt-12' : ''}`}>
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};