"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import SellerRegisterStep1 from "@/components/auth/SellerRegisterStep1";
import SignInPromo from "@/components/auth/SignInPromo";

type RegisterRole = "seller" | "buyer" | "customer";

function RoleTab({
  id,
  label,
  active,
  onSelect,
}: {
  id: RegisterRole;
  label: string;
  active: boolean;
  onSelect: (id: RegisterRole) => void;
}) {
  return (
    <button
      onClick={() => onSelect(id)}
      className={`px-4 py-2 rounded-t-lg font-medium border-b-2 -mb-px transition-colors ${
        active
          ? "bg-white border-orange text-orange"
          : "bg-gray-50 border-transparent text-gray-600 hover:text-orange"
      }`}
    >
      {label}
    </button>
  );
}

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const [role, setRole] = useState<RegisterRole>(() => {
    const roleParam = (searchParams.get("role") || "").toLowerCase();
    return roleParam === "buyer" || roleParam === "seller" || roleParam === "customer"
      ? (roleParam as RegisterRole)
      : "seller";
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Layout - Two Columns */}
      <div className="hidden md:flex min-h-screen">
        {/* Left Column - Sign Up Form (60%) */}
        <div className="w-[60%] flex items-center justify-center bg-white px-8">
          <div className="w-full max-w-md">
            <div className="mb-6 text-left">
              <Link href="/" className="inline-block">
                <Image src="/logo.png" alt="MaheDeluxe" width={140} height={36} className="object-contain" />
              </Link>
            </div>
            <div className="mb-6">
              <div className="flex gap-2">
                <RoleTab id="seller" label="Seller" active={role === "seller"} onSelect={setRole} />
                <RoleTab id="buyer" label="Buyer" active={role === "buyer"} onSelect={setRole} />
                <RoleTab id="customer" label="Customer" active={role === "customer"} onSelect={setRole} />
              </div>
            </div>
            <SellerRegisterStep1 role={role} />
          </div>
        </div>

        {/* Right Column - Sign In Promo (40%) */}
        <div className="w-[40%]">
          <SignInPromo />
        </div>
      </div>

      {/* Mobile Layout - Single Column */}
      <div className="md:hidden">
        <div className="bg-gradient-to-br from-[#6b21a8] to-[#8b5cf6] px-4 py-8">
          <h1 className="text-white text-[25px] font-bold leading-[35px] text-center">
            Create Account
          </h1>
          <p className="text-white/90 text-[16px] leading-[18.2px] font-medium text-center mt-1">
            Choose account type and create your account
          </p>
        </div>
        <div className="px-4 py-8 bg-white">
          <div className="mb-6 text-left">
            <Link href="/" className="inline-block">
              <Image src="/logo.png" alt="MaheDeluxe" width={140} height={36} className="object-contain" />
            </Link>
          </div>
          <div className="mb-6 flex gap-2 justify-center">
            <RoleTab id="seller" label="Seller" active={role === "seller"} onSelect={setRole} />
            <RoleTab id="buyer" label="Buyer" active={role === "buyer"} onSelect={setRole} />
            <RoleTab id="customer" label="Customer" active={role === "customer"} onSelect={setRole} />
          </div>
          <SellerRegisterStep1 role={role} />
          <div className="mt-8 text-center">
            <p className="text-[#6B6B6B] text-[16px]">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-[#7c3aed] font-medium">
                SIGN IN
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
