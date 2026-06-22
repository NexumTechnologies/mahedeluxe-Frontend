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
import { useI18n } from "@/components/LanguageProvider";
import { useCurrency } from "@/components/CurrencyProvider";
import { formatPriceFromAED } from "@/lib/currency";

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
  price: number;
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
  const items =
    data?.data?.items ||
    data?.data ||
    data?.products ||
    data?.items ||
    data ||
    [];

  return (Array.isArray(items) ? items : []).map((item: SearchApiItem) => {
    const displayPrice =
      item.customer_price != null && !Number.isNaN(Number(item.customer_price))
        ? Number(item.customer_price)
        : Number(item.price) || 0;

    return {
      id: String(item.id),
      name: item.name || "Product",
      image: getSafeImageFromValue(item.image_url, "/dummy-product.png"),
      price: displayPrice,
    };
  });
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, dir, setLocale, t } = useI18n();
  const { currency, rates, setCurrency } = useCurrency();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [cartCount, setCartCount] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement | null>(null);
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);
  const currencyMenuRef = useRef<HTMLDivElement | null>(null);

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

    // Only redirect to dashboards for roles that have dedicated dashboards.
    // Customers with role 'user' (or legacy 'customer') should stay on the home page.
    const role = (user.role || "").toLowerCase();
    if (!["buyer", "seller", "admin"].includes(role)) return;

    const dashboardHref = getDashboardHref(role);
    router.replace(dashboardHref);
  }, [pathname, router, user?.role]);

  const handleSelectLang = (lang: "en" | "ar") => {
    setLocale(lang);
    setIsLangMenuOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!langMenuRef.current?.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (!currencyMenuRef.current?.contains(event.target as Node)) {
        setIsCurrencyMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

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
      window.addEventListener(
        "open-global-search",
        handleOpen as EventListener,
      );
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "open-global-search",
          handleOpen as EventListener,
        );
      }
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!searchContainerRef.current?.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const { data: searchResults = [], isFetching: isSearching } = useQuery<
    SearchProduct[]
  >({
    queryKey: ["header-product-search", debouncedSearchTerm],
    queryFn: () => searchProductsByName(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length > 0,
  });

  const handleSearchResultClick = (productId: string) => {
    setIsSearchOpen(false);
    setSearchTerm("");
    setDebouncedSearchTerm("");
    router.push(`/products/${productId}`);
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

  const mainNavItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/browse" },
    {
      label: "Become a Buyer",
      href: "/auth/register?role=buyer",
      activePath: "/auth/register",
    },
    {
      label: "Become a Seller",
      href: "/auth/register?role=seller",
      activePath: "/auth/register",
    },
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ];

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
            <div
              ref={searchContainerRef}
              className="relative hidden lg:flex flex-1 max-w-2xl mx-8"
            >
              <div
                className={`relative w-full rounded-2xl border bg-stone-50 shadow-sm transition-colors duration-300 ${
                  isSearchOpen
                    ? "border-[#efc9b4] bg-white"
                    : "border-stone-200 hover:border-[#efc9b4] hover:bg-white"
                }`}
              >
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setIsSearchOpen(true);
                  }}
                  placeholder={t("header.searchPlaceholder")}
                  className="h-[58px] w-full rounded-2xl bg-transparent pl-12 pr-12 text-sm text-slate-900 outline-hidden placeholder:text-slate-400"
                />
                {isSearching ? (
                  <LoaderCircle className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-slate-400" />
                ) : (
                  <span className="absolute right-3 top-1/2 inline-flex h-9 -translate-y-1/2 items-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white">
                    {t("header.openSearch")}
                  </span>
                )}
              </div>

              {isSearchOpen && (
                <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-50 max-h-[60vh] overflow-y-auto rounded-3xl border border-stone-200/80 bg-white p-2 shadow-[0_28px_90px_rgba(15,23,42,0.18)] sm:p-3">
                  {!debouncedSearchTerm && (
                    <div className="rounded-[1.15rem] border border-dashed border-stone-200 bg-stone-50/80 px-4 py-8 text-center text-sm text-slate-500">
                      {t("header.searchStartTyping")}
                    </div>
                  )}

                  {debouncedSearchTerm &&
                    !isSearching &&
                    searchResults.length === 0 && (
                      <div className="rounded-[1.15rem] border border-dashed border-stone-200 bg-stone-50/80 px-4 py-8 text-center text-sm text-slate-500">
                        {t("header.searchNoResults", { term: debouncedSearchTerm })}
                      </div>
                    )}

                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleSearchResultClick(product.id)}
                          className="flex w-full items-center gap-4 rounded-[1.15rem] border border-transparent bg-white px-4 py-3 text-left transition-all duration-200 hover:border-[#efc9b4] hover:bg-[#fff7f1]"
                        >
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[linear-gradient(145deg,#fff7f1_0%,#f7f7f5_52%,#eef3f8_100%)]">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-contain p-3"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                              {t("header.matchingProduct")}
                            </div>
                            <div className="mt-1 line-clamp-2 text-base font-semibold leading-6 text-slate-900">
                              {product.name}
                            </div>
                            <div className="mt-1 text-sm font-medium text-[#8d4d2b]">
                              {formatPriceFromAED(
                                product.price,
                                currency,
                                rates,
                                locale,
                              )}
                            </div>
                          </div>

                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                            {t("header.open")}
                            <ArrowUpRight className="h-4 w-4" />
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 lg:gap-6">
              <div ref={currencyMenuRef} className="relative flex">
                <button
                  type="button"
                  onClick={() => setIsCurrencyMenuOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-full border border-stone-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-[#efc9b4] hover:text-[#8d4d2b] sm:text-sm"
                  aria-expanded={isCurrencyMenuOpen}
                  aria-haspopup="menu"
                >
                  <span>{currency}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {isCurrencyMenuOpen && (
                  <div
                    className={`absolute top-[calc(100%+0.5rem)] ${dir === "rtl" ? "left-0" : "right-0"} z-50 w-28 rounded-xl border border-stone-200 bg-white p-1 shadow-lg`}
                  >
                    {(["AED", "USD", "EUR"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setCurrency(option);
                          setIsCurrencyMenuOpen(false);
                        }}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          currency === option
                            ? "bg-stone-100 font-semibold text-slate-900"
                            : "text-slate-600 hover:bg-stone-50"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Language (Desktop) - dropdown for English / Arabic */}
              <div ref={langMenuRef} className="relative hidden lg:flex">
                <button
                  type="button"
                  onClick={() => setIsLangMenuOpen((s) => !s)}
                  className="flex items-center gap-2 text-gray-700 hover:text-orange transition-colors"
                  aria-expanded={isLangMenuOpen}
                  aria-haspopup="menu"
                >
                  <Globe className="h-5 w-5 text-orange" />
                  <span className="text-sm font-medium">
                    {locale === "ar" ? t("header.arabic") : t("header.english")}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </button>

                {isLangMenuOpen && (
                  <div
                    className={`absolute ${dir === "rtl" ? "left-0" : "right-0"} z-50 mt-2 w-40 rounded-md border bg-white shadow-lg`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectLang("en")}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50"
                    >
                      {t("header.english")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectLang("ar")}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50"
                    >
                      {t("header.arabic")}
                    </button>
                  </div>
                )}
              </div>

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
                      <span className="text-[11px] text-gray-500">
                        {t("header.hi")}
                      </span>
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
                    <span className="hidden xl:inline">
                      {t("header.logout")}
                    </span>
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
                      {t("header.businessRegistration")}
                    </span>
                  </Link>

                  {/* Login */}
                  <Link
                    href="/auth/signin"
                    className="flex items-center gap-2 text-gray-700 hover:text-orange transition-colors"
                  >
                    <LogIn className="h-6 w-6" />
                    <span className="hidden xl:block text-sm font-medium">
                      {t("header.login")}
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <div className="border-b border-gray-100 bg-white px-4 py-3 lg:hidden">
          <div ref={searchContainerRef} className="mx-auto max-w-350">
            <div className="relative rounded-2xl border border-stone-200 bg-stone-50 shadow-sm">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t("header.searchPlaceholder")}
                className="h-12 w-full rounded-2xl bg-transparent pl-12 pr-10 text-sm text-slate-900 outline-hidden placeholder:text-slate-400"
              />
              {isSearching && (
                <LoaderCircle className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-slate-400" />
              )}
            </div>

            <div className="mt-3 max-h-[50vh] overflow-y-auto rounded-3xl border border-stone-200/80 bg-white p-2 shadow-lg">
              {!debouncedSearchTerm && (
                <div className="rounded-[1.15rem] border border-dashed border-stone-200 bg-stone-50/80 px-4 py-6 text-center text-sm text-slate-500">
                  {t("header.searchStartTyping")}
                </div>
              )}

              {debouncedSearchTerm &&
                !isSearching &&
                searchResults.length === 0 && (
                  <div className="rounded-[1.15rem] border border-dashed border-stone-200 bg-stone-50/80 px-4 py-6 text-center text-sm text-slate-500">
                    {t("header.searchNoResults", { term: debouncedSearchTerm })}
                  </div>
                )}

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleSearchResultClick(product.id)}
                      className="flex w-full items-center gap-3 rounded-[1.15rem] border border-transparent bg-white px-3 py-3 text-left transition-all duration-200 hover:border-[#efc9b4] hover:bg-[#fff7f1]"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[linear-gradient(145deg,#fff7f1_0%,#f7f7f5_52%,#eef3f8_100%)]">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-3"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {t("header.matchingProduct")}
                        </div>
                        <div className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-slate-900">
                          {product.name}
                        </div>
                        <div className="mt-1 text-sm font-medium text-[#8d4d2b]">
                          {formatPriceFromAED(
                            product.price,
                            currency,
                            rates,
                            locale,
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Secondary Navigation Bar */}
      <nav className="w-full border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-350 px-2 sm:px-4 lg:px-8">
          <ul className="flex items-center gap-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {mainNavItems.map(({ label, href, activePath }) => (
              <li key={href} className="shrink-0">
                <Link
                  href={href}
                  className={`inline-block px-3 py-2.5 text-[11px] font-semibold tracking-wide uppercase transition-colors hover:text-orange sm:px-4 sm:py-3 sm:text-[12px] lg:text-[13px] ${
                    pathname === (activePath || href)
                      ? "text-orange border-b-2 border-orange"
                      : "text-gray-700"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

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
