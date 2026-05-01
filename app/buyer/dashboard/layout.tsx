import React from "react";
import BuyerSidebar from "@/components/buyer/BuyerSidebar";
import { useI18n } from "@/components/LanguageProvider";
import { translateDashboard } from "@/lib/dashboard-i18n";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const metadata = {
  title: "Buyer Dashboard",
};

export default function BuyerDashboardLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useI18n();
  const td = (key: string, vars?: Record<string, string | number>) =>
    translateDashboard(locale, key, vars);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="hidden md:block w-64 shrink-0 border-r bg-white md:sticky md:top-0 md:h-screen">
          <BuyerSidebar />
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b bg-slate-50/80 backdrop-blur supports-backdrop-filter:bg-slate-50/60 md:hidden">
            <div className="flex h-14 items-center gap-3 px-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" aria-label={td("common.openBuyerNavigation")}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-5"
                    >
                      <path
                        d="M4 6H20M4 12H20M4 18H20"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 bg-white border-r">
                  <SheetHeader className="border-b">
                    <SheetTitle>
                      <Link href="/buyer/dashboard" className="font-semibold">
                        {td("common.buyerDashboard")}
                      </Link>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="p-0">
                    <BuyerSidebar closeOnNavigate />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">{td("common.dashboard")}</div>
                <div className="text-[11px] text-slate-500">{td("common.buyer")}</div>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
