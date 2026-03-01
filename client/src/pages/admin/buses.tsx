import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { BusMap } from "@/components/map/bus-map";
import { Button } from "@/components/ui/button";
import { Plus, Bus as BusIcon, UserPlus, Trash2, Edit } from "lucide-react";
import { useBuses, useStudents, useUsers } from "@/hooks/use-data";
import { useTranslation } from "@/hooks/use-translation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBusSchema } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AdminBuses() {
  const { data: buses, isLoading } = useBuses();
  const { data: users } = useUsers();
  const { t, isRtl } = useTranslation();
  const [open, setOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const { toast } = useToast();

  const drivers = users?.filter(u => u.role === 'driver');

  const createBusMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/buses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buses"] });
      setOpen(false);
      toast({ title: isRtl ? "تمت إضافة الحافلة" : "Bus added successfully" });
    }
  });

  const deleteBusMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/buses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buses"] });
      toast({ title: isRtl ? "تم حذف الحافلة" : "Bus deleted" });
    }
  });

  const assignDriverMutation = useMutation({
    mutationFn: async ({ busId, driverId }: { busId: number, driverId: number }) => {
      await apiRequest("PATCH", `/api/buses/${busId}/driver`, { driverId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buses"] });
      setAssignOpen(false);
      toast({ title: isRtl ? "تم تعيين السائق" : "Driver assigned" });
    }
  });

  const form = useForm({
    resolver: zodResolver(insertBusSchema),
    defaultValues: {
      busNumber: "",
      status: "inactive",
      schoolId: 1,
    },
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold font-display text-foreground">{isRtl ? "تتبع الأسطول" : "Fleet Tracking"}</h2>
          <p className="text-muted-foreground mt-1">{isRtl ? "مراقبة الخريطة الحية وإدارة الأسطول." : "Live map monitoring and fleet management."}</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-primary hover:bg-primary/90 font-semibold shadow-lg shadow-primary/20 hover-elevate">
              <Plus className="w-4 h-4 mr-2" /> {isRtl ? "تسجيل حافلة" : "Register Bus"}
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>{isRtl ? "إضافة حافلة جديدة" : "Add New Bus"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createBusMutation.mutate(data))} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="busNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRtl ? "رقم الحافلة" : "Bus Number"}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createBusMutation.isPending}>
                  {createBusMutation.isPending ? (isRtl ? "جاري الإضافة..." : "Adding...") : (isRtl ? "إضافة" : "Add")}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Map View */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-sm relative z-0">
          <BusMap buses={buses || []} />
        </div>

        {/* List View */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-secondary/20 font-bold font-display">
            {isRtl ? "حالة الأسطول النشط" : "Active Fleet Status"}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {buses?.map((bus) => (
              <div key={bus.id} className="p-4 rounded-xl border border-border/50 hover:border-primary/50 transition-colors bg-background">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold font-display text-lg text-foreground">{bus.busNumber}</h4>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                      setSelectedBus(bus);
                      setAssignOpen(true);
                    }}>
                      <UserPlus className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteBusMutation.mutate(bus.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p><span className="font-semibold text-foreground/80">{isRtl ? "السائق:" : "Driver:"}</span> {bus.driverId ? drivers?.find(d => d.id === bus.driverId)?.name || `ID: ${bus.driverId}` : (isRtl ? "غير معين" : "Not Assigned")}</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1
                    ${bus.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400'}`}>
                    {bus.status}
                  </span>
                </div>

        <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isRtl ? "تعيين سائق" : "Assign Driver"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{isRtl ? "اختر السائق" : "Select Driver"}</label>
                <Select onValueChange={(val) => {
                  if (selectedBus) {
                    assignDriverMutation.mutate({ busId: selectedBus.id, driverId: Number(val) });
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder={isRtl ? "اختر سائق..." : "Select a driver..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers?.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id.toString()}>
                        {driver.name}
                      </SelectItem>
                    ))}
                    {drivers?.length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground">{isRtl ? "لا يوجد سائقين" : "No drivers found"}</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
                {bus.status === 'active' && (
                  <Button variant="ghost" size="sm" className="w-full mt-3 bg-primary/5 text-primary hover:bg-primary/15 font-semibold rounded-lg">
                    {isRtl ? "التركيز على الخريطة" : "Focus on Map"}
                  </Button>
                )}
              </div>
            ))}
            {buses?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {isRtl ? "لا توجد حافلات." : "No buses found."}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
