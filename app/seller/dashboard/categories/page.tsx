"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useI18n } from "@/components/LanguageProvider";
import { translateDashboard } from "@/lib/dashboard-i18n";

export default function SellerCategoriesPage() {
  const { dir, locale } = useI18n();
  const td = (key: string, vars?: Record<string, string | number>) =>
    translateDashboard(locale, key, vars);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await api.get("/category");
      return res.data;
    },
  });

  const categories = data?.data?.items || data?.categories || data || [];

  if (isLoading) return <div className="p-6">{td("common.loading")}</div>;

  if (error)
    return <div className="p-6 text-red-500">{td("sellerCategories.failed")}</div>;

  return (
    <div className="p-6" dir={dir}>
      <h1 className="text-2xl font-bold mb-4 text-blue">{td("sellerSidebar.categories")}</h1>

      {categories.length === 0 ? (
        <div className="text-gray-500 text-center py-8">{td("sellerCategories.empty")}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((item: any, index: number) => (
            <div
              key={item.id ?? item._id ?? item.name ?? index}
              className="bg-white border border-blue-100 rounded-xl shadow-sm p-6 flex flex-col items-start hover:shadow-md transition-shadow min-h-30"
            >
              <div className="flex items-center mb-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                  </svg>
                </span>
                <span className="font-semibold text-lg text-blue-700">{item.name}</span>
              </div>
              {item.description && (
                <div className="text-gray-500 text-sm mt-1 line-clamp-2">{item.description}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
