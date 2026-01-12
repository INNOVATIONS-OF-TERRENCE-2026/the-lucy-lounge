import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { PageSkeleton } from "@/components/skeleton/PageSkeleton";

import { ScrollToTop } from "@/components/ScrollToTop";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";

/* -------------------------
   LAZY PAGES
------------------------- */
const Landing = lazy(() => import("@/pages/Landing"));
const Chat = lazy(() => import("@/pages/Chat"));
const Auth = lazy(() => import("@/pages/Auth"));
const Features = lazy(() => import("@/pages/Features"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));

/* DASHBOARDS */
const PatientDashboard = lazy(() => import("@/pages/patient/Dashboard"));
const FamilyDashboard = lazy(() => import("@/pages/family/Dashboard"));
const ProviderDashboard = lazy(() => import("@/pages/provider/Dashboard"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));

export default function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <ScrollToTop />
      <AnalyticsTracker />

      <Suspense fallback={<PageSkeleton variant="default" />}>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Landing />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/chat" element={<Chat />} />

          {/* AUTH */}
          <Route path="/auth" element={<Auth />} />

          {/* PATIENT */}
          <Route
            path="/patient/*"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          {/* FAMILY */}
          <Route
            path="/family/*"
            element={
              <ProtectedRoute allowedRoles={["family"]}>
                <FamilyDashboard />
              </ProtectedRoute>
            }
          />

          {/* PROVIDER */}
          <Route
            path="/provider/*"
            element={
              <ProtectedRoute allowedRoles={["provider"]}>
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </Suspense>
    </TooltipProvider>
  );
}
