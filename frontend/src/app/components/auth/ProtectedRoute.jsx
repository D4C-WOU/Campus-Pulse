"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({ children }) {
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

    try {
      jwtDecode(token);
    } catch {
      router.push("/login");
      return;
    }


    setChecked(true);
  }, [router]);

  if (!checked) return null;

  return children;
}