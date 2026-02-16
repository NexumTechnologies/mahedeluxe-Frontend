"use client";

import React from "react";
import Link from "next/link";
import { formatAED } from "@/lib/utils";

export default function InvoicesPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="mt-1 text-sm text-slate-600">Manage your invoices and payment history.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/seller/dashboard/invoices/new" className="px-4 py-2 bg-green-600 text-white rounded-md">New Invoice</Link>
          <Link href="/seller/dashboard/invoices" className="px-4 py-2 border rounded-md">Refresh</Link>
        </div>
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
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="py-2">INV-2026-001</td>
              <td className="py-2">#1007</td>
              <td className="py-2">2026-01-20</td>
              <td className="py-2">{formatAED(320)}</td>
              <td className="py-2"><span className="text-green-600">Paid</span></td>
              <td className="py-2"><Link href="#" className="text-blue-600 underline">Download</Link></td>
            </tr>
            <tr>
              <td className="py-2">INV-2026-002</td>
              <td className="py-2">#1006</td>
              <td className="py-2">2026-01-18</td>
              <td className="py-2">{formatAED(75)}</td>
              <td className="py-2"><span className="text-yellow-600">Pending</span></td>
              <td className="py-2"><Link href="#" className="text-blue-600 underline">Download</Link></td>
            </tr>
            <tr>
              <td className="py-2">INV-2025-099</td>
              <td className="py-2">#1005</td>
              <td className="py-2">2025-12-30</td>
              <td className="py-2">{formatAED(1120)}</td>
              <td className="py-2"><span className="text-red-600">Overdue</span></td>
              <td className="py-2"><Link href="#" className="text-blue-600 underline">Download</Link></td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
