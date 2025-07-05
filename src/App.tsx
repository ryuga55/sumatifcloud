import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import WaitingApproval from "./pages/WaitingApproval";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Kelas from "./pages/Kelas";
import Siswa from "./pages/Siswa";
import MataPelajaran from "./pages/MataPelajaran";
import KategoriPenilaian from "./pages/KategoriPenilaian";
import BobotPenilaian from "./pages/BobotPenilaian";
import InputNilai from "./pages/InputNilai";
import InputKehadiran from "./pages/InputKehadiran";
import RekapNilai from "./pages/RekapNilai";
import RekapKehadiran from "./pages/RekapKehadiran";
import Data from "./pages/Data";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/waiting-approval" element={<WaitingApproval />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/kelas" element={<Kelas />} />
            <Route path="/siswa" element={<Siswa />} />
            <Route path="/mata-pelajaran" element={<MataPelajaran />} />
            <Route path="/kategori-penilaian" element={<KategoriPenilaian />} />
            <Route path="/bobot-penilaian" element={<BobotPenilaian />} />
            <Route path="/input-nilai" element={<InputNilai />} />
            <Route path="/input-kehadiran" element={<InputKehadiran />} />
            <Route path="/rekap-nilai" element={<RekapNilai />} />
            <Route path="/rekap-kehadiran" element={<RekapKehadiran />} />
            <Route path="/data" element={<Data />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
