"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { BriefcaseBusiness, ShoppingBag, UserRound, CheckCircle2 } from "lucide-react";
import SellerRegisterStep1 from "@/components/auth/SellerRegisterStep1";
import SignInPromo from "@/components/auth/SignInPromo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type RegisterRole = "seller" | "buyer" | "customer";

function RoleBadge({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
      {label}
    </div>
  );
}

function RoleOptionCard({
  id,
  title,
  icon,
  accent,
  selected,
  onSelect,
  className,
}: {
  id: RegisterRole;
  title: string;
  icon: React.ReactNode;
  accent?: string;
  selected: boolean;
  onSelect: (id: RegisterRole) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`group relative flex h-40 flex-col items-center justify-center gap-3 rounded-2xl border-2 p-6 text-center transition-all duration-200 sm:p-8 ${
        selected
          ? "border-teal-500 bg-teal-50 shadow-[0_18px_40px_rgba(13,148,136,0.12)]"
          : "border-slate-200 bg-white hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
      } ${className || ""}`}
    >
      <div className={`rounded-full p-3 ${accent || "bg-gray-100 text-slate-700"}`}>
        {icon}
      </div>
      <div className="text-sm font-semibold text-slate-900 sm:text-base">{title}</div>

      <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
        <CheckCircle2
          className={`h-5 w-5 transition ${selected ? "text-teal-600" : "text-slate-200 group-hover:text-slate-300"}`}
        />
      </div>
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
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(true);

  const handleSelectRole = (nextRole: RegisterRole) => {
    setRole(nextRole);
    setIsRoleModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Dialog
        open={isRoleModalOpen}
        onOpenChange={(open) => {
          // prevent closing by outside click; only close when selection is made
          if (!open && isRoleModalOpen) return;
          setIsRoleModalOpen(open);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="w-[96vw] max-w-3xl overflow-hidden rounded-3xl border-0 p-0 shadow-[0_30px_90px_rgba(2,6,23,0.6)]"
        >
          <div className="bg-white rounded-3xl">
            <div className="px-6 pt-8 pb-6 text-center sm:px-10">
              <DialogTitle className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Choose how you want to join platform
              </DialogTitle>
              <DialogDescription className="mx-auto mt-2 max-w-2xl text-sm text-slate-600">
                Pick the account type that best describes how you’ll use MaheDeluxe — we’ll tailor the signup process accordingly.
              </DialogDescription>
            </div>

            <div className="px-6 pb-8 sm:px-10">
              <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
                <RoleOptionCard
                  id="buyer"
                  title="Buyer"
                  selected={role === "buyer"}
                  onSelect={handleSelectRole}
                  accent="bg-emerald-50 text-emerald-700"
                  icon={<ShoppingBag className="h-8 w-8" />}
                />

                <RoleOptionCard
                  id="seller"
                  title="Seller"
                  selected={role === "seller"}
                  onSelect={handleSelectRole}
                  accent="bg-sky-50 text-sky-700"
                  icon={<BriefcaseBusiness className="h-8 w-8" />}
                />

                <RoleOptionCard
                  id="customer"
                  title="Customer"
                  selected={role === "customer"}
                  onSelect={handleSelectRole}
                  accent="bg-amber-50 text-amber-700"
                  icon={<UserRound className="h-8 w-8" />}
                  className="sm:col-span-2 sm:justify-self-center"
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Desktop Layout - Two Columns */}
      <div className="hidden md:flex min-h-screen">
        {/* Left Column - Sign Up Form (60%) */}
        <div className="w-[60%] flex items-center justify-center bg-white px-8 relative">
          {/* Decorative background removed per request */}

          <div className="w-full max-w-md relative z-10">
            <div className="mb-6 text-left">
              <Link href="/" className="inline-block">
                <Image src="/logo.png" alt="MaheDeluxe" width={140} height={36} className="object-contain" />
              </Link>
            </div>
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-slate-600">Account type:</div>
                <div className="inline-flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("buyer")}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                      role === "buyer"
                        ? "bg-emerald-600 text-white shadow"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Buyer
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("seller")}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                      role === "seller"
                        ? "bg-sky-600 text-white shadow"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Seller
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("customer")}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                      role === "customer"
                        ? "bg-amber-600 text-white shadow"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Customer
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(true)}
                  className="ml-auto rounded-md bg-transparent px-2 py-1 text-sm text-slate-500 hover:text-slate-700"
                >
                  Change
                </button>
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
        <div className="bg-linear-to-br from-[#6b21a8] to-[#8b5cf6] px-4 py-8">
          <h1 className="text-white text-[25px] font-bold leading-9 text-center">
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
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 text-xs font-medium text-slate-600">Account type:</div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRole("buyer")}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  role === "buyer"
                    ? "bg-emerald-600 text-white shadow"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                Buyer
              </button>

              <button
                type="button"
                onClick={() => setRole("seller")}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  role === "seller"
                    ? "bg-sky-600 text-white shadow"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                Seller
              </button>

              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  role === "customer"
                    ? "bg-amber-600 text-white shadow"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                Customer
              </button>
            </div>
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
