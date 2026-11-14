import type { ReactNode } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminLogin from "@/pages/AdminLogin";
import EventDetail from "@/pages/EventDetail";
import Events from "@/pages/Events";
import Home from "@/pages/Home";
import { useSession } from "@/lib/session";

function PublicLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-[#F9F8F3]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { data, isLoading } = useSession();
  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#F9F8F3]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" data-testid="admin-auth-loading" />
      </div>
    );
  }
  if (!data) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
        </Route>
        <Route path="/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* Floating on ALL pages, per design guidelines */}
      <WhatsAppFloatingButton />
      <Toaster />
    </>
  );
}
