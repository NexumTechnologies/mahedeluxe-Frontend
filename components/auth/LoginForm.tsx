"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import api from "@/lib/axios";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/LanguageProvider";

type AuthRole = "admin" | "seller" | "buyer" | "user" | (string & {});

type AuthPayload = {
  role?: AuthRole;
  is_varified?: boolean;
  [key: string]: unknown;
};

type LoginResponse = {
  token?: string;
  user?: AuthPayload;
  data?: (AuthPayload & { token?: string }) | undefined;
  message?: string;
  success?: boolean;
};

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dir, t } = useI18n();

  const mutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const resp = await api.post("/auth/login", credentials);
      return resp.data;
    },

    onSuccess: (resData: unknown) => {
      const normalized = (resData || {}) as LoginResponse;
      // API may return either { success, message, data: {...} } from backend
      // or { message, user, token } from Next.js /api/auth/login.
      const payload = (normalized.data || normalized.user || {}) as AuthPayload;

      // Persist auth info for header/cart (client-only).
      try {
        const token = normalized.token || normalized.data?.token;
        if (token) {
          if (typeof window !== "undefined" && token) {
            localStorage.setItem("token", token);
          }
        }

        if (typeof window !== "undefined" && payload && Object.keys(payload).length > 0) {
          localStorage.setItem("user", JSON.stringify(payload));
        }

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth-change"));
        }
      } catch {
        // Swallow persistence errors; don't block login flow.
      }

      const role = payload.role;
      const roleLower = typeof role === "string" ? role.toLowerCase() : "";
      const returnTo = searchParams.get("returnTo");
      const safeReturnTo = returnTo && returnTo.startsWith("/") ? returnTo : null;

      // If user is not verified (and not an admin or user), send them to verification page
      if (payload.is_varified === false && role !== "admin" && role !== "user") {
        router.push("/auth/verification");
        router.refresh();
        return;
      }

      if (safeReturnTo) {
        router.push(safeReturnTo);
        router.refresh();
        return;
      }

      if (roleLower === "admin") {
        router.push("/admin/dashboard");
      } else if (roleLower === "seller") {
        router.push("/seller/dashboard");
      } else if (roleLower === "buyer") {
        router.push("/buyer/dashboard");
      } else if (roleLower === "user" || roleLower === "customer") {
        // Customers (role 'user' or legacy 'customer') should go to home page
        router.push("/");
      } else {
        router.push("/");
      }
      router.refresh();
    },

    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message || t("auth.loginFailed"));
      } else {
        setError(
          err instanceof Error
            ? err.message
            : t("auth.genericError"),
        );
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    mutation.mutate({ email, password });
  };

  return (
    <div className="w-full" dir={dir}>
      {/* Desktop Title */}
      <div className="hidden md:block text-center">
        <h1 className="text-blue text-[25px] font-bold leading-8.75">
          {t("auth.loginTitle")}
        </h1>
        <p className="text-blue text-[16px] leading-[18.2px] font-medium mt-1">
          {t("auth.loginSubtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        {/* Email */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M17 20.5H7C4 20.5 2 19 2 15.5V8.5C2 5 4 3.5 7 3.5H17C20 3.5 22 5 22 8.5V15.5C22 19 20 20.5 17 20.5Z"
                  stroke="blue"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 9L13.87 11.5C12.84 12.32 11.15 12.32 10.12 11.5L7 9"
                  stroke="blue"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <Input
              type="email"
              placeholder={t("auth.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-12 h-12 border-0 border-b-2 border-[#6B6B6B] rounded-none placeholder:text-[#6B6B6B] focus-visible:ring-0 focus-visible:border-blue"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 10V8C6 4.69 7 2 12 2C17 2 18 4.69 18 8V10"
                  stroke="#6B6B6B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M12 18.5C13.3807 18.5 14.5 17.3807 14.5 16C14.5 14.6193 13.3807 13.5 12 13.5C10.6193 13.5 9.5 14.6193 9.5 16C9.5 17.3807 10.6193 18.5 12 18.5Z"
                  stroke="#6B6B6B"
                  strokeWidth="1.5"
                />
                <path
                  d="M17 22H7C3 22 2 21 2 17V15C2 11 3 10 7 10H17C21 10 22 11 22 15V17C22 21 21 22 17 22Z"
                  stroke="#6B6B6B"
                  strokeWidth="1.5"
                />
              </svg>
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-12 h-12 border-0 border-b-2 border-[#6B6B6B] rounded-none placeholder:text-[#6B6B6B] focus-visible:ring-0 focus-visible:border-[#7c3aed]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10 10 0 0 1 6.06 6.06"/><path d="M1 1l22 22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}

        {/* Submit */}
        <Button
          type="submit"
          disabled={mutation.status === "pending"}
          className="w-full h-12 bg-blue text-white rounded-lg"
        >
          {mutation.status === "pending" ? t("auth.signingIn") : t("auth.signIn")}
        </Button>

        {/* Forgot */}
        <div className="mt-4 text-center">
          <Link
            href="/auth/forgot-password"
            className="text-orange hover:underline"
          >
            {t("auth.forgotPassword")}
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          {t("auth.agreementPrefix")}{" "}
          <Link href="/terms" className="text-[#7c3aed] hover:underline">
            {t("auth.termsAndConditions")}
          </Link>
          {" "}{t("auth.and")}{" "}
          <Link href="/privacy-policy" className="text-[#7c3aed] hover:underline">
            {t("auth.privacyPolicy")}
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
