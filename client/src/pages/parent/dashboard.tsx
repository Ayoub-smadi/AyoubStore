import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { BusMap } from "@/components/map/bus-map";
import { Bell, MapPin, Clock, ShieldCheck, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useBuses, useStudents } from "@/hooks/use-data";
import { useTranslation } from "@/hooks/use-translation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ParentDashboard() {
  const { user } = useAuth();
  const { t, isRtl } = useTranslation();
  const { data: students } = useStudents();
  const { data: buses } = useBuses({ refetchInterval: 5000 });
  const [studentNumber, setStudentNumber] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const linkMutation = useMutation({
    mutationFn: async (number: string) => {
      await apiRequest("POST", "/api/students/link", { 
        studentNumber: number, 
        parentId: user?.id 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({ title: isRtl ? "تم الربط بنجاح" : "Linked successfully" });
      setStudentNumber("");
    },
    onError: () => {
      toast({ 
        title: isRtl ? "رقم الطالب غير صحيح" : "Invalid student number", 
        variant: "destructive" 
      });
    }
  });

  const myChild = students?.find(s => s.parentId === user?.id);
  const childBus = buses?.find(b => b.id === myChild?.busId);

  if (!myChild) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto mt-20 text-center space-y-6">
          <h2 className="text-2xl font-bold">{isRtl ? "ربط حساب الطالب" : "Link Student Account"}</h2>
          <p className="text-muted-foreground">
            {isRtl ? "الرجاء إدخال رقم الطالب لربطه بحسابك" : "Please enter student number to link to your account"}
          </p>
          <div className="flex gap-2">
            <Input 
              placeholder={isRtl ? "رقم الطالب" : "Student Number"} 
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
            />
            <Button 
              onClick={() => linkMutation.mutate(studentNumber)}
              disabled={linkMutation.isPending}
            >
              {isRtl ? "ربط" : "Link"}
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const homeLocation: [number, number] = myChild?.homeLat && myChild?.homeLng 
    ? [myChild.homeLat, myChild.homeLng] 
    : [40.7100, -74.0010];

  const mapCenter: [number, number] = childBus?.currentLat && childBus?.currentLng 
    ? [childBus.currentLat, childBus.currentLng] 
    : [40.7125, -74.0030];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-display text-foreground">{t("sidebar.track")}</h2>
        <p className="text-muted-foreground mt-1">
          {isRtl ? `تتبع مباشر وتنبيهات لـ ${myChild?.fullName || "Emma Thompson"}` : `Live tracking and geofence alerts for ${myChild?.fullName || "Emma Thompson"}`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        {/* Info Panel */}
        <div className="flex flex-col gap-6">
          <div className="bg-gradient-to-br from-primary to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">{isRtl ? "الحالة الحالية" : "Current Status"}</p>
                <h3 className="text-2xl font-bold font-display tracking-tight">
                  {childBus ? `${isRtl ? "على الحافلة" : "On Bus"} ${childBus.busNumber}` : (isRtl ? "لم تبدأ الرحلة بعد" : "No active trip")}
                </h3>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/20">
                <span className="text-white/80 text-sm">{isRtl ? "الوصول المتوقع" : "Estimated Arrival"}</span>
                <span className="font-bold flex items-center gap-1"><Clock className="w-4 h-4"/> 3:45 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm">{isRtl ? "المسافة إلى المنزل" : "Distance to Home"}</span>
                <span className="font-bold">1.2 miles</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-6 flex-1 shadow-sm">
            <h4 className="font-bold font-display mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              {t("sidebar.alerts")}
            </h4>
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-start gap-3">
              <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              <div>
                <p className="font-semibold text-sm">{isRtl ? "نطاق المنزل (1كم)" : "Home Radius (1km)"}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isRtl ? `سيتم إخطارك عندما تدخل الحافلة ${childBus?.busNumber || ""} هذه المنطقة.` : `You will be notified when Bus ${childBus?.busNumber || ""} enters this area.`}
                </p>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-6 border-2 font-semibold rounded-xl gap-2">
              <Bell className="w-4 h-4" /> {isRtl ? "إدارة إعدادات التنبيه" : "Manage Alert Settings"}
            </Button>
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-sm border border-border/50 relative z-0">
          <BusMap 
            buses={childBus ? [childBus] : []} 
            center={mapCenter} 
            zoom={14} 
            showGeofence={true}
            homeLocation={homeLocation}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
