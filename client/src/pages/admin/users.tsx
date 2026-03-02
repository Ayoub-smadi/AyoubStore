import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useUsers, useBuses } from "@/hooks/use-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserPlus, Trash2, ShieldCheck, Navigation, Activity } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsers() {
  const { data: users, isLoading } = useUsers();
  const { t, isRtl } = useTranslation();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "driver",
      name: "",
      email: "",
      schoolId: 1,
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setOpen(false);
      form.reset();
      toast({ title: isRtl ? "تم إضافة المستخدم بنجاح" : "User added successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: isRtl ? "خطأ في الإضافة" : "Error adding user",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: isRtl ? "تم حذف المستخدم" : "User deleted" });
    }
  });

  const onSubmit = (data: any) => {
    createUserMutation.mutate(data);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <ShieldCheck className="w-4 h-4 text-red-500" />;
      case 'driver': return <Navigation className="w-4 h-4 text-amber-500" />;
      case 'parent': return <Activity className="w-4 h-4 text-emerald-500" />;
      default: return null;
    }
  };

  const getRoleLabel = (role: string) => {
    if (isRtl) {
      switch (role) {
        case 'admin': return "مدير";
        case 'driver': return "سائق";
        case 'parent': return "ولي أمر";
        default: return role;
      }
    }
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold font-display text-foreground">{isRtl ? "إدارة المستخدمين" : "User Management"}</h2>
          <p className="text-muted-foreground mt-1">
            {isRtl ? "إضافة وإدارة السائقين وأولياء الأمور والمسؤولين." : "Add and manage drivers, parents, and administrators."}
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20 hover-elevate font-bold">
              <UserPlus className="w-5 h-5" />
              {isRtl ? "إضافة مستخدم" : "Add User"}
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle>{isRtl ? "إضافة مستخدم جديد" : "Add New User"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
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
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRtl ? "اسم المستخدم" : "Username"}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRtl ? "كلمة المرور" : "Password"}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRtl ? "الدور" : "Role"}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="driver">{isRtl ? "سائق" : "Driver"}</SelectItem>
                          <SelectItem value="parent">{isRtl ? "ولي أمر" : "Parent"}</SelectItem>
                          <SelectItem value="admin">{isRtl ? "مدير" : "Admin"}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRtl ? "البريد الإلكتروني" : "Email"}</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? (isRtl ? "جاري الإضافة..." : "Adding...") : (isRtl ? "إضافة مستخدم" : "Add User")}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/20">
            <TableRow>
              <TableHead className="font-bold">{isRtl ? "الاسم" : "Name"}</TableHead>
              <TableHead className="font-bold">{isRtl ? "اسم المستخدم" : "Username"}</TableHead>
              <TableHead className="font-bold">{isRtl ? "الدور" : "Role"}</TableHead>
              <TableHead className="font-bold text-right">{isRtl ? "إجراءات" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user: any) => (
              <TableRow key={user.id} className="hover:bg-secondary/5 transition-colors">
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="font-mono text-sm">{user.username}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(user.role)}
                    <span className="text-sm">{getRoleLabel(user.role)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {user.username !== 'admin' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm(isRtl ? "هل أنت متأكد من حذف هذا المستخدم؟" : "Are you sure you want to delete this user?")) {
                          deleteUserMutation.mutate(user.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  {isRtl ? "جاري التحميل..." : "Loading users..."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
