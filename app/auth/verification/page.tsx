"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function VerificationPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const checkStatus = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const resp = await api.get("/auth/me");
      const user = resp.data?.data;
      if (!user) {
        setMessage("Unable to verify status. Please sign in again.");
        router.push("/auth/signin");
        return;
      }
      // Customers (role 'user') do not require admin approval — treat as verified
      if (user.role === "user") {
        router.push("/");
        return;
      }

      if (user.is_varified) {
        // Redirect to appropriate dashboard
        if (user.role === "seller") router.push("/seller/dashboard");
        else if (user.role === "buyer") router.push("/buyer/dashboard");
        else router.push("/");
      } else {
        setMessage("Your verification is still pending. An admin must approve your account.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to check status. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-28 h-28 flex items-center justify-center bg-gradient-to-br from-[#f3e8ff] to-white rounded-2xl">
          <div className="w-16 h-16 flex items-center justify-center bg-white rounded-lg shadow">
            {/* Professional pending icon */}
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#7c3aed]"
            >
              <path d="M12 8V12L14.5 13.75" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <h1 className="mt-6 text-2xl font-semibold">Verification pending</h1>
        <p className="mt-2 text-gray-600">
          Your account is currently under review by our team. Your verification is pending — we will inform you when an admin approves your account.
        </p>

        <ul className="mt-6 text-left mx-auto max-w-sm space-y-3">
          <li className="flex items-start gap-3">
            <span className="mt-1 w-2.5 h-2.5 bg-[#f59e0b] rounded-full" />
            <span className="text-sm text-gray-700">We received your application</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 w-2.5 h-2.5 bg-[#60a5fa] rounded-full" />
            <span className="text-sm text-gray-700">Admin review in progress</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 w-2.5 h-2.5 bg-[#34d399] rounded-full opacity-40" />
            <span className="text-sm text-gray-700">Account approved (you&apos;ll be notified)</span>
          </li>
        </ul>

        {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}

        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={checkStatus}
            disabled={loading}
            className="px-4 py-2 bg-[#7c3aed] text-white rounded-lg disabled:opacity-60"
          >
            {loading ? "Checking..." : "Check status"}
          </button>

          <Link href="/auth/signin" className="px-4 py-2 bg-gray-100 rounded-lg">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
