"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const hideFooter =
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/seller") ||
    pathname?.startsWith("/buyer") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/maintenance");

  if (hideFooter) {
    return null;
  }

  return <Footer />;
}
