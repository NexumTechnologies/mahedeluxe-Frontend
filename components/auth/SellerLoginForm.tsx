"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SellerLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // Persist auth info for global header/cart usage.
      try {
        if (typeof window !== "undefined") {
          if (data?.token) {
            localStorage.setItem("token", data.token);
          }
          if (data?.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }

          window.dispatchEvent(new Event("auth-change"));
        }
      } catch (err) {
        // Ignore persistence errors; don't block login.
      }

      // Redirect based on user role or to seller dashboard
      router.push("/seller/dashboard");
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Desktop Title - Hidden on mobile */}
      <div className="hidden md:block text-center">
        <h1 className="text-blue text-[25px] font-bold leading-8.75">
          Sign in to MaheDeluxe
        </h1>
        <p className="text-[#6B6B6B] text-[16px] leading-[18.2px] font-medium mt-1">
          or use you email account:
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 md:mt-6">
        {/* Email Input */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17 20.5H7C4 20.5 2 19 2 15.5V8.5C2 5 4 3.5 7 3.5H17C20 3.5 22 5 22 8.5V15.5C22 19 20 20.5 17 20.5Z"
                  stroke="#6B6B6B"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 9L13.87 11.5C12.84 12.32 11.15 12.32 10.12 11.5L7 9"
                  stroke="#6B6B6B"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-12 h-12 border-0 border-b-2 border-[#6B6B6B] rounded-none text-[16px] leading-5.5 font-normal placeholder:text-[#6B6B6B] focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-blue"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 10V8C6 4.69 7 2 12 2C17 2 18 4.69 18 8V10"
                  stroke="#6B6B6B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 18.5C13.3807 18.5 14.5 17.3807 14.5 16C14.5 14.6193 13.3807 13.5 12 13.5C10.6193 13.5 9.5 14.6193 9.5 16C9.5 17.3807 10.6193 18.5 12 18.5Z"
                  stroke="#6B6B6B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 22H7C3 22 2 21 2 17V15C2 11 3 10 7 10H17C21 10 22 11 22 15V17C22 21 21 22 17 22Z"
                  stroke="#6B6B6B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-12 h-12 border-0 border-b-2 border-[#6B6B6B] rounded-none text-[16px] leading-5.5 font-normal placeholder:text-[#6B6B6B] focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-blue"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

        {/* Sign In Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-blue hover:bg-blue-light text-white text-[16px] font-medium rounded-lg"
        >
          {loading ? "Signing in..." : "SIGN IN"}
        </Button>

        {/* Forgot Password Link */}
        <div className="mt-4 text-center">
          <Link
            href="/auth/forgot-password"
            className="text-orange text-[16px] hover:underline"
          >
            Forgot Your Password?
          </Link>
        </div>
      </form>
    </div>
  );
}

