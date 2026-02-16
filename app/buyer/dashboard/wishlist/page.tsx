"use client";

import React from "react";
import Link from "next/link";
import { formatAED } from "@/lib/utils";

export default function WishlistPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Wishlist</h1>
        <Link href="/buyer/dashboard/browse-products" className="px-4 py-2 border rounded-md">Browse</Link>
      </header>

      <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border rounded">
          <h3 className="font-semibold">Widget A</h3>
          <p className="text-sm text-slate-500 mt-1">Price: {formatAED(10)} • MOQ: 10</p>
        </div>
      </section>
    </div>
  );
}
