"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import LoginForm from "@/components/auth/LoginForm";
import SignUpPromo from "@/components/auth/SignUpPromo";
import { useIsMutating } from "@tanstack/react-query";

export default function SignInPage() {
  const isMutating = useIsMutating();
  return (
    <div className="min-h-screen bg-white">
      {/* Global loading overlay when any mutation is running (e.g., signing in) */}
      {isMutating > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-white animate-spin" />
            <span className="text-white font-medium">Signing in...</span>
          </div>
        </div>
      )}
      {/* Desktop Layout - Two Columns */}
      <div className="hidden md:flex min-h-screen">
        {/* Left Column - Sign Up Promo (40%) */}
        <div className="w-[40%]">
          <SignUpPromo />
        </div>

        {/* Right Column - Sign In Form (60%) */}
        <div className="w-[60%] flex items-center justify-center bg-white px-8">
          <div className="w-full max-w-md">
            <div className="mb-6 text-left">
              <Link href="/" className="inline-block">
                <Image src="/logo.png" alt="MaheDeluxe" width={140} height={36} className="object-contain" />
              </Link>
            </div>
            <React.Suspense fallback={<div>Loading form...</div>}>
              <LoginForm />
            </React.Suspense>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Single Column */}
      <div className="md:hidden">
        <div className="bg-gradient-to-br from-[#6b21a8] to-[#8b5cf6] px-4 py-8">
          <h1 className="text-white text-[25px] font-bold leading-[35px] text-center">
            Sign in to MaheDeluxe
          </h1>
          <p className="text-white/90 text-[16px] leading-[18.2px] font-medium text-center mt-1">
            or use you email account:
          </p>
        </div>
        <div className="px-4 py-8 bg-white">
          <div className="mb-6 text-left">
            <Link href="/" className="inline-block">
              <Image src="/logo.png" alt="MaheDeluxe" width={140} height={36} className="object-contain" />
            </Link>
          </div>
          <React.Suspense fallback={<div>Loading form...</div>}>
            <LoginForm />
          </React.Suspense>
          <div className="mt-8 text-center">
            <p className="text-[#6B6B6B] text-[16px]">
              Don&apos;t have account?{" "}
              <Link
                href="/auth/register"
                className="text-[#7c3aed] font-medium"
              >
                SIGN UP
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
