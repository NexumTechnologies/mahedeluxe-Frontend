"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { clearAllClientAuthState } from "@/lib/authStorage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const ActiveAdminHrefContext = React.createContext<string | null>(null);

type AdminNavItem = { href: string; label: string };
type AdminNavSection = { title: string; items: AdminNavItem[] };

const ADMIN_NAV: AdminNavSection[] = [
  {
    title: "Dashboard",
    items: [{ href: "/admin/dashboard", label: "Overview" }],
  },
  {
    title: "User Management",
    items: [
      { href: "/admin/users/buyers", label: "Buyers" },
      { href: "/admin/users/sellers", label: "Sellers" },
      { href: "/admin/users/customers", label: "Customers" },
      { href: "/admin/users/admins", label: "Admin Users" },
    ],
  },
  {
    title: "Category Management",
    items: [{ href: "/admin/categories", label: "Categories" }],
  },
  {
    title: "Approvals",
    items: [
      { href: "/admin/approvals/buyers", label: "Buyer Approvals" },
      { href: "/admin/approvals/sellers", label: "Seller Approvals" },
    ],
  },
  {
    title: "Product Management",
    items: [
      { href: "/admin/products", label: "All Products" },
      { href: "/admin/products/own", label: "Own Products" },
    ],
  },
  {
    title: "Commission",
    items: [{ href: "/admin/orders/percentage", label: "Order Percentage" }],
  },
  {
    title: "Order Management",
    items: [
      { href: "/admin/orders", label: "All Orders" },
      { href: "/admin/orders/my-sales", label: "My Sales Orders" },
      { href: "/admin/orders/pending", label: "Pending Orders" },
      { href: "/admin/orders/completed", label: "Completed Orders" },
      { href: "/admin/orders/cancelled", label: "Cancelled / Refunded" },
    ],
  },
  // {
  //   title: "Reports & Analytics",
  //   items: [
  //     { href: "/admin/reports/sales", label: "Sales Reports" },
  //     { href: "/admin/reports/users", label: "User Reports" },
  //     { href: "/admin/reports/revenue", label: "Revenue Reports" },
  //   ],
  // },
];

function getAdminPageTitle(pathname: string | null) {
  if (!pathname) return "Admin";

  const match = ADMIN_NAV.flatMap((s) => s.items)
    .sort((a, b) => b.href.length - a.href.length)
    .find((i) => pathname === i.href || pathname.startsWith(i.href + "/"));

  if (match) return match.label;

  const segment = pathname.replace(/\/$/, "").split("/").filter(Boolean).at(-1);
  if (!segment) return "Admin";

  return segment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  const activeHref = React.useMemo(() => {
    if (!pathname) return null;

    const match = ADMIN_NAV.flatMap((s) => s.items)
      .sort((a, b) => b.href.length - a.href.length)
      .find((i) => pathname === i.href || pathname.startsWith(i.href + "/"));

    return match?.href ?? null;
  }, [pathname]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      clearAllClientAuthState();
      setLoggingOut(false);
      router.push("/");
      router.refresh();
    }
  };

  return (
    <ActiveAdminHrefContext.Provider value={activeHref}>
      <div className="min-h-screen bg-background text-foreground">
      <a
        href="#admin-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>

      <div className="flex min-h-screen">
          {/* Desktop sidebar */}
          <aside className="hidden md:flex w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:h-screen md:overflow-visible">
          <AdminSidebarHeader />
            <ScrollArea className="flex-1 overflow-auto">
            <nav className="space-y-3 px-4 py-4">
              {ADMIN_NAV.map((section) => (
                <Section key={section.title} title={section.title}>
                  {section.items.map((item) => (
                    <NavItem key={item.href} href={item.href}>
                      {item.label}
                    </NavItem>
                  ))}
                </Section>
              ))}
            </nav>
          </ScrollArea>

          <div className="p-4 border-t border-sidebar-border">
            <Button
              onClick={handleLogout}
              disabled={loggingOut}
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
            >
              {loggingOut ? "Logging out…" : "Logout"}
            </Button>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
              {/* Mobile menu */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Open admin navigation"
                    >
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

                  <SheetContent
                    side="left"
                    className="p-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border"
                  >
                    <SheetHeader className="border-b">
                      <SheetTitle>
                        <Link href="/admin/dashboard" className="font-semibold">
                          Admin Panel
                        </Link>
                      </SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-56px-72px)]">
                      <nav className="px-3 py-4">
                        {ADMIN_NAV.map((section) => (
                          <Section key={section.title} title={section.title}>
                            {section.items.map((item) => (
                              <NavItem
                                key={item.href}
                                href={item.href}
                                closeOnMobile
                              >
                                {item.label}
                              </NavItem>
                            ))}
                          </Section>
                        ))}
                      </nav>
                    </ScrollArea>

                    <div className="p-4 border-t">
                      <SheetClose asChild>
                        <Button
                          onClick={handleLogout}
                          disabled={loggingOut}
                          variant="ghost"
                          className="w-full justify-start text-destructive hover:text-destructive"
                        >
                          {loggingOut ? "Logging out…" : "Logout"}
                        </Button>
                      </SheetClose>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {getAdminPageTitle(pathname)}
                </div>
                <div className="hidden sm:block text-xs text-muted-foreground truncate">
                  {pathname}
                </div>
              </div>

              <div className="hidden md:block">
                <Button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                >
                  {loggingOut ? "Logging out…" : "Logout"}
                </Button>
              </div>
            </div>
          </header>

          <main id="admin-content" className="px-4 py-6 sm:px-6">
            <div className="mx-auto w-full max-w-350">{children}</div>
          </main>
        </div>
      </div>
      </div>
    </ActiveAdminHrefContext.Provider>
  );
}

