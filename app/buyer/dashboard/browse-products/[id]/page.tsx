"use client";

import React from "react";
import Link from "next/link";
import { formatAED } from "@/lib/utils";

export default function ProductDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <div className="max-w-4xl mx-auto p-6">
      <header>
        <h1 className="text-2xl font-bold">Product #{id} — Widget Example</h1>
        <p className="mt-1 text-sm text-slate-600">Seller: Acme Widgets (limited info shown)</p>
      </header>

      <section className="mt-6 bg-white border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="h-48 bg-gray-100 rounded flex items-center justify-center">Image</div>
          </div>
          <div>
            <p className="text-lg font-semibold">Price: {formatAED(10)}</p>
            <p className="text-sm text-slate-500 mt-2">MOQ: 10</p>
            <p className="text-sm text-slate-500 mt-2">Lead time: 7 days</p>

            <div className="mt-4 flex gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded">Add to Cart</button>
              <Link href="/buyer/dashboard/orders" className="px-4 py-2 border rounded">Buy Now</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
