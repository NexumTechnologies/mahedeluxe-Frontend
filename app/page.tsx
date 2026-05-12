import HeroSearchSection from "@/components/home/HeroSearchSection";
import ProductsGridSection from "@/components/home/ProductsGridSection";
import AppDownloadSection from "@/components/home/AppDownloadSection";
import WhyBusinessesChoose from "@/components/home/WhyBusinessesChoose";
import PaymentSuccessBanner from "@/components/home/PaymentSuccessBanner";
import { redirect } from "next/navigation";
import { getAuthUserFromRequest } from "@/lib/auth";

export const metadata = {
  title:
    "MaheDeluxe - Multi-Vendor B2B Marketplace | Connect with Global Suppliers",
  description:
    "Source products from verified vendors worldwide. Build your business with our trusted multi-vendor B2B marketplace platform.",
};

export default async function Home() {
  const user = await getAuthUserFromRequest();

  if (user?.role === "seller") {
    redirect("/seller/dashboard");
  }

  if (user?.role === "buyer") {
    redirect("/buyer/dashboard");
  }

  if (user?.role === "admin") {
    redirect("/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PaymentSuccessBanner />
      <HeroSearchSection />
      <ProductsGridSection />
      <AppDownloadSection />
      <WhyBusinessesChoose />
    </div>
  );
}
