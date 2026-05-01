"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { clearAllClientAuthState } from "@/lib/authStorage";
import { useI18n } from "@/components/LanguageProvider";
import { SheetClose } from "@/components/ui/sheet";
import DashboardLanguageSwitcher from "@/components/DashboardLanguageSwitcher";
import { translateDashboard } from "@/lib/dashboard-i18n";

type BuyerSidebarProps = {
  closeOnNavigate?: boolean;
};

export default function BuyerSidebar({ closeOnNavigate }: BuyerSidebarProps) {
  const { locale } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const td = (key: string, vars?: Record<string, string | number>) =>
    translateDashboard(locale, key, vars);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    clearAllClientAuthState();
    router.replace("/");
    router.refresh();
  };

  const items = [
    { href: "/buyer/dashboard", label: td("common.dashboard") },
    { href: "/buyer/dashboard/products", label: td("buyerSidebar.myProducts") },
    { href: "/buyer/dashboard/orders", label: td("buyerSidebar.purchases") },
    { href: "/buyer/dashboard/sales-orders", label: td("buyerSidebar.salesOrders") },
    // { href: "/buyer/dashboard/invoices", label: "Invoices" },
    // { href: "/buyer/dashboard/payments", label: "Payments" },
    // { href: "/buyer/dashboard/wishlist", label: "Wishlist" },
    // { href: "/buyer/dashboard/messages", label: "Messages" },
    { href: "/buyer/dashboard/profile", label: td("buyerSidebar.profile") },
  ];

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/buyer/dashboard") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const Wrap = closeOnNavigate ? SheetClose : React.Fragment;
  const wrapProps = closeOnNavigate ? ({ asChild: true } as const) : ({} as const);

  return (
    <div className="px-4 py-6 bg-white">
      <div className="mb-6 flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">{td("common.buyerMenu")}</h2>
        <DashboardLanguageSwitcher className="shrink-0" />
      </div>

      <nav className="flex flex-col gap-2">
        {items.map((it) => {
          const active = isActive(it.href);
          return (
            <Wrap key={it.href} {...wrapProps}>
              <Link
                href={it.href}
                className={`block px-3 py-2 rounded hover:bg-gray-100 ${
                  active
                    ? "bg-gray-100 font-medium text-blue-600"
                    : "text-gray-700"
                }`}
              >
                {it.label}
              </Link>
            </Wrap>
          );
        })}

        <Wrap {...wrapProps}>
          <button
            onClick={handleLogout}
            className="mt-4 text-left px-3 py-2 rounded bg-red-50 text-red-600 hover:bg-red-100"
          >
            {td("common.logout")}
          </button>
        </Wrap>
      </nav>
    </div>
  );
}
