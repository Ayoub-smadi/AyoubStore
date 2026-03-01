import { Bus, Users, Map, LayoutDashboard, Settings, LogOut, Bell } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { useTranslation } from "@/hooks/use-translation";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const { t } = useTranslation();

  const getLinksForRole = () => {
    switch (user?.role) {
      case "admin":
        return [
          { title: t("sidebar.dashboard"), url: "/admin", icon: LayoutDashboard },
          { title: t("sidebar.map"), url: "/admin/map", icon: Map },
          { title: t("sidebar.students"), url: "/admin/students", icon: Users },
          { title: t("sidebar.buses"), url: "/admin/buses", icon: Bus },
          { title: t("sidebar.settings"), url: "/admin/settings", icon: Settings },
        ];
      case "parent":
        return [
          { title: t("sidebar.overview"), url: "/parent", icon: LayoutDashboard },
          { title: t("sidebar.track"), url: "/parent", icon: Map },
          { title: t("sidebar.alerts"), url: "/parent", icon: Bell },
        ];
      case "driver":
        return [
          { title: t("sidebar.mytrip"), url: "/driver", icon: Map },
          { title: t("sidebar.attendance"), url: "/driver/attendance", icon: Users },
        ];
      default:
        return [];
    }
  };

  const links = getLinksForRole();

  return (
    <Sidebar className="border-r border-border/50 bg-sidebar">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <Bus className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-sidebar-foreground">{t("nav.brand")}</h2>
            <p className="text-xs text-sidebar-foreground/60 capitalize tracking-wider font-medium">{user?.role} {t("sidebar.portal")}</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs font-semibold uppercase tracking-wider mb-2">
            {t("sidebar.menu")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    tooltip={item.title}
                    className="mb-1 rounded-xl transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold"
                  >
                    <Link href={item.url} className="flex items-center gap-3 py-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/10">
        <div className="flex items-center gap-3 px-2 py-3 bg-sidebar-accent/50 rounded-2xl mb-4">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold font-display shadow-md">
            {user?.name.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-sidebar-foreground">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email || `@${user?.username}`}</p>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => logout()}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
            >
              <LogOut className="h-5 w-5" />
              <span>{t("sidebar.logout")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
