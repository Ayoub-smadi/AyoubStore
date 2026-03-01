import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import Login from "./pages/login";
import AdminDashboard from "./pages/admin/dashboard";
import AdminStudents from "./pages/admin/students";
import AdminBuses from "./pages/admin/buses";
import ParentDashboard from "./pages/parent/dashboard";
import DriverDashboard from "./pages/driver/dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/students" component={AdminStudents} />
      <Route path="/admin/buses" component={AdminBuses} />
      
      {/* Parent Routes */}
      <Route path="/parent" component={ParentDashboard} />
      
      {/* Driver Routes */}
      <Route path="/driver" component={DriverDashboard} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