function AdminSidebarHeader() {
  return (
    <div className="px-5 py-5 border-b border-sidebar-border">
      <Link href="/admin/dashboard" className="flex items-center gap-2">
        <div className="size-10 rounded-xl bg-sidebar-accent flex items-center justify-center border border-sidebar-border shadow-sm">
          <span className="text-sm font-semibold text-sidebar-primary">A</span>
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">
            Admin Panel
          </div>
          <div className="text-xs text-muted-foreground">
            Manage your marketplace
          </div>
        </div>
      </Link>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const activeHref = React.useContext(ActiveAdminHrefContext);

  const getHrefProp = (child: React.ReactElement): string | null => {
    const props = child.props as unknown;
    if (!props || typeof props !== "object") return null;
    const href = (props as { href?: unknown }).href;
    return typeof href === "string" ? href : null;
  };

  // determine if any child NavItem matches current pathname; if so, open the section by default
  const childrenArray = React.Children.toArray(children);
  const hasActive = childrenArray.some((child) => {
    if (!React.isValidElement(child)) return false;
    const href = getHrefProp(child);
    if (!href || !activeHref) return false;
    return activeHref === href;
  });

  const [open, setOpen] = useState(hasActive);

  React.useEffect(() => {
    if (hasActive) setOpen(true);
  }, [hasActive]);

  return (
    <div className="">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between px-2.5 py-2 text-[11px] uppercase tracking-wide font-semibold rounded-lg transition-colors",
          open
            ? "text-sidebar-foreground"
            : "text-muted-foreground hover:text-sidebar-foreground",
        )}
        aria-expanded={open}
      >
        <span>{title}</span>
        <svg
          className={cn(
            "w-4 h-4 transform transition-transform duration-200",
            open ? "rotate-90" : "rotate-0",
          )}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 4L14 10L6 16V4Z" fill="currentColor" />
        </svg>
      </button>

      <div
            className={cn(
              "mt-1 space-y-1 overflow-hidden border-l border-sidebar-border pl-3 ml-2 transition-[max-height] duration-200",
              open ? "max-h-[60vh]" : "max-h-0",
            )}
          >
        {children}
      </div>
    </div>
  );
}

function NavItem({
  href,
  children,
  closeOnMobile,
}: {
  href: string;
  children: React.ReactNode;
  closeOnMobile?: boolean;
}) {
  const activeHref = React.useContext(ActiveAdminHrefContext);
  const isActive = activeHref === href;

  const link = (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative block rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <span
        className={cn(
          "absolute left-0 top-1/2 h-5 w-1.5 -translate-y-1/2 rounded-r transition-colors",
          isActive
            ? "bg-sidebar-primary"
            : "bg-transparent group-hover:bg-sidebar-primary/60",
        )}
        aria-hidden="true"
      />
      <span className="pl-2 block truncate">{children}</span>
    </Link>
  );

  if (closeOnMobile) {
    return <SheetClose asChild>{link}</SheetClose>;
  }

  return link;
}
