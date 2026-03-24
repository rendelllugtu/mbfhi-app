import { useEffect } from "react";
import { useAuth } from "../auth/useAuth";
import { useLocation } from "react-router-dom";

export default function RoleRedirect() {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!user) return;

    // 🔥 prevent infinite redirect loop
    if (location.pathname !== "/") return;

    // ✅ MULTI-ROLE SUPPORT
    // Admin and Assessor users now see the same Home page as regular users

  }, [user, location]);

  return null;
}