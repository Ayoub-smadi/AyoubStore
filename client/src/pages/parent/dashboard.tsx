import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { BusMap } from "@/components/map/bus-map";
import { Bell, MapPin, Clock, ShieldCheck, User, Bus as BusIcon, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useParentStudent } from "@/hooks/use-data";
import { useTranslation } from "@/hooks/use-translation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ParentDashboard() {
  const { user } = useAuth();
  const { t, isRtl } = useTranslation();
  const { data: parentData, isLoading } = useParentStudent();
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
      queryClient.invalidateQueries({ queryKey: ["/api/parent/student"] });
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const myChild = parentData?.student;
  const childBus = parentData?.bus;
  const driver = parentData?.driver;

  if (!myChild) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto mt-20 text-center space-y-6">
          <h2 className="text-2xl font-bold font-display">{isRtl ? "ربط حساب الطالب" : "Link Student Account"}</h2>
          <p className="text-muted-foreground">
            {isRtl ? "الرجاء إدخال رقم الطالب لربطه بحسابك" : "Please enter student number to link to your account"}
          </p>
          <div className="flex gap-2">
            <Input 
              placeholder={isRtl ? "رقم الطالب" : "Student Number"} 
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              className="rounded-xl"
            />
            <Button 
              onClick={() => linkMutation.mutate(studentNumber)}
              disabled={linkMutation.isPending}
              className="rounded-xl"
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

  // Calculate distance if bus location is available
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const distance = childBus?.currentLat && childBus?.currentLng 
    ? calculateDistance(childBus.currentLat, childBus.currentLng, homeLocation[0], homeLocation[1])
    : null;

  const eta = distance ? Math.round(distance * 3) : null; // Rough estimate: 3 mins per km

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-display text-foreground">{isRtl ? "لوحة تحكم ولي الأمر" : "Parent Dashboard"}</h2>
        <p className="text-muted-foreground mt-1">
          {isRtl ? `تتبع مباشر وتنبيهات لـ ${myChild.fullName}` : `Live tracking and alerts for ${myChild.fullName}`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Student Info Card */}
        <Card className="lg:col-span-1 rounded-2xl border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-border/50">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {isRtl ? "بيانات الابن" : "Child Details"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{isRtl ? "الاسم" : "Name"}</p>
              <p className="text-lg font-bold text-foreground">{myChild.fullName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{isRtl ? "الصف" : "Grade"}</p>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                <p className="font-semibold">{myChild.grade}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{isRtl ? "الباص" : "Bus"}</p>
              <div className="flex items-center gap-2">
                <BusIcon className="w-4 h-4 text-primary" />
                <p className="font-semibold">{childBus?.busNumber || (isRtl ? "غير معين" : "Not assigned")}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{isRtl ? "اسم السائق" : "Driver Name"}</p>
              <p className="font-semibold">{driver?.name || (isRtl ? "غير متوفر" : "Not available")}</p>
            </div>
            {childBus && (
              <Badge variant={childBus.status === 'active' ? 'default' : 'secondary'} className="w-full justify-center py-1 rounded-lg">
                {childBus.status === 'active' ? (isRtl ? "الباص في الطريق" : "Bus en route") : (isRtl ? "غير نشط" : "Inactive")}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Map and ETA Section */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="rounded-2xl border-border/50 shadow-sm bg-gradient-to-br from-primary to-indigo-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white/80">{isRtl ? "وقت الوصول المتوقع" : "ETA"}</p>
                    <p className="text-xl font-bold">{eta ? `${eta} ${isRtl ? "دقائق" : "mins"}` : "--"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{isRtl ? "المسافة" : "Distance"}</p>
                    <p className="text-xl font-bold">{distance ? `${distance.toFixed(1)} km` : "--"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <Bell className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{isRtl ? "آخر إشعار" : "Last Alert"}</p>
                    <p className="text-sm font-bold truncate">{isRtl ? "الباص اقترب من منزلك" : "Bus near home"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-sm border border-border/50 h-[400px] relative z-0">
            <BusMap 
              buses={childBus ? [childBus] : []} 
              center={mapCenter} 
              zoom={14} 
              showGeofence={true}
              homeLocation={homeLocation}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  {isRtl ? "إعدادات الأمان" : "Safety Settings"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span>{isRtl ? "تنبيه الاقتراب (1 كم)" : "Proximity Alert (1km)"}</span>
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/5">{isRtl ? "مفعل" : "Active"}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>{isRtl ? "تنبيه الوصول" : "Arrival Alert"}</span>
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/5">{isRtl ? "مفعل" : "Active"}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  {isRtl ? "الإشعارات الأخيرة" : "Recent Notifications"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs p-2 rounded-lg bg-muted/50 border border-border/50">
                   <p className="font-semibold">{isRtl ? "الباص في الطريق" : "Bus en route"}</p>
                   <p className="text-muted-foreground">10:30 AM</p>
                </div>
                <div className="text-xs p-2 rounded-lg bg-muted/50 border border-border/50 opacity-60">
                   <p className="font-semibold">{isRtl ? "تم تسجيل الحضور" : "Attendance marked"}</p>
                   <p className="text-muted-foreground">07:45 AM</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
