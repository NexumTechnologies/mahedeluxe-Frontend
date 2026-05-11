"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import { useI18n } from "@/components/LanguageProvider";

export default function Footer() {
  const { dir, t } = useI18n();

  return (
    <footer className="bg-white border-t mt-12" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="max-w-sm">
            <Link href="/" className="inline-block">
              <Image src="/logo.png" alt="MaheDeluxe" width={140} height={40} className="object-contain" />
            </Link>
            <p className="mt-3 text-sm text-slate-600">{t("footer.description")}</p>
            <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
              <span className="sr-only">{t("footer.followUs")}</span>
              <a href="https://www.instagram.com/mahedeluxe" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 rounded-md flex items-center justify-center bg-gradient-to-br from-pink-500 to-pink-400 text-white shadow-sm hover:opacity-90 transition">
                <Image src="/insta.png" alt="Instagram" width={38} height={16} />
              </a>

              <a href="https://www.tiktok.com/@mahedeluxe" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="w-8 h-8 rounded-md flex items-center justify-center bg-black text-white shadow-sm hover:opacity-90 transition">
                <Image src="/tiktok.png" alt="TikTok" width={34} height={24} />
              </a>

              <a href="https://www.facebook.com/mahedeluxe" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-md flex items-center justify-center bg-blue-600 text-white shadow-sm hover:opacity-90 transition">
                <Image src="/facebook.png" alt="Facebook" width={38} height={24} />
              </a>
            </div>
          </div>

          <div className="flex flex-col items-start justify-center">
            <h4 className="text-lg font-semibold text-slate-900">Quick Links</h4>
            <div className="mt-4 flex flex-col gap-2 text-sm">
              <Link href="/" className="hover:text-slate-900">Home</Link>
              <Link href="/browse" className="hover:text-slate-900">Shop</Link>
              <Link href="/auth/seller/register" className="hover:text-slate-900">Become a seller</Link>
              <Link href="/auth/buyer/register" className="hover:text-slate-900">Become a buyer</Link>
              <Link href="/about" className="hover:text-slate-900">About us</Link>
              <Link href="/contact" className="hover:text-slate-900">Contact us</Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <h4 className="text-lg font-semibold text-slate-900">Contact Information</h4>
            <div className="mt-6 space-y-5 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-slate-900" />
                <div>
                  <p>Gulf Tower B-10-902, B1 BLOCK</p>
                  <p className="mt-1">Umm Hurrair Second, Oud Metha - Dubai</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-slate-900" />
                <a href="tel:+971503298799" className="hover:text-slate-900">
                  +971 50 329 8799
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-slate-900" />
                <a href="mailto:info@mahedeluxe.ae" className="hover:text-slate-900">
                  info@mahedeluxe.ae
                </a>
              </div>

              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-slate-900" />
                <p>Our office timing : Monday to Saturday 9.00 AM to 5.30 PM</p>
              </div>
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
