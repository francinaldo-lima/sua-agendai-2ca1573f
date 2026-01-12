import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import Agendar from "./pages/Agendar";
import NotFound from "./pages/NotFound";
import Agenda from "./pages/dashboard/Agenda";
import Clientes from "./pages/dashboard/Clientes";
import Servicos from "./pages/dashboard/Servicos";
import Horarios from "./pages/dashboard/Horarios";
import Relatorios from "./pages/dashboard/Relatorios";
import Assinatura from "./pages/dashboard/Assinatura";
import Configuracoes from "./pages/dashboard/Configuracoes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
            <Route path="/dashboard/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
            <Route path="/dashboard/servicos" element={<ProtectedRoute><Servicos /></ProtectedRoute>} />
            <Route path="/dashboard/horarios" element={<ProtectedRoute><Horarios /></ProtectedRoute>} />
            <Route path="/dashboard/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
            <Route path="/dashboard/assinatura" element={<ProtectedRoute><Assinatura /></ProtectedRoute>} />
            <Route path="/dashboard/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
            <Route path="/agendar/:professionalId" element={<Agendar />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;