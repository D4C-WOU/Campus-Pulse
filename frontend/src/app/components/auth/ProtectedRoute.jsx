"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({ children, requiredRole }) {
  const router = useRouter();
  // Gate rendering until the check resolves, so a lower-privilege admin
  // never sees a flash of protected content before being redirected.
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (requiredRole) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role !== requiredRole) {
          router.push("/dashboard");
          return;
        }
      } catch {
        // Malformed/expired token -- treat the same as logged out.
        router.push("/login");
        return;
      }
    }

    setChecked(true);
  }, [requiredRole, router]);

  if (!checked) return null;

  return children;
}