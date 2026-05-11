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
        className="flex h-16 w-16 items-center justify-center transition hover:opacity-90"
      >
        <Image src="/insta.png" alt="Instagram" width={44} height={32} />
      </a>

      <a
        href="https://www.tiktok.com/@mahedeluxe"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="TikTok"
        className="flex h-16 w-16 items-center justify-center transition hover:opacity-90"
      >
        <Image src="/tiktok.png" alt="TikTok" width={32} height={32} />
      </a>

      <a
        href="https://www.facebook.com/mahedeluxe"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="flex h-16 w-16 items-center justify-center transition hover:opacity-90"
      >
        <Image src="/facebook.png" alt="Facebook" width={44} height={32} />
      </a>
    </div>
  );
}
