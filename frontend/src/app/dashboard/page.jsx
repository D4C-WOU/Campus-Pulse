"use client";

import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function DashboardPage() {

  const { logout } = useAuthStore();

  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      <div className="p-8">
        <h1 className="text-3xl font-bold">
          Campus Pulse Dashboard
        </h1>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </ProtectedRoute>
  );
}