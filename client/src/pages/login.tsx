import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bus, ArrowRight, ShieldCheck } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("password");
  const { login, isLoggingIn } = useAuth();
  const [, setLocation] = useLocation();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login({ username, password });
      
      // Route based on role
      if (user.role === 'admin') setLocation("/admin");
      else if (user.role === 'parent') setLocation("/parent");
      else if (user.role === 'driver') setLocation("/driver");
      else setLocation("/");
      
    } catch (err: any) {
      setError(err.message || "Failed to login. Try admin/password.");
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Left side - Image/Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-primary to-indigo-900 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-2xl">
              <Bus className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold font-display tracking-tight">RouteSync</h1>
          </div>
          
          <div className="max-w-md">
            <h2 className="text-5xl font-bold font-display leading-tight mb-6">
              Smart Tracking for Safer Journeys.
            </h2>
            <p className="text-lg text-primary-foreground/80 leading-relaxed">
              Real-time GPS tracking, attendance monitoring, and automated geofence alerts giving peace of mind to parents and control to schools.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-primary-foreground/70">
          <ShieldCheck className="h-5 w-5" />
          Secure, Encrypted, and Reliable
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md space-y-10">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold font-display text-foreground mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">Log in to your account to continue.</p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-xl text-sm font-medium border border-destructive/20 animate-in shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-foreground/80">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 bg-secondary/30 border-border/50 focus:border-primary focus:ring-primary/20 rounded-xl text-base px-4 transition-all"
                placeholder="Enter your username"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground/80">Password</Label>
                <a href="#" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">Forgot password?</a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-secondary/30 border-border/50 focus:border-primary focus:ring-primary/20 rounded-xl text-base px-4 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:to-indigo-700 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover-elevate group"
            >
              {isLoggingIn ? "Authenticating..." : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border/40">
            <p>Demo Accounts:</p>
            <div className="flex justify-center gap-4 mt-2 font-mono text-xs">
              <span className="bg-secondary px-2 py-1 rounded">admin</span>
              <span className="bg-secondary px-2 py-1 rounded">parent</span>
              <span className="bg-secondary px-2 py-1 rounded">driver</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
