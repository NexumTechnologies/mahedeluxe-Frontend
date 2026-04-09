"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registerUser } from "@/lib/api";

type Role = "seller" | "buyer" | "customer";

export default function SellerRegisterStep1({ role = "seller" }: { role?: Role }) {
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation differs for customer (no confirm password required)
    if (role === "customer") {
      if (!fullName || !workEmail || !mobileNumber || !password) {
        setError("All fields are required");
        return;
      }
    } else {
      if (!fullName || !workEmail || !mobileNumber || !password || !confirmPassword) {
        setError("All fields are required");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    const storedRole = role === "customer" ? "user" : role;

    if (role === "customer") {
      // Directly register customer (role -> 'user')
        try {
        setLoading(true);
        await registerUser({
          name: fullName,
          email: workEmail,
          password,
          mobileNumber,
          role: storedRole,
        });
        // on success, navigate to home
        router.push("/");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Registration failed";
        setError(msg);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Store step 1 data + role in sessionStorage for multi-step flows
    sessionStorage.setItem(
      "registration",
      JSON.stringify({
        role: storedRole,
        step1: { fullName, workEmail, mobileNumber, password, confirmPassword },
      })
    );

    // Navigate to step 2 for the selected role
    router.push(`/auth/${storedRole}/register/step2`);
  };

  return (
    <div className="w-full">
      {/* Desktop Title - Hidden on mobile */}
      <div className="hidden md:block text-center">
          <h1 className="text-blue text-[25px] font-bold leading-[35px]">
          {role === "seller"
            ? "Create Your Seller Account"
            : role === "buyer"
            ? "Create Your Buyer Account"
            : "Create Your Account"}
        </h1>
        <p className="text-[#6B6B6B] text-[16px] leading-[18.2px] font-medium mt-1">
          Start by creating your basic account details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 md:mt-6">
        {/* Full Name Input */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-blue"
              >
                <path
                  d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                  stroke="#6B6B6B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3.41003 22C3.41003 18.13 7.26003 15 12 15C16.74 15 20.59 18.13 20.59 22"
                  stroke="#6B6B6B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <Input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="pl-12 h-12 border-0 border-b-2 border-[#6B6B6B] rounded-none text-[16px] leading-[22px] font-normal placeholder:text-[#6B6B6B] focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-blue"
            />
          </div>
        </div>

        {/* Work Email / Email Input */}
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
              placeholder={role === "customer" ? "Email" : "Work Email"}
              value={workEmail}
              onChange={(e) => setWorkEmail(e.target.value)}
              required
              className="pl-12 h-12 border-0 border-b-2 border-[#6B6B6B] rounded-none text-[16px] leading-[22px] font-normal placeholder:text-[#6B6B6B] focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-blue"
            />
          </div>
        </div>

        {/* Mobile Number Input */}
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
                  d="M17 2H7C5 2 4 3 4 5V19C4 21 5 22 7 22H17C19 22 20 21 20 19V5C20 3 19 2 17 2Z"
                  stroke="#6B6B6B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 18H12.01"
                  stroke="#6B6B6B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <Input
              type="tel"
              placeholder="Mobile number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
              className="pl-12 h-12 border-0 border-b-2 border-[#6B6B6B] rounded-none text-[16px] leading-[22px] font-normal placeholder:text-[#6B6B6B] focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-blue"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 11V9C17 6.79086 15.2091 5 13 5H11C8.79086 5 7 6.79086 7 9V11" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="3" y="11" width="18" height="10" rx="2" stroke="#6B6B6B" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-12 h-12 border-0 border-b-2 border-[#6B6B6B] rounded-none text-[16px] leading-[22px] font-normal placeholder:text-[#6B6B6B] focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-blue"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
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

        {/* Confirm Password Input (only for seller/buyer) */}
        {role !== "customer" && (
          <div className="mb-6">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15V11" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="#6B6B6B" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-12 h-12 border-0 border-b-2 border-[#6B6B6B] rounded-none text-[16px] leading-[22px] font-normal placeholder:text-[#6B6B6B] focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-blue"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10 10 0 0 1 6.06 6.06"/><path d="M1 1l22 22"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

        {/* Next Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-blue hover:bg-blue-light text-white text-[16px] font-medium rounded-lg"
        >
          {loading ? "Registering..." : "Next"}
        </Button>

        <p className="mt-6 text-center text-xs text-slate-500">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-[#7c3aed] hover:underline">
            Terms &amp; Conditions
          </Link>
          {" "}and{" "}
          <Link href="/privacy-policy" className="text-[#7c3aed] hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
