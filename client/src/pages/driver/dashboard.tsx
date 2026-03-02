import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { MapPin, UserCheck, Play, Square, Navigation } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useBuses, useUpdateBusLocation, useStudents } from "@/hooks/use-data";
import { useTranslation } from "@/hooks/use-translation";
import { BusMap } from "@/components/map/bus-map";

export default function DriverDashboard() {
  const { user } = useAuth();
  const { data: buses } = useBuses();
  const { data: allStudents } = useStudents();
  const updateLocation = useUpdateBusLocation();
  const { t, isRtl } = useTranslation();
  
  const [tripActive, setTripActive] = useState(false);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Find the bus assigned to this driver
  const myBus = buses?.find(b => b.driverId === user?.id);
  
  // Filter students assigned to this bus
  const myStudents = allStudents?.filter(s => s.busId === myBus?.id) || [];
  
  // Mock school location
  const schoolLocation: [number, number] = [31.95, 35.91]; // Amman coordinates
  const homeLocation: [number, number] = myStudents[0]?.homeLat && myStudents[0]?.homeLng 
    ? [myStudents[0].homeLat, myStudents[0].homeLng]
    : [31.97, 35.93];

  useEffect(() => {
    if (tripActive && myBus) {
      let step = 0;
      const totalSteps = 20; // Number of steps to reach student
      
      simulationIntervalRef.current = setInterval(() => {
        step = (step + 1) % (totalSteps * 2);
        
        let currentLat, currentLng;
        
        if (step <= totalSteps) {
          // Moving from school to home
          const progress = step / totalSteps;
          currentLat = schoolLocation[0] + (homeLocation[0] - schoolLocation[0]) * progress;
          currentLng = schoolLocation[1] + (homeLocation[1] - schoolLocation[1]) * progress;
        } else {
          // Moving from home back to school
          const progress = (step - totalSteps) / totalSteps;
          currentLat = homeLocation[0] + (schoolLocation[0] - homeLocation[0]) * progress;
          currentLng = homeLocation[1] + (schoolLocation[1] - homeLocation[1]) * progress;
        }

        updateLocation.mutate({
          id: myBus.id,
          lat: currentLat,
          lng: currentLng
        });
      }, 4000);
    } else {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    }
    
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [tripActive, myBus]);

  const mapCenter: [number, number] = myBus?.currentLat && myBus?.currentLng 
    ? [myBus.currentLat, myBus.currentLng] 
    : schoolLocation;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold font-display text-foreground">{t("sidebar.mytrip")}</h2>
            <p className="text-muted-foreground mt-1">
              {myBus ? `Bus ${myBus.busNumber}` : "No bus assigned"}
            </p>
          </div>
          
          <Button 
            onClick={() => setTripActive(!tripActive)}
            size="lg"
            disabled={!myBus}
            className={`rounded-xl font-bold text-base px-8 shadow-lg hover-elevate transition-all ${
              tripActive 
                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30' 
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30 text-white'
            }`}
          >
            {tripActive ? (
              <><Square className="w-5 h-5 mr-2 fill-current" /> {isRtl ? "إيقاف الرحلة" : "End Trip"}</>
            ) : (
              <><Play className="w-5 h-5 mr-2 fill-current" /> {isRtl ? "بدأ الرحلة" : "Start Route"}</>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl overflow-hidden shadow-sm border border-border/50 h-[400px] relative z-0">
              <BusMap 
                buses={myBus ? [myBus] : []} 
                center={mapCenter} 
                zoom={13}
                homeLocation={homeLocation}
                schoolLocation={schoolLocation}
              />
            </div>

            {tripActive && (
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-top-4 fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary animate-ping"></div>
                  <p className="font-semibold text-primary">{isRtl ? "البث المباشر للموقع نشط" : "GPS Location Broadcasting Active"}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border/50 flex items-center justify-between bg-secondary/20">
              <h3 className="font-bold font-display text-lg flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                {isRtl ? "قائمة الطلاب" : "Passenger Manifest"}
              </h3>
            </div>

            <div className="divide-y divide-border/50 flex-1 overflow-auto">
              {myStudents.map((student) => (
                <div 
                  key={student.id} 
                  className={`p-5 flex flex-col gap-3 transition-colors ${!tripActive ? 'opacity-60 grayscale' : 'hover:bg-secondary/10'}`}
                >
                  <div>
                    <p className="font-bold text-lg mb-1 text-foreground">
                      {student.fullName}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {isRtl ? `الصف: ${student.grade}` : `Grade ${student.grade}`}
                    </p>
                  </div>
                  
                  <Button
                    disabled={!tripActive}
                    variant="default"
                    className="rounded-xl h-10 px-4 font-bold transition-all bg-primary text-primary-foreground shadow-md shadow-primary/20 hover-elevate w-full"
                  >
                    {isRtl ? "تم الركوب" : "Mark Picked Up"}
                  </Button>
                </div>
              ))}
              {myStudents.length === 0 && (
                <div className="p-10 text-center text-muted-foreground">
                  {isRtl ? "لا يوجد طلاب معينين" : "No students assigned to this bus."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
