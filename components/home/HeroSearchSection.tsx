"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Briefcase,
  Cpu,
  Drill,
  Gem,
  Home,
  Package,
  Stethoscope,
} from "lucide-react";
import api from "@/lib/axios";
import { useI18n } from "@/components/LanguageProvider";

type BannerSlide = {
  id: string;
  image: string;
  imageAlt: string;
};

type ApiCategory = {
  _id?: string;
  id?: string | number;
  name?: string;
  image_url?: string | string[] | null;
};

type UiCategory = {
  id: string;
  name: string;
  imageUrl: string | null;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const CATEGORY_ICONS = [Package, Cpu, Home, Drill, Stethoscope, Briefcase, Gem];

const HERO_SLIDES: BannerSlide[] = [
  {
    id: "header-one",
    image: "/header (1).jpeg",
    imageAlt: "Marketplace header banner 1",
  },
  {
    id: "header-two",
    image: "/header (2).jpeg",
    imageAlt: "Marketplace header banner 2",
  },
];

async function fetchHeaderCategories(): Promise<UiCategory[]> {
  const res = await api.get("/category");
  const data = res.data;

  const raw: ApiCategory[] = data?.data?.items || data?.categories || data || [];

  const getImageUrl = (value: string | string[] | null | undefined) => {
    if (Array.isArray(value)) {
      const first = value.find((url) => typeof url === "string" && url.trim().length > 0);
      return first ? first.trim() : null;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return null;

      // Support older payloads that stored image_url as a JSON string array.
      if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("\"") && trimmed.endsWith("\""))) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            const first = parsed.find((url) => typeof url === "string" && url.trim().length > 0);
            return first ? first.trim() : null;
          }
          if (typeof parsed === "string" && parsed.trim()) {
            return parsed.trim();
          }
        } catch {
          // Fall through and use plain trimmed string.
        }
      }

      return trimmed;
    }

    return null;
  };

  return raw.slice(0, 10).map((cat, index) => ({
    id: String(cat?._id ?? cat?.id ?? index),
    name: String(cat?.name || "Category"),
    imageUrl: getImageUrl(cat?.image_url),
    Icon: CATEGORY_ICONS[index % CATEGORY_ICONS.length],
  }));
}

export default function HeroSearchSection() {
  const { dir, t } = useI18n();
  const [activeSlide, setActiveSlide] = useState(0);
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(new Set());
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["home-header-categories"],
    queryFn: fetchHeaderCategories,
  });

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % HERO_SLIDES.length);
    }, 6000);

    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="w-full bg-[#eef3fb]" dir={dir}>
      <div className="mx-auto w-full max-w-350 px-2 py-2 sm:px-6 sm:py-4 lg:px-8">
        <div className="relative flex flex-col overflow-hidden rounded-2xl border border-[#d8e4f5] bg-gradient-to-br from-[#e8f1ff] via-[#f6f9ff] to-[#fff7e6] shadow-[0_10px_26px_rgba(29,78,216,0.12)] sm:rounded-3xl sm:shadow-[0_18px_45px_rgba(29,78,216,0.16)] lg:min-h-[calc(100vh-90px)]">

          {/* ── Categories strip – above the banner ── */}
          <div className="border-b border-[#dbe5f4] bg-white/92 px-2 py-2 backdrop-blur sm:px-6 sm:py-3">
            {isLoading ? (
              <div className="px-2 text-xs font-medium text-slate-500 sm:text-sm">{t("home.loadingCategories")}</div>
            ) : (
              <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div
                  className="grid min-w-full gap-1.5 sm:gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${categories.length + 1}, minmax(88px, 1fr))`,
                  }}
                >
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/browse?category=${cat.id}`}
                    className="group flex min-w-[88px] flex-col items-center gap-1.5 rounded-lg px-1 py-2 transition hover:bg-[#eff6ff] sm:min-w-[96px] sm:gap-2 sm:rounded-xl"
                  >
                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-[#d9e2ef] bg-white text-[#475569] transition group-hover:border-[#2563eb] group-hover:text-[#2563eb] group-hover:shadow-sm sm:h-14 sm:w-14">
                      {cat.imageUrl && !failedImageIds.has(cat.id) ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={() => {
                            setFailedImageIds((prev) => {
                              const next = new Set(prev);
                              next.add(cat.id);
                              return next;
                            });
                          }}
                        />
                      ) : (
                        <cat.Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </div>
                    <span className="line-clamp-2 min-h-[28px] text-center text-[10px] font-semibold leading-[1.2] text-[#334155] sm:min-h-[30px] sm:text-[11px]">
                      {cat.name}
                    </span>
                  </Link>
                ))}
                <Link
                  href="/browse"
                  className="group flex min-w-[88px] flex-col items-center gap-1.5 rounded-lg px-1 py-2 transition hover:bg-[#eff6ff] sm:min-w-[96px] sm:gap-2 sm:rounded-xl"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed border-[#c5d1e2] bg-white text-[#64748b] transition group-hover:border-[#2563eb] group-hover:text-[#2563eb] group-hover:shadow-sm sm:h-14 sm:w-14">
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span className="min-h-[28px] text-center text-[10px] font-semibold leading-[1.2] text-[#334155] sm:min-h-[30px] sm:text-[11px]">
                    All Categories
                  </span>
                </Link>
                </div>
              </div>
            )}
          </div>

          {/* ── Hero banner ── */}
          <div className="p-2 sm:p-6 lg:p-8">
            <div className="relative h-[48vh] min-h-[310px] w-full max-h-[520px] overflow-hidden rounded-[20px] border border-white/70 shadow-[0_14px_30px_rgba(15,23,42,0.14)] sm:h-[46vh] sm:min-h-[320px] sm:max-h-none sm:rounded-[28px] sm:shadow-[0_20px_45px_rgba(15,23,42,0.18)] lg:h-[62vh] lg:min-h-[500px]">
              {HERO_SLIDES.map((item, index) => (
                <div
                  key={item.id}
                  className={`absolute inset-0 transition-opacity duration-[1400ms] ease-in-out ${
                    activeSlide === index ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    priority={index === 0}
                    className="object-cover object-center"
                    sizes="100vw"
                  />
                </div>
              ))}
              <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/12" />

              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/85 px-2 py-1 backdrop-blur sm:bottom-6 sm:left-6 sm:gap-2 sm:px-3 sm:py-2">
                {HERO_SLIDES.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`h-2 rounded-full transition-all sm:h-2.5 ${
                      activeSlide === index
                        ? "w-5 bg-[#1d4ed8] sm:w-6"
                        : "w-2 bg-[#93c5fd] hover:bg-[#60a5fa] sm:w-2.5"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

