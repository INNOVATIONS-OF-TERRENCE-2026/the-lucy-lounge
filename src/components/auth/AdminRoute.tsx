// src/components/auth/AdminRoute.tsx

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          toast.error("Please sign in to access this page");
          setIsAdmin(false);
          return;
        }

        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          toast.error("Admin only — access denied");
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error("[AdminRoute] Error:", err);
        toast.error("Failed to verify admin access");
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
