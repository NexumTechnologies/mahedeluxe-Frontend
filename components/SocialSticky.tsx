"use client";

import React from "react";
import Image from "next/image";
import { PhoneCall } from "lucide-react";

export default function SocialSticky() {
  return (
    <>
      <div className="fixed bottom-5 left-4 z-50 flex flex-col gap-3 sm:left-6">
        <a
          href="https://wa.me/971503298799"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="flex items-center gap-3 rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(16,185,129,0.34)] transition hover:scale-[1.02] hover:bg-emerald-600"
        >
          <Image src="/whatsapp.svg" alt="WhatsApp" width={22} height={22} className="h-5 w-5" />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>

        <a
          href="tel:+97145778665"
          aria-label="Call"
          className="flex items-center gap-3 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.32)] transition hover:scale-[1.02] hover:bg-slate-800"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
            <PhoneCall className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline">Call</span>
        </a>
      </div>

      <div className="fixed gap-y-2 right-0 top-1/3 z-50 hidden flex-col overflow-hidden rounded-l-md shadow-[0_18px_40px_rgba(15,23,42,0.24)] md:flex">
      <a
        href="https://www.instagram.com/mahedeluxe"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="flex h-10 w-10 py-2 items-center justify-center transition hover:opacity-90"
      >
        <Image src="/insta.png" alt="Instagram" width={44} height={32} />
      </a>

      <a
        href="https://www.tiktok.com/@mahedeluxe.b2b.ma?_r=1&_t=ZS-95lDApOOjb6"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="TikTok"
        className="flex h-10 w-10 py-4 items-center justify-center transition hover:opacity-90"
      >
        <Image src="/tiktok.png" alt="TikTok" width={34} height={24} />
      </a>

      <a
        href="https://www.facebook.com/profile.php?id=61587335373214"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="flex h-10 w-10 py-2 items-center justify-center transition hover:opacity-90"
      >
        <Image src="/facebook.png" alt="Facebook" width={44} height={32} />
      </a>
      </div>
    </>
  );
}
