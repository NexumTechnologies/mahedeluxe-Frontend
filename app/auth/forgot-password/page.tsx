"use client";

import { PackageCheck, ShieldCheck, ShoppingBag, Truck } from "lucide-react";

import ForgotPasswordFlow from "@/components/auth/ForgotPasswordFlow";

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#eef7ff_0%,#f8fbff_35%,#eef2f7_100%)] px-4 py-8 sm:px-6">
      <div className="auth-scene-grid pointer-events-none absolute inset-0 opacity-60" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="auth-float-slow absolute left-[8%] top-[12%] h-40 w-40 rounded-full bg-blue/10 blur-3xl" />
        <div className="auth-float-medium absolute right-[10%] top-[18%] h-52 w-52 rounded-full bg-orange/10 blur-3xl" />
        <div className="auth-float-fast absolute bottom-[14%] left-[20%] h-44 w-44 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="auth-float-slow absolute bottom-[10%] right-[18%] h-36 w-36 rounded-full bg-emerald-200/25 blur-3xl" />
      </div>

      <div className="pointer-events-none absolute inset-0 hidden xl:block">
        <div className="auth-float-medium absolute left-[12%] top-[22%] rounded-2xl border border-white/70 bg-white/75 px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue/10 p-2 text-blue">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900">Marketplace Access</div>
              <div className="text-[11px] text-slate-500">Recover buyer and seller accounts</div>
            </div>
          </div>
        </div>

        <div className="auth-float-fast absolute right-[11%] top-[28%] rounded-2xl border border-white/70 bg-white/75 px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
              <PackageCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900">Orders Protected</div>
              <div className="text-[11px] text-slate-500">Secure recovery in a few steps</div>
            </div>
          </div>
        </div>

        <div className="auth-float-slow absolute left-[16%] bottom-[18%] rounded-2xl border border-white/70 bg-white/75 px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange/10 p-2 text-orange">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900">Business Continuity</div>
              <div className="text-[11px] text-slate-500">Get back to your storefront quickly</div>
            </div>
          </div>
        </div>

        <div className="auth-float-medium absolute right-[15%] bottom-[20%] rounded-2xl border border-white/70 bg-white/75 px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900">OTP Verified</div>
              <div className="text-[11px] text-slate-500">Protected password reset flow</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-md">
        <ForgotPasswordFlow />
      </div>
    </div>
  );
}