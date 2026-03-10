"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function ConditionalHeader() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");
  const isSellerArea = pathname?.startsWith("/seller");
  const isAdminArea = pathname?.startsWith("/admin");
  const isMaintenance = pathname?.startsWith("/maintenance");

  if (isAuthPage || isSellerArea || isAdminArea || isMaintenance) {
    return null;
  }

  return <Header />;
}
