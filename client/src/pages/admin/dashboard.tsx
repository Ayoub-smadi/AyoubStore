import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Bus, Navigation, Activity, TrendingUp, AlertCircle, MapPin } from "lucide-react";
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
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold font-display text-foreground tracking-tight">
              {isRtl ? "لوحة التحكم" : "Fleet Overview"}
            </h2>
            <p className="text-muted-foreground mt-1 text-lg">
              {isRtl ? "مراقبة حالة الأسطول والطلاب في الوقت الفعلي." : "Real-time monitoring of fleet and student safety."}
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold border border-primary/20">
            <TrendingUp className="w-5 h-5" />
            {isRtl ? "تحديث مباشر" : "Live Updates"}
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 rounded-3xl border-border/50 shadow-xl shadow-primary/5 overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-secondary/10 px-8 py-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold font-display flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-primary" />
                  {isRtl ? "خريطة التتبع المباشر" : "Live Fleet Tracking"}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
                    {isRtl ? "نشط" : "Active"}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    {isRtl ? "غير نشط" : "Inactive"}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[500px] relative z-0">
              <BusMap buses={buses || []} zoom={13} />
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="rounded-3xl border-border/50 shadow-lg overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold font-display flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  {isRtl ? "تنبيهات النظام" : "System Alerts"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-6 pb-6">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Bus className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-amber-900 dark:text-amber-400">
                      {isRtl ? "صيانة مجدولة" : "Scheduled Maintenance"}
                    </h4>
                    <p className="text-xs text-amber-800/70 dark:text-amber-400/70 mt-1">
                      {isRtl ? "الحافلة B-12 تحتاج فحصاً دورياً." : "Bus B-12 requires routine inspection."}
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-primary">
                      {isRtl ? "طلاب جدد" : "New Registrations"}
                    </h4>
                    <p className="text-xs text-primary/70 mt-1">
                      {isRtl ? "5 طلاب ينتظرون تخصيص حافلات." : "5 students waiting for bus assignment."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/50 shadow-lg bg-gradient-to-br from-primary to-indigo-700 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <CardContent className="p-8 relative z-10">
                <h3 className="text-2xl font-bold font-display mb-2">{isRtl ? "تحسين المسار" : "Route Optimizer"}</h3>
                <p className="text-primary-foreground/80 text-sm leading-relaxed mb-6">
                  {isRtl ? "ذكاء اصطناعي لتقليل وقت الرحلة بنسبة 15%." : "AI-powered route planning to reduce travel time by 15%."}
                </p>
                <button className="w-full py-3 bg-white text-primary font-bold rounded-xl shadow-xl hover:bg-white/90 transition-all active:scale-95">
                  {isRtl ? "تفعيل الآن" : "Optimize Now"}
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
