import HeroSearchSection from "@/components/home/HeroSearchSection";
import WelcomeBanner from "@/components/home/WelcomeBanner";
import CategoriesSection from "@/components/home/CategoriesSection";
import ProductsGridSection from "@/components/home/ProductsGridSection";

export const metadata = {
  title:
    "MaheDeluxe - Multi-Vendor B2B Marketplace | Connect with Global Suppliers",
  description:
    "Source products from verified vendors worldwide. Build your business with our trusted multi-vendor B2B marketplace platform.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSearchSection />
      {/* <WelcomeBanner /> */}
      <CategoriesSection />
      <ProductsGridSection />
    </div>
  );
}
