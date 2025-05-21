
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { CountryProvider } from "@/hooks/use-country";

import Index from "./pages/Index";
import Simulation from "./pages/Simulation";
import SimulationEmployee from "./pages/SimulationEmployee";
import SimulationEnterprise from "./pages/SimulationEnterprise";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Resources from "./pages/Resources";
import CountrySelection from "./pages/CountrySelection";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EnterpriseDashboard from "./pages/EnterpriseDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <CountryProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/simulation" element={<Simulation />} />
              <Route path="/simulation/employee" element={<SimulationEmployee />} />
              <Route path="/simulation/enterprise" element={<SimulationEnterprise />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/country-selection" element={<CountrySelection />} />
              <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
              <Route path="/enterprise-dashboard" element={<EnterpriseDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CountryProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
