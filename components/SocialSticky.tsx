"use client";

import React from "react";
import Image from "next/image";

export default function SocialSticky() {
  return (
    <div className="fixed right-0 top-1/3 z-50 hidden flex-col overflow-hidden rounded-l-md shadow-[0_18px_40px_rgba(15,23,42,0.24)] md:flex">
      <a
        href="https://www.instagram.com/mahedeluxe"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="flex h-14 w-14 items-center justify-center bg-[#e64379] text-white transition hover:brightness-95"
      >
        <Image src="/insta.png" alt="Instagram" width={44} height={24} />
      </a>

      <a
        href="https://www.tiktok.com/@mahedeluxe"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="TikTok"
        className="flex h-14 w-14 items-center justify-center bg-[#111111] text-white transition hover:brightness-95"
      >
        <Image src="/tiktok.png" alt="TikTok" width={34} height={24} />
      </a>

      <a
        href="https://www.facebook.com/mahedeluxe"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="flex h-14 w-14 items-center justify-center bg-[#1c417c] text-white transition hover:brightness-95"
      >
        <Image src="/facebook.png" alt="Facebook" width={38} height={24} />
      </a>
    </div>
  );
}
