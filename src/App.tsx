import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { CountryProvider } from "@/hooks/use-country";
import { useState, useEffect } from "react";
import Loader from "@/components/ui/loader";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Importez votre composant Chatbot ici
import Chatbot from "./components/Chatbot"; 

import Index from "./pages/Index";
import Simulation from "./pages/Simulation";
import Simulationparticulier from "./pages/Simulationparticulier";
import SimulationEmployee from "./pages/SimulationEmployee";
import SimulationEnterprise from "./pages/SimulationEnterprise";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Resources from "./pages/Resources";
import CountrySelection from "./pages/CountrySelection";
import Dashboard from "./pages/Dashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EnterpriseDashboard from "./pages/EnterpriseDashboard";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";

// Ajoutez les imports pour les pages About et Contact
import About from "./pages/About";    // Assurez-vous que ce fichier existe
import Contact from "./pages/Contact"; // Assurez-vous que ce fichier existe

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler un temps de chargement minimum pour une meilleure expérience utilisateur
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loader size="lg" />;
  }

  return (
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
                <Route path="/simulationparticulier" element={<Simulationparticulier />} />
                <Route path="/simulation/employee" element={<SimulationEmployee />} />
                <Route path="/simulation/enterprise" element={<SimulationEnterprise />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/country-selection" element={<CountrySelection />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Routes protégées */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute allowedRoles={['client', 'entreprise']}>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/employee-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <EmployeeDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/enterprise-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['entreprise']}>
                      <EnterpriseDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <Chatbot />
          </TooltipProvider>
        </CountryProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;