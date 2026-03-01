import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { MapPin, UserCheck, Play, Square, Navigation } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useBuses, useUpdateBusLocation, useStudents } from "@/hooks/use-data";
import { useTranslation } from "@/hooks/use-translation";

export default function DriverDashboard() {
  const { user } = useAuth();
  const { data: buses } = useBuses();
  const { data: allStudents } = useStudents();
  const updateLocation = useUpdateBusLocation();
  const { t } = useTranslation();
  
  const [tripActive, setTripActive] = useState(false);
  
  // Find the bus assigned to this driver
  const myBus = buses?.find(b => b.driverId === user?.id);
  
  // Filter students assigned to this bus
  const myStudents = allStudents?.filter(s => s.busId === myBus?.id) || [];

  useEffect(() => {
    let watchId: number;
    if (tripActive && myBus) {
      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            updateLocation.mutate({
              id: myBus.id,
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => console.error("Error watching location:", error),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      }
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [tripActive, myBus]);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
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
              <><Square className="w-5 h-5 mr-2 fill-current" /> End Trip</>
            ) : (
              <><Play className="w-5 h-5 mr-2 fill-current" /> Start Route</>
            )}
          </Button>
        </div>

        {tripActive && (
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-8 flex items-center justify-between animate-in slide-in-from-top-4 fade-in">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary animate-ping"></div>
              <p className="font-semibold text-primary">GPS Location Broadcasting Active</p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/20 rounded-lg" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${myBus?.currentLat},${myBus?.currentLng}`, '_blank')}>
              <Navigation className="w-4 h-4 mr-2" /> Open Maps
            </Button>
          </div>
        )}

        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border/50 flex items-center justify-between bg-secondary/20">
            <h3 className="font-bold font-display text-lg flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              Passenger Manifest
            </h3>
            <span className="px-3 py-1 bg-background rounded-full text-xs font-bold shadow-sm border border-border/50">
              {myStudents.length} Students Assigned
            </span>
          </div>

          <div className="divide-y divide-border/50">
            {myStudents.map((student) => (
              <div 
                key={student.id} 
                className={`p-5 flex items-center justify-between transition-colors ${!tripActive ? 'opacity-60 grayscale' : 'hover:bg-secondary/10'}`}
              >
                <div>
                  <p className="font-bold text-lg mb-1 text-foreground">
                    {student.fullName}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Grade {student.grade}
                  </p>
                </div>
                
                <Button
                  disabled={!tripActive}
                  variant="default"
                  className="rounded-xl h-12 px-6 font-bold transition-all bg-primary text-primary-foreground shadow-md shadow-primary/20 hover-elevate"
                >
                  Mark Picked Up
                </Button>
              </div>
            ))}
            {myStudents.length === 0 && (
              <div className="p-10 text-center text-muted-foreground">
                No students assigned to this bus.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
