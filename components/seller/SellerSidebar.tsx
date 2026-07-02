"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/axios";
import { clearAllClientAuthState } from "@/lib/authStorage";
import { useI18n } from "@/components/LanguageProvider";
import { SheetClose } from "@/components/ui/sheet";
import DashboardLanguageSwitcher from "@/components/DashboardLanguageSwitcher";
import { translateDashboard } from "@/lib/dashboard-i18n";
import {
  LayoutDashboard,
  Tags,
  Package,
  ShoppingBag,
  User2,
  LogOut,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type SellerSidebarProps = {
  closeOnNavigate?: boolean;
};

export default function SellerSidebar({ closeOnNavigate }: SellerSidebarProps) {
  const { locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const td = (key: string, vars?: Record<string, string | number>) =>
    translateDashboard(locale, key, vars);

  //========================= API CALLS ==========================//
  //==============================================================//
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    clearAllClientAuthState();
    router.replace("/");
    router.refresh();
  };

  const items: NavItem[] = [
    { href: "/seller/dashboard", label: td("common.dashboard"), icon: LayoutDashboard },
    { href: "/seller/dashboard/categories", label: td("sellerSidebar.categories"), icon: Tags },
    { href: "/seller/dashboard/products", label: td("sellerSidebar.products"), icon: Package },
    { href: "/seller/dashboard/orders", label: td("sellerSidebar.myOrders"), icon: ShoppingBag },
    { href: "/seller/dashboard/profile", label: td("sellerSidebar.profile"), icon: User2 },
  ];

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/seller/dashboard") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const Wrap = closeOnNavigate ? SheetClose : React.Fragment;
  const wrapProps = closeOnNavigate
    ? ({ asChild: true } as const)
    : ({} as const);

  return (
    <div className="px-4 py-4 lg:py-6 lg:sticky lg:top-0 lg:h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-gray-400">
            {td("common.seller")}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-gray-900">
            {td("common.dashboardMenu")}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full bg-blue/5 px-3 py-1 text-[11px] font-medium text-blue lg:inline-flex">
            {td("common.manageStore")}
          </span>
          <DashboardLanguageSwitcher className="shrink-0" />
        </div>
      </div>

      <nav className="space-y-1">
        {items.map((it) => {
          const active = isActive(it.href);
          const Icon = it.icon;

          return (
            <Wrap key={it.href} {...wrapProps}>
              <Link
                href={it.href}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                  active
                    ? "bg-blue text-white shadow-md shadow-blue/20"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border text-[13px] transition-all ${
                      active
                        ? "border-white/30 bg-white/10 text-white"
                        : "border-gray-200 bg-white text-gray-500 group-hover:border-blue/30 group-hover:text-blue"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="font-medium">{it.label}</span>
                </div>
                {active && (
                  <span className="h-2 w-2 rounded-full bg-white lg:bg-emerald-400" />
                )}
              </Link>
            </Wrap>
          );
        })}

        <Wrap {...wrapProps}>
          <button
            onClick={handleLogout}
            className="mt-4 flex w-full items-center justify-between rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <LogOut className="h-4 w-4" />
              </span>
              <span>{td("common.logout")}</span>
            </span>
          </button>
        </Wrap>
      </nav>
    </div>
  );
}
