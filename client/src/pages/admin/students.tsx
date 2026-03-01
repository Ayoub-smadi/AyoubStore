import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useStudents, useCreateStudent } from "@/hooks/use-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, FileDown, Search } from "lucide-react";
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
import { useTranslation } from "@/hooks/use-translation";
import { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function AdminStudents() {
  const { data: students, isLoading } = useStudents();
  const createStudent = useCreateStudent();
  const { t, isRtl } = useTranslation();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm({
    resolver: zodResolver(insertStudentSchema),
    defaultValues: {
      studentNumber: "",
      fullName: "",
      grade: "",
      schoolId: 1,
    },
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
                  {student.parentId ? (
                    <span className="text-emerald-500 font-medium">{isRtl ? "مرتبط" : "Linked"}</span>
                  ) : (
                    <span className="text-muted-foreground text-xs italic">{isRtl ? "غير مرتبط" : "Not Linked"}</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
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
