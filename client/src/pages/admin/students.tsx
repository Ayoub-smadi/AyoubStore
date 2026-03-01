import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Mock data for UI demonstration
const mockStudents = [
  { id: 1, studentNumber: "STU-001", fullName: "Emma Thompson", grade: "10th", busNumber: "B-12", status: "On Bus" },
  { id: 2, studentNumber: "STU-002", fullName: "Noah Walker", grade: "9th", busNumber: "B-04", status: "Dropped Off" },
  { id: 3, studentNumber: "STU-003", fullName: "Olivia Davis", grade: "11th", busNumber: "B-12", status: "Absent" },
  { id: 4, studentNumber: "STU-004", fullName: "Liam Garcia", grade: "8th", busNumber: "B-08", status: "On Bus" },
];

export default function AdminStudents() {
  
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Student Roster & Status Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
    
    // @ts-ignore
    doc.autoTable({
      startY: 40,
      head: [['ID', 'Name', 'Grade', 'Bus', 'Status']],
      body: mockStudents.map(s => [s.studentNumber, s.fullName, s.grade, s.busNumber, s.status]),
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] } // Primary blue
    });
    
    doc.save("student_report.pdf");
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold font-display text-foreground">Students</h2>
          <p className="text-muted-foreground mt-1">Manage enrollments and monitor daily attendance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportPDF} className="rounded-xl border-2 font-semibold">
            <FileDown className="w-4 h-4 mr-2" /> Export PDF
          </Button>
          <Button className="rounded-xl bg-primary hover:bg-primary/90 font-semibold shadow-lg shadow-primary/20 hover-elevate">
            <Plus className="w-4 h-4 mr-2" /> Add Student
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-border/50 flex items-center justify-between bg-secondary/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or ID..." 
              className="pl-9 h-10 bg-background border-border/50 rounded-xl focus:ring-primary/20"
            />
          </div>
          <div className="hidden sm:flex gap-2">
            <Button variant="ghost" size="sm" className="rounded-lg text-xs font-semibold">All Grades</Button>
            <Button variant="ghost" size="sm" className="rounded-lg text-xs font-semibold">Filter by Bus</Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Student Info</th>
                <th className="px-6 py-4 font-semibold tracking-wider">ID Number</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Grade</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Assigned Bus</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Current Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {mockStudents.map((student) => (
                <tr key={student.id} className="hover:bg-secondary/10 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    {student.fullName}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                    {student.studentNumber}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {student.grade}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      {student.busNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold gap-1.5
                      ${student.status === 'On Bus' ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                        student.status === 'Absent' ? 'text-rose-700 bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400' : 
                        'text-slate-700 bg-slate-100 dark:bg-slate-500/10 dark:text-slate-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'On Bus' ? 'bg-emerald-500' : student.status === 'Absent' ? 'bg-rose-500' : 'bg-slate-500'}`}></span>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="text-primary font-semibold hover:bg-primary/10 rounded-lg">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
