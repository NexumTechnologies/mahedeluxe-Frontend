"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/components/LanguageProvider";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { dir, t } = useI18n();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // placeholder: integration point for newsletter API
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setEmail("");
  };

  return (
    <footer className="bg-white border-t mt-12" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="inline-block">
              <Image src="/logo.png" alt="MaheDeluxe" width={140} height={40} className="object-contain" />
            </Link>
            <p className="mt-3 text-sm text-slate-600">{t("footer.description")}</p>
            <div className="mt-4 flex items-center gap-3">
              <Link href="/about" className="text-sm text-gray-500 hover:text-gray-900">{t("footer.about us")}</Link>
              <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-900">{t("footer.contact")}</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">{t("footer.forBuyers")}</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/browse" className="hover:text-slate-900">{t("footer.browseProducts")}</Link></li>
              <li><Link href="/rfq" className="hover:text-slate-900">{t("footer.requestQuote")}</Link></li>
              <li><Link href="/checkout" className="hover:text-slate-900">{t("footer.checkout")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">{t("footer.forSellers")}</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/seller/register" className="hover:text-slate-900">{t("footer.sellOnMaheDeluxe")}</Link></li>
              <li><Link href="/seller/dashboard" className="hover:text-slate-900">{t("footer.sellerDashboard")}</Link></li>
              <li><Link href="/seller/dashboard/documents" className="hover:text-slate-900">{t("footer.documents")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">{t("footer.newsletter")}</h4>
            <p className="mt-3 text-sm text-slate-600">{t("footer.newsletterDescription")}</p>

            <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
              <input
                type="email"
                placeholder={t("footer.emailAddress")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue/30"
              />
              <button type="submit" className="px-3 py-2 bg-blue text-white rounded-md text-sm">{sent ? t("footer.subscribed") : t("footer.subscribe")}</button>
            </form>

            <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
              <span>{t("footer.followUs")}</span>
              <a href="https://www.tiktok.com/@mahedeluxe.b2b.ma?_r=1&_t=ZS-95lDApOOjb6" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">TikTok</a>
              <a href="https://www.instagram.com/mahedeluxe?igsh=MWVtdDZjbzM2OXNuOQ==" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">Instagram</a>
              <a href="https://www.facebook.com/share/18QbuvMfRY/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">Facebook</a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-sm text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} MaheDeluxe. {t("footer.rightsReserved")}</div>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-slate-900">{t("footer.privacy")}</Link>
            <Link href="/terms" className="hover:text-slate-900">{t("footer.terms")}</Link>
            <Link href="/contact" className="hover:text-slate-900">{t("footer.help")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
