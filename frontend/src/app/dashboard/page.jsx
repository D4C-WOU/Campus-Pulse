"use client";

import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

        <div className="mt-4">
          <Link href='/alerts' className="text-blue-600 underline">Go to Alerts</Link>
        </div>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </ProtectedRoute>
  );
}