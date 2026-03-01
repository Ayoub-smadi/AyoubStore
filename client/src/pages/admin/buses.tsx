import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { BusMap } from "@/components/map/bus-map";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Mock data
const mockBuses = [
  { id: 1, busNumber: "B-12", currentLat: 40.7128, currentLng: -74.0060, status: "active", driver: "John Smith", route: "North Suburbs" },
  { id: 2, busNumber: "B-04", currentLat: 40.7200, currentLng: -74.0100, status: "active", driver: "Sarah Connor", route: "East District" },
  { id: 3, busNumber: "B-08", currentLat: null, currentLng: null, status: "inactive", driver: "Mike Johnson", route: "West End" },
];

export default function AdminBuses() {
  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold font-display text-foreground">Fleet Tracking</h2>
          <p className="text-muted-foreground mt-1">Live map monitoring and fleet management.</p>
        </div>
        <Button className="rounded-xl bg-primary hover:bg-primary/90 font-semibold shadow-lg shadow-primary/20 hover-elevate">
          <Plus className="w-4 h-4 mr-2" /> Register Bus
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Map View */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-sm relative z-0">
          <BusMap buses={mockBuses} />
        </div>

        {/* List View */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-secondary/20 font-bold font-display">
            Active Fleet Status
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {mockBuses.map((bus) => (
              <div key={bus.id} className="p-4 rounded-xl border border-border/50 hover:border-primary/50 transition-colors bg-background">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold font-display text-lg text-foreground">{bus.busNumber}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                    ${bus.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400'}`}>
                    {bus.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p><span className="font-semibold text-foreground/80">Driver:</span> {bus.driver}</p>
                  <p><span className="font-semibold text-foreground/80">Route:</span> {bus.route}</p>
                </div>
                {bus.status === 'active' && (
                  <Button variant="ghost" size="sm" className="w-full mt-3 bg-primary/5 text-primary hover:bg-primary/15 font-semibold rounded-lg">
                    Focus on Map
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
