"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // placeholder: integration point for newsletter API
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setEmail("");
  };

  return (
    <footer className="bg-white border-t mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">MaheDeluxe</h3>
            <p className="mt-3 text-sm text-slate-600">Connect with verified suppliers and scale your business globally. Trusted B2B marketplace for bulk sourcing, RFQs and custom orders.</p>
            <div className="mt-4 flex items-center gap-3">
              <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">About</Link>
              <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">Careers</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">For Buyers</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/browse" className="hover:text-slate-900">Browse Products</Link></li>
              <li><Link href="/rfq" className="hover:text-slate-900">Request for Quote</Link></li>
              <li><Link href="/checkout" className="hover:text-slate-900">Checkout</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">For Sellers</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/seller/register" className="hover:text-slate-900">Sell on MaheDeluxe</Link></li>
              <li><Link href="/seller/dashboard" className="hover:text-slate-900">Seller Dashboard</Link></li>
              <li><Link href="/seller/dashboard/documents" className="hover:text-slate-900">Documents</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Newsletter</h4>
            <p className="mt-3 text-sm text-slate-600">Get updates on new suppliers, products and promotions.</p>

            <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue/30"
              />
              <button type="submit" className="px-3 py-2 bg-blue text-white rounded-md text-sm">{sent ? "Subscribed" : "Subscribe"}</button>
            </form>

            <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
              <span>Follow us:</span>
              <Link href="#" className="hover:text-slate-900">Twitter</Link>
              <Link href="#" className="hover:text-slate-900">LinkedIn</Link>
              <Link href="#" className="hover:text-slate-900">Facebook</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-sm text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} MaheDeluxe. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-slate-900">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-900">Terms</Link>
            <Link href="#" className="hover:text-slate-900">Help</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
