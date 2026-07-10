"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { login } from '@/app/services/authService';
import { getMe } from "@/app/services/authService";

import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();

  const { setAuth } =
    useAuthStore();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const authData =
        await login(
          email,
          password
        );

      localStorage.setItem(
        "access_token",
        authData.access_token
      );

      const user =
        await getMe();

      setAuth(
        user,
        authData.access_token
      );

      router.push(
        "/dashboard"
      );

    } catch (err) {
      setError(
        "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 border p-6 rounded-xl"
      >

        <h1 className="text-2xl font-bold">
          Campus Pulse Login
        </h1>

        <input
          className="border p-2 w-full"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
        />

        <input
          className="border p-2 w-full"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
        />

        {error && (
          <p className="text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full border p-2"
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>

      </form>
    </div>
  );
}