import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bus, ShieldCheck, UserPlus, LogIn } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/use-translation";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("parent");
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const [, setLocation] = useLocation();
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login({ username, password });
      if (user.role === 'admin') setLocation("/admin");
      else if (user.role === 'parent') setLocation("/parent");
      else if (user.role === 'driver') setLocation("/driver");
      else setLocation("/");
    } catch (err: any) {
      setError(err.message || "Failed to login.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const user = await register({ username, password, name, role: role as any });
      if (user.role === 'admin') setLocation("/admin");
      else if (user.role === 'parent') setLocation("/parent");
      else if (user.role === 'driver') setLocation("/driver");
      else setLocation("/");
    } catch (err: any) {
      setError(err.message || "Failed to register.");
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-primary to-indigo-900 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-2xl">
              <Bus className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold font-display tracking-tight">{t("nav.brand")}</h1>
          </div>
          <div className="max-w-md">
            <h2 className="text-5xl font-bold font-display leading-tight mb-6">{t("login.title")}</h2>
            <p className="text-lg text-primary-foreground/80 leading-relaxed">
              {t("login.subtitle")}
            </p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-primary-foreground/70">
          <ShieldCheck className="h-5 w-5" />
          {t("login.secure")}
        </div>
      </div>

      {/* Right side - Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="absolute top-8 right-8">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md space-y-8">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" /> {t("login.signin")}
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> {t("login.register")}
              </TabsTrigger>
            </TabsList>

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-xl text-sm font-medium border border-destructive/20 mb-6">
                {error}
              </div>
            )}

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username">{t("login.username")}</Label>
                  <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t("login.password")}</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" disabled={isLoggingIn} className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-indigo-600">
                  {isLoggingIn ? t("login.loggingIn") : t("login.signin")}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">{t("login.fullname")}</Label>
                  <Input id="reg-name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-username">{t("login.username")}</Label>
                  <Input id="reg-username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">{t("login.password")}</Label>
                  <Input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-role">{t("login.role")}</Label>
                  <select 
                    id="reg-role" 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="parent">{t("login.parent")}</option>
                    <option value="driver">{t("login.driver")}</option>
                    <option value="admin">{t("login.admin")}</option>
                  </select>
                </div>
                <Button type="submit" disabled={isRegistering} className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-indigo-600 mt-4">
                  {isRegistering ? t("login.creating") : t("login.register")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border/40">
            <p>Demo Accounts: admin, parent, driver (password123)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
