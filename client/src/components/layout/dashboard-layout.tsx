import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { ThemeToggle } from "../ui/theme-toggle";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || !user) return <div className="h-screen w-screen flex items-center justify-center bg-background text-primary"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "5rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={style}>
      <div className="flex min-h-screen w-full bg-background/95">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen w-full relative">
          <header className="sticky top-0 z-40 h-20 w-full flex items-center justify-between px-6 bg-background/80 backdrop-blur-md border-b border-border/40">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-secondary/50 rounded-xl w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold font-display text-foreground">Welcome back, {user.name.split(' ')[0]}</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">Here's what's happening today.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative rounded-full w-10 h-10 bg-secondary/50 hover:bg-secondary transition-colors">
                <Bell className="h-5 w-5 text-foreground/80" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full animate-pulse"></span>
              </Button>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 w-full overflow-y-auto p-6 md:p-8">
            <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
