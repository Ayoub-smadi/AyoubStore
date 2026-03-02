import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useStudents, useCreateStudent, useBuses } from "@/hooks/use-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, FileDown, Search, MapPin, Link2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStudentSchema } from "@shared/schema";
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
import { useTranslation } from "@/hooks/use-translation";
import { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { BusMap } from "@/components/map/bus-map";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AdminStudents() {
  const { data: students, isLoading } = useStudents();
  const { data: buses } = useBuses();
  const createStudent = useCreateStudent();
  const { t, isRtl } = useTranslation();
  const [open, setOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertStudentSchema),
    defaultValues: {
      studentNumber: "",
      fullName: "",
      grade: "",
      schoolId: 1,
      homeLat: 24.7136,
      homeLng: 46.6753,
    },
  });

  const updateLocationMutation = useMutation({
    mutationFn: async ({ id, lat, lng }: { id: number, lat: number, lng: number }) => {
      await apiRequest("PATCH", `/api/students/${id}/location`, { homeLat: lat, homeLng: lng });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      setMapOpen(false);
      toast({ title: isRtl ? "تم تحديث الموقع" : "Location updated" });
    }
  });

  const linkBusMutation = useMutation({
    mutationFn: async ({ studentId, busId }: { studentId: number, busId: number }) => {
      await apiRequest("PATCH", `/api/students/${studentId}/bus`, { busId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      setLinkOpen(false);
      toast({ title: isRtl ? "تم الربط بنجاح" : "Linked successfully" });
    }
  });

  const onSubmit = (data: any) => {
    createStudent.mutate(data, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
      },
    });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(isRtl ? "سجل الطلاب وتقرير الحالة" : "Student Roster & Status Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
    
    // @ts-ignore
    doc.autoTable({
      startY: 40,
      head: [[isRtl ? 'الرقم' : 'ID', isRtl ? 'الاسم' : 'Name', isRtl ? 'الصف' : 'Grade', isRtl ? 'الحالة' : 'Status']],
      body: students?.map(s => [s.studentNumber, s.fullName, s.grade, s.parentId ? 'Linked' : 'Not Linked']) || [],
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] }
    });
    
    doc.save("student_report.pdf");
  };

  const filteredStudents = students?.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.studentNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold font-display text-foreground">{t("sidebar.students")}</h2>
          <p className="text-muted-foreground mt-1">
            {isRtl ? "إدارة سجلات الطلاب والأرقام التعريفية." : "Manage student records and IDs."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportPDF} className="rounded-xl border-2 font-semibold">
            <FileDown className="w-4 h-4 mr-2" /> {isRtl ? "تصدير PDF" : "Export PDF"}
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20 hover-elevate font-bold">
                <UserPlus className="w-5 h-5" />
                {isRtl ? "إضافة طالب" : "Add Student"}
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>{isRtl ? "إضافة طالب جديد" : "Add New Student"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRtl ? "الاسم الكامل" : "Full Name"}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="studentNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRtl ? "رقم الطالب" : "Student Number"}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRtl ? "الصف" : "Grade"}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createStudent.isPending}>
                    {createStudent.isPending ? (isRtl ? "جاري الإضافة..." : "Adding...") : (isRtl ? "إضافة" : "Add")}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center justify-between bg-secondary/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={isRtl ? "بحث بالاسم أو الرقم..." : "Search by name or ID..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 bg-background border-border/50 rounded-xl focus:ring-primary/20"
            />
          </div>
        </div>

        <Table>
          <TableHeader className="bg-secondary/20">
            <TableRow>
              <TableHead className="font-bold">{isRtl ? "الاسم" : "Name"}</TableHead>
              <TableHead className="font-bold">{isRtl ? "رقم الطالب" : "Student ID"}</TableHead>
              <TableHead className="font-bold">{isRtl ? "الصف" : "Grade"}</TableHead>
              <TableHead className="font-bold">{isRtl ? "ولي الأمر" : "Parent"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents?.map((student) => (
              <TableRow key={student.id} className="hover:bg-secondary/5 transition-colors">
                <TableCell className="font-medium">{student.fullName}</TableCell>
                <TableCell className="font-mono text-sm">{student.studentNumber}</TableCell>
                <TableCell>{student.grade}</TableCell>
                <TableCell>
                  {student.busId ? (
                    <span className="text-primary font-medium">Bus #{student.busId}</span>
                  ) : (
                    <span className="text-muted-foreground text-xs italic">{isRtl ? "غير معين" : "Not Assigned"}</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-primary"
                      onClick={() => {
                        setSelectedStudent(student);
                        setMapOpen(true);
                      }}
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-indigo-600"
                      onClick={() => {
                        setSelectedStudent(student);
                        setLinkOpen(true);
                      }}
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

        <Dialog open={mapOpen} onOpenChange={setMapOpen}>
          <DialogContent className="max-w-3xl h-[600px] flex flex-col">
            <DialogHeader>
              <DialogTitle>{isRtl ? "تحديد موقع منزل الطالب" : "Set Student Home Location"}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 rounded-xl overflow-hidden relative border border-border">
              <BusMap 
                buses={[]} 
                center={selectedStudent?.homeLat && selectedStudent?.homeLng ? [selectedStudent.homeLat, selectedStudent.homeLng] : [24.7136, 46.6753]}
                homeLocation={selectedStudent?.homeLat && selectedStudent?.homeLng ? [selectedStudent.homeLat, selectedStudent.homeLng] : undefined}
                onMapClick={(lat, lng) => {
                  if (selectedStudent) {
                    updateLocationMutation.mutate({ id: selectedStudent.id, lat, lng });
                  }
                }}
              />
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-xs font-bold z-[1000] pointer-events-none">
                {isRtl ? "اضغط على الخريطة لتحديد الموقع" : "Click map to set location"}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isRtl ? "ربط الطالب بحافلة" : "Link Student to Bus"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{isRtl ? "اختر الحافلة" : "Select Bus"}</label>
                <Select onValueChange={(val) => {
                  if (selectedStudent) {
                    linkBusMutation.mutate({ studentId: selectedStudent.id, busId: Number(val) });
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder={isRtl ? "اختر حافلة..." : "Select a bus..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {buses?.map((bus) => (
                      <SelectItem key={bus.id} value={bus.id.toString()}>
                        {isRtl ? "حافلة رقم" : "Bus #"} {bus.busNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
            {filteredStudents?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  {isRtl ? "لا يوجد طلاب." : "No students found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
