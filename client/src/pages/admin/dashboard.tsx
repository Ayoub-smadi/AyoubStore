import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Bus, Navigation, Activity } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useBuses, useStats } from "@/hooks/use-data";
import { useTranslation } from "@/hooks/use-translation";
import { BusMap } from "@/components/map/bus-map";

export default function AdminDashboard() {
  const { data: stats } = useStats();
  const { data: buses } = useBuses({ refetchInterval: 5000 });
  const { t, isRtl } = useTranslation();

  const statCards = [
    { title: t("sidebar.students"), value: stats?.totalStudents || 0, icon: Users, color: "text-blue-500" },
    { title: isRtl ? "أولياء الأمور" : "Parents", value: stats?.totalParents || 0, icon: Activity, color: "text-emerald-500" },
    { title: isRtl ? "السائقين" : "Drivers", value: stats?.totalDrivers || 0, icon: Navigation, color: "text-amber-500" },
    { title: t("sidebar.buses"), value: stats?.totalBuses || 0, icon: Bus, color: "text-primary" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold font-display text-foreground">{t("sidebar.dashboard")}</h2>
          <p className="text-muted-foreground mt-1">{isRtl ? "نظرة عامة على أسطول الحافلات والطلاب." : "System overview and live fleet tracking."}</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, i) => (
            <Card key={i} className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{stat.title}</CardTitle>
                <stat.icon className={`w-5 h-5 ${stat.color} transition-transform group-hover:scale-110`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-display">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-secondary/20 border-b border-border/50">
            <CardTitle className="font-display font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              {isRtl ? "تتبع الأسطول المباشر" : "Live Fleet Tracking"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[500px] relative z-0">
            <BusMap buses={buses || []} zoom={13} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
