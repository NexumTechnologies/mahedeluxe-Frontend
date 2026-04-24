"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Menu,
  ShoppingCart,
  Briefcase,
  LogIn,
  LogOut,
  Globe,
  MapPin,
  ChevronDown,
  ArrowUpRight,
  LoaderCircle,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { getSafeImageFromValue } from "@/lib/utils";
import { clearAllClientAuthState, getStoredUser } from "@/lib/authStorage";
import { getGuestCart } from "@/lib/cartStorage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type HeaderUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
};

type SearchProduct = {
  id: string;
  name: string;
  image: string;
  price: string;
};

type SearchApiItem = {
  id?: string | number;
  name?: string;
  image_url?: string | null;
  price?: string | number | null;
  customer_price?: string | number | null;
};

async function searchProductsByName(search: string): Promise<SearchProduct[]> {
  const trimmedSearch = search.trim();
  if (!trimmedSearch) return [];

  const response = await api.get("/product/public/listed", {
    params: {
      limit: 12,
      search: trimmedSearch,
    },
  });

  const data = response.data;
  const items = data?.data?.items || data?.data || data?.products || data?.items || data || [];

  return (Array.isArray(items) ? items : []).map((item: SearchApiItem) => {
    const displayPrice =
      item.customer_price != null && !Number.isNaN(Number(item.customer_price))
        ? Number(item.customer_price)
        : Number(item.price) || 0;

    return {
      id: String(item.id),
      name: item.name || "Product",
      image: getSafeImageFromValue(item.image_url, "/dummy-product.png"),
      price: `${displayPrice} AED`,
    };
  });
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [cartCount, setCartCount] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const getDashboardHref = (role?: string) => {
    if (role === "buyer") return "/buyer/dashboard";
    if (role === "seller") return "/seller/dashboard";
    if (role === "admin") return "/admin/dashboard";
    return "/user/dashboard";
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore logout API errors and still clear local state
    }

    clearAllClientAuthState();
    setUser(null);
    router.push("/");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load auth user from localStorage and react to auth changes.
  useEffect(() => {
    const loadUserFromStorage = () => {
      if (typeof window === "undefined") return;
      try {
        const storedUser = getStoredUser();
        if (!storedUser) {
          setUser(null);
          return;
        }
        setUser(storedUser as HeaderUser);
      } catch {
        setUser(null);
      }
    };

    loadUserFromStorage();

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === "user" || event.key === "token") {
        loadUserFromStorage();
      }
    };

    const handleAuthChange: EventListener = () => {
      loadUserFromStorage();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
      // Custom event fired from login/logout handlers.
      window.addEventListener("auth-change", handleAuthChange);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener("auth-change", handleAuthChange);
      }
    };
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    if (!user?.role) return;

    const dashboardHref = getDashboardHref(user.role);
    router.replace(dashboardHref);
  }, [pathname, router, user?.role]);

  // Show account cart count when logged in, otherwise fall back to the guest cart.
  useEffect(() => {
    const fetchCartCount = async () => {
      if (typeof window === "undefined") return;
      if (!user) {
        setCartCount(getGuestCart().totalItems || null);
        return;
      }

      try {
        // Use cookie-based auth via axios `withCredentials` instead of a localStorage token.
        const res = await api.get("/addToCart");
        const cart = res.data?.data || res.data || {};
        const items = cart.items || [];
        const total =
          typeof cart.totalItems === "number" ? cart.totalItems : items.length;
        setCartCount(total);
      } catch {
        setCartCount(null);
      }
    };

    fetchCartCount();
    const handleGuestCartChange = () => {
      if (!user) {
        setCartCount(getGuestCart().totalItems || null);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("guest-cart-change", handleGuestCartChange);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("guest-cart-change", handleGuestCartChange);
      }
    };
  }, [user]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  useEffect(() => {
    if (!isSearchOpen) return;

    const timeoutId = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isSearchOpen]);

  // Listen for a global event so other components (e.g., home hero) can open search.
  useEffect(() => {
    const handleOpen = () => setIsSearchOpen(true);
    if (typeof window !== "undefined") {
      window.addEventListener("open-global-search", handleOpen as EventListener);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("open-global-search", handleOpen as EventListener);
      }
    };
  }, []);

  const {
    data: searchResults = [],
    isFetching: isSearching,
  } = useQuery<SearchProduct[]>({
    queryKey: ["header-product-search", debouncedSearchTerm],
    queryFn: () => searchProductsByName(debouncedSearchTerm),
    enabled: isSearchOpen && debouncedSearchTerm.length > 0,
  });

  const handleSearchResultClick = (productId: string) => {
    setIsSearchOpen(false);
    router.push(`/products/${productId}`);
  };

  const handleSearchOpenChange = (open: boolean) => {
    setIsSearchOpen(open);
    if (!open) {
      setSearchTerm("");
      setDebouncedSearchTerm("");
    }
  };

  const profileHref = (() => {
    return getDashboardHref(user?.role);
  })();

  const userInitials = (() => {
    const source = user?.name || user?.email || "";
    if (!source) return "";
    const parts = source.trim().split(/\s+/);
    if (parts.length === 1) {
      const [single] = parts;
      return single.slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  })();

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-white"
      }`}
    >
      {/* Main Header Bar */}
      <div className="w-full border-b border-gray-200">
        <div className="mx-auto max-w-350 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left: Logo */}
            <div className="flex items-center gap-4 lg:gap-8">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden text-gray-700 hover:text-orange transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>

              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="B2B Marketplace Logo"
                  width={180}
                  height={64}
                  className="h-7 w-auto sm:h-8 lg:h-16 object-contain"
                />
              </Link>
            </div>

            {/* Center: Search Bar (Desktop Only) */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="relative w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-left shadow-sm transition-colors duration-300 hover:border-[#efc9b4] hover:bg-white"
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <div className="pr-28 pl-8">
                  <div className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Search products
                  </div>
                  {/* <div className="mt-1 text-sm text-slate-600">
                    Find a product by name and jump straight to its detail page.
                  </div> */}
                </div>
                <span className="absolute right-3 top-1/2 inline-flex h-9 -translate-y-1/2 items-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white">
                  Open Search
                </span>
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 lg:gap-6">
              {/* Mobile Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="lg:hidden text-gray-700 hover:text-orange transition-colors"
              >
                <Search className="h-6 w-6" />
              </button>

              {/* Location (Desktop) */}
              <div className="hidden lg:flex items-center gap-2 text-sm text-gray-700 hover:text-orange transition-colors cursor-pointer group">
                <MapPin className="h-4 w-4 text-orange" />
                <span className="font-medium">UAE</span>
                <ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Language (Desktop) */}
              <button className="hidden lg:flex items-center gap-2 text-gray-700 hover:text-orange transition-colors">
                <Globe className="h-5 w-5 text-orange" />
              </button>

              {/* Cart */}
              <Link
                href="/checkout"
                className="relative text-gray-700 hover:text-orange transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange px-0.5 text-[10px] text-white">
                  {cartCount ?? 0}
                </span>
              </Link>

              {/* Auth / Profile */}
              {user ? (
                <div className="hidden lg:flex items-center gap-3">
                  <Link
                    href={profileHref}
                    className="flex items-center gap-2 rounded-full bg-gray-50 px-2.5 py-1 hover:bg-gray-100 transition-colors"
                  >
                    <div className="relative h-8 w-8 rounded-full overflow-hidden bg-blue text-white flex items-center justify-center text-xs font-semibold">
                      {user.avatarUrl ? (
                        <Image
                          src={user.avatarUrl}
                          alt={user.name || "Profile"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span>{userInitials}</span>
                      )}
                    </div>
                    <div className="hidden max-w-30 flex-col items-start leading-tight xl:flex">
                      <span className="text-[11px] text-gray-500">Hi,</span>
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {user.name || user.email}
                      </span>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-orange transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden xl:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Business Registration */}
                  <Link
                    href="/auth/register"
                    className="flex items-center gap-2 text-gray-700 hover:text-orange transition-colors"
                  >
                    <Briefcase className="h-6 w-6" />
                    <span className="hidden xl:block text-sm font-medium">
                      Business Registration
                    </span>
                  </Link>

                  {/* Login */}
                  <Link
                    href="/auth/signin"
                    className="flex items-center gap-2 text-gray-700 hover:text-orange transition-colors"
                  >
                    <LogIn className="h-6 w-6" />
                    <span className="hidden xl:block text-sm font-medium">
                      Login
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isSearchOpen} onOpenChange={handleSearchOpenChange}>
        <DialogContent className="max-w-[calc(100%-1.25rem)] rounded-[1.75rem] border-stone-200 bg-[#fffdfa] p-0 shadow-[0_28px_90px_rgba(15,23,42,0.18)] sm:max-w-3xl">
          <DialogHeader className="border-b border-stone-200/80 px-5 py-5 sm:px-7 sm:py-6">
            <DialogTitle className="text-2xl text-slate-900 sm:text-3xl">
              Search products
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-slate-500">
              Type a product name and open the exact detail page from the matching results.
            </DialogDescription>
          </DialogHeader>

          <div className="px-5 pb-5 pt-4 sm:px-7 sm:pb-7">
            <div className="relative rounded-[1.4rem] border border-stone-200 bg-white shadow-sm">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by product name"
                className="h-14 w-full rounded-[1.4rem] bg-transparent pl-12 pr-12 text-sm text-slate-900 outline-hidden placeholder:text-slate-400 sm:h-16 sm:text-base"
              />
              {isSearching && (
                <LoaderCircle className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-slate-400" />
              )}
            </div>

            <div className="mt-5 max-h-[60vh] overflow-y-auto rounded-3xl border border-stone-200/80 bg-white/90 p-2 sm:p-3">
              {!debouncedSearchTerm && (
                <div className="rounded-[1.15rem] border border-dashed border-stone-200 bg-stone-50/80 px-4 py-8 text-center text-sm text-slate-500">
                  Start typing a product name to see matching items.
                </div>
              )}

              {debouncedSearchTerm && !isSearching && searchResults.length === 0 && (
                <div className="rounded-[1.15rem] border border-dashed border-stone-200 bg-stone-50/80 px-4 py-8 text-center text-sm text-slate-500">
                  No products found for &quot;{debouncedSearchTerm}&quot;.
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleSearchResultClick(product.id)}
                      className="flex w-full items-center gap-3 rounded-[1.15rem] border border-transparent bg-white px-3 py-3 text-left transition-all duration-200 hover:border-[#efc9b4] hover:bg-[#fff7f1] sm:gap-4 sm:px-4"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[linear-gradient(145deg,#fff7f1_0%,#f7f7f5_52%,#eef3f8_100%)] sm:h-20 sm:w-20">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-3"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Matching product
                        </div>
                        <div className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-slate-900 sm:text-base">
                          {product.name}
                        </div>
                        <div className="mt-1 text-sm font-medium text-[#8d4d2b]">
                          {product.price}
                        </div>
                      </div>

                      <span className="hidden items-center gap-1 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white sm:inline-flex">
                        Open
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Navigation Bar (Desktop Only) - hidden on seller/buyer dashboards */}
      {/* {!isDashboard && (
        <div className="hidden lg:block border-b border-gray-100 bg-gray-50">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-8 h-12">
              <Link
                href="/browse"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-orange transition-colors"
              >
                <Menu className="h-4 w-4" />
                <span>Browse All</span>
              </Link>

              <Link
                href="/flash-sales"
                className="text-sm font-medium text-gray-700 hover:text-orange transition-colors"
              >
                Flash Sales
              </Link>

              <Link
                href="/best-sellers"
                className="text-sm font-medium text-gray-700 hover:text-orange transition-colors"
              >
                Best Sellers
              </Link>

              <Link
                href="/custom-orders"
                className="text-sm font-medium text-gray-700 hover:text-orange transition-colors"
              >
                Custom Orders
              </Link>

              <Link
                href="/on-demand"
                className="text-sm font-medium text-gray-700 hover:text-orange transition-colors"
              >
                On-Demand
              </Link>

              <div className="flex-1" />

              <Link
                href="/suppliers"
                className="text-sm font-medium text-gray-700 hover:text-orange transition-colors"
              >
                Find Suppliers
              </Link>

              <Link
                href="/auth/seller/signin"
                className="text-sm font-semibold text-orange hover:text-blue transition-colors"
              >
                Become a Vendor
              </Link>
            </nav>
          </div>
        </div>
      )} */}

      {/* Mobile Menu Drawer */}
      {/* {isMobileMenuOpen && !isDashboard && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-80 bg-white z-50 lg:hidden shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-orange">
              <span className="text-white text-lg font-bold">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            
            <div className="p-4">
              <div className="mb-6 pb-6 border-b border-gray-200 space-y-2">
                <Link
                  href="/auth/seller/register"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-10 h-10 rounded-full bg-orange flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Business Registration</div>
                    <div className="text-sm text-gray-600">Create a business account</div>
                  </div>
                </Link>

                <Link
                  href="/auth/signin"
                  className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                    <LogIn className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Login</div>
                    <div className="text-sm text-gray-600">Access your account</div>
                  </div>
                </Link>
              </div>

              <nav className="space-y-1">
                <Link
                  href="/browse"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-orange rounded-lg transition-colors font-medium"
                >
                  <Menu className="h-5 w-5" />
                  <span>Browse All</span>
                </Link>

                <Link
                  href="/flash-sales"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-orange rounded-lg transition-colors"
                >
                  <span className="w-5 h-5 flex items-center justify-center">
                    🔥
                  </span>
                  <span>Flash Sales</span>
                </Link>

                <Link
                  href="/best-sellers"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-orange rounded-lg transition-colors"
                >
                  <span className="w-5 h-5 flex items-center justify-center">
                    ⭐
                  </span>
                  <span>Best Sellers</span>
                </Link>

                <Link
                  href="/custom-orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-orange rounded-lg transition-colors"
                >
                  <span className="w-5 h-5 flex items-center justify-center">
                    📋
                  </span>
                  <span>Custom Orders</span>
                </Link>

                <Link
                  href="/on-demand"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-orange rounded-lg transition-colors"
                >
                  <span className="w-5 h-5 flex items-center justify-center">
                    ⚙️
                  </span>
                  <span>On-Demand</span>
                </Link>

                <div className="pt-4 mt-4 border-t border-gray-200">
                  <Link
                    href="/suppliers"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-orange rounded-lg transition-colors"
                  >
                    <span className="w-5 h-5 flex items-center justify-center">
                      🏭
                    </span>
                    <span>Find Suppliers</span>
                  </Link>

                  <Link
                    href="/support"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-orange rounded-lg transition-colors"
                  >
                    <span className="w-5 h-5 flex items-center justify-center">
                      💬
                    </span>
                    <span>Support</span>
                  </Link>

                  <Link
                    href="/auth/seller/signin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 bg-orange text-white rounded-lg hover:opacity-90 transition-opacity font-semibold mt-2"
                  >
                    <span className="w-5 h-5 flex items-center justify-center">
                      ✨
                    </span>
                    <span>Become a Vendor</span>
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </>
      )} */}
    </header>
  );
}
