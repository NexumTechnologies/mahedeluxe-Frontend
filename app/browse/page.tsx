"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BrowseBanner from "@/components/browse/BrowseBanner";
import BrowseSidebar from "@/components/browse/BrowseSidebar";
import BrowseContent from "@/components/browse/BrowseContent";
import BrowseCategoryLanding from "@/components/browse/BrowseCategoryLanding";

function BrowsePageBody() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");

  if (categoryId) {
    return (
      <>
        <BrowseBanner categoryName="Subcategories" />
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <Suspense fallback={<div className="w-full lg:w-72">Loading filters...</div>}>
              <BrowseSidebar />
            </Suspense>
            <BrowseCategoryLanding categoryId={categoryId} />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <BrowseBanner />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <Suspense fallback={<div className="w-full lg:w-72">Loading filters...</div>}>
            <BrowseSidebar />
          </Suspense>
          <Suspense fallback={<div className="flex-1">Loading products...</div>}>
            <BrowseContent />
          </Suspense>
        </div>
      </main>
    </>
  );
}

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="px-4 py-12">Loading browse page...</div>}>
        <BrowsePageBody />
      </Suspense>
    </div>
  );
}
