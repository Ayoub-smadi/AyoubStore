import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { MapPin, UserCheck, Play, Square, Navigation } from "lucide-react";

// Mock data
const mockStudents = [
  { id: 1, name: "Emma Thompson", stop: "142 Oak Street", pickedUp: false },
  { id: 2, name: "Noah Walker", stop: "89 Maple Ave", pickedUp: true },
  { id: 3, name: "Olivia Davis", stop: "201 Pine Blvd", pickedUp: false },
];

export default function DriverDashboard() {
  const [tripActive, setTripActive] = useState(false);
  const [students, setStudents] = useState(mockStudents);

  const toggleAttendance = (id: number) => {
    if (!tripActive) return;
    setStudents(students.map(s => 
      s.id === id ? { ...s, pickedUp: !s.pickedUp } : s
    ));
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold font-display text-foreground">Driver Console</h2>
            <p className="text-muted-foreground mt-1">Manage your current trip and attendance.</p>
          </div>
          
          <Button 
            onClick={() => setTripActive(!tripActive)}
            size="lg"
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
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/20 rounded-lg">
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
              {students.filter(s => s.pickedUp).length} / {students.length} On Board
            </span>
          </div>

          <div className="divide-y divide-border/50">
            {students.map((student) => (
              <div 
                key={student.id} 
                className={`p-5 flex items-center justify-between transition-colors ${!tripActive ? 'opacity-60 grayscale' : 'hover:bg-secondary/10'}`}
              >
                <div>
                  <p className={`font-bold text-lg mb-1 ${student.pickedUp ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                    {student.name}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {student.stop}
                  </p>
                </div>
                
                <Button
                  onClick={() => toggleAttendance(student.id)}
                  disabled={!tripActive}
                  variant={student.pickedUp ? "secondary" : "default"}
                  className={`rounded-xl h-12 px-6 font-bold transition-all ${
                    student.pickedUp 
                      ? 'bg-secondary text-muted-foreground hover:bg-secondary/80' 
                      : 'bg-primary text-primary-foreground shadow-md shadow-primary/20 hover-elevate'
                  }`}
                >
                  {student.pickedUp ? "Cancel" : "Mark Picked Up"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
