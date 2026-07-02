"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Shirt,
  Monitor,
  Gem,
  Home,
  Footprints,
  Package,
  Cpu,
  ArrowRight,
} from "lucide-react";
import api from "@/lib/axios";
import { useI18n } from "@/components/LanguageProvider";

type ApiCategory = {
  _id?: string;
  id?: string | number;
  name?: string;
};

type UiCategory = {
  id: string;
  name: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const CATEGORY_ICONS = [Shirt, Monitor, Gem, Home, Footprints, Package, Cpu];

//========================= API CALLS ==========================//
//==============================================================//
async function fetchTopCategories(): Promise<UiCategory[]> {
  const res = await api.get("/category");
  const data = res.data;

  const raw: ApiCategory[] = data?.data?.items || data?.categories || data || [];

  return raw.slice(0, 10).map((cat, index) => ({
    id: String(cat?._id ?? cat?.id ?? index),
    name: String(cat?.name || "Category"),
    Icon: CATEGORY_ICONS[index % CATEGORY_ICONS.length],
  }));
}

export default function TopCategoriesBar() {
  const { dir, t } = useI18n();
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["top-home-categories"],
    queryFn: fetchTopCategories,
  });

  return (
    <section className="w-full border-b border-[#e6ded3] bg-[#fffaf3]" dir={dir}>
      <div className="mx-auto flex w-full max-w-350 items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="hidden items-center gap-2 rounded-full bg-[#1f1f1f] px-3 py-1.5 text-xs font-semibold text-white md:flex">
          <span>{t("home.categoriesTitleHighlight")}</span>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1">
          {isLoading ? (
            <div className="text-sm text-gray-500">{t("home.loadingCategories")}</div>
          ) : (
            categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/browse?category=${cat.id}`}
                className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-[#e7dac6] bg-white px-3 py-2 text-sm text-gray-700 transition hover:border-[#f59e0b] hover:text-[#1f2937]"
              >
                <cat.Icon className="h-4 w-4 text-[#f59e0b]" />
                <span className="font-medium">{cat.name}</span>
              </Link>
            ))
          )}
        </div>

        <Link
          href="/browse"
          className="hidden items-center gap-1 text-sm font-semibold text-[#1f2937] hover:text-[#f59e0b] sm:inline-flex"
        >
          <span>{t("home.viewAllCategories")}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
