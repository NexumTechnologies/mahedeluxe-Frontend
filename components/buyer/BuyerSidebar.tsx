"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { clearAllClientAuthState } from "@/lib/authStorage";
import { SheetClose } from "@/components/ui/sheet";

type BuyerSidebarProps = {
  closeOnNavigate?: boolean;
};

export default function BuyerSidebar({ closeOnNavigate }: BuyerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    clearAllClientAuthState();
    router.replace("/");
    router.refresh();
  };

  const items = [
    { href: "/buyer/dashboard", label: "Dashboard" },
    { href: "/buyer/dashboard/products", label: "My Products" },
    { href: "/buyer/dashboard/orders", label: "Purchases" },
    { href: "/buyer/dashboard/sales-orders", label: "Sales Orders" },
    // { href: "/buyer/dashboard/invoices", label: "Invoices" },
    // { href: "/buyer/dashboard/payments", label: "Payments" },
    // { href: "/buyer/dashboard/wishlist", label: "Wishlist" },
    // { href: "/buyer/dashboard/messages", label: "Messages" },
    { href: "/buyer/dashboard/profile", label: "Profile" },
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
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900">Buyer Menu</h2>
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
            Logout
          </button>
        </Wrap>
      </nav>
    </div>
  );
}
