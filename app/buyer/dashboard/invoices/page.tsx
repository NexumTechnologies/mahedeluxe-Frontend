"use client";

import React from "react";
import Link from "next/link";
import { formatAED } from "@/lib/utils";

export default function BuyerInvoicesPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
        <Link href="/buyer/dashboard/invoices" className="px-4 py-2 border rounded-md">Refresh</Link>
      </header>

      <section className="mt-6 bg-white border rounded-lg p-4">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2">Invoice</th>
              <th className="py-2">Order</th>
              <th className="py-2">Date</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="py-2">INV-2026-101</td>
              <td className="py-2">#2001</td>
              <td className="py-2">2026-01-22</td>
              <td className="py-2">{formatAED(50)}</td>
              <td className="py-2"><span className="text-green-600">Paid</span></td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
