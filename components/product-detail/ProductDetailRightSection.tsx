"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Star, Shield, Truck, CreditCard, FileText, Share2 } from "lucide-react";
import PurchaseTabs from "./PurchaseTabs";
import WholesalePanel from "./WholesalePanel";
import CustomizationPanel from "./CustomizationPanel";
import CustomizationInquiryModal from "./CustomizationInquiryModal";

type TabType = "wholesale" | "customization";

export default function ProductDetailRightSection() {
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState(1);
  const [activeTab, setActiveTab] = useState<TabType>("wholesale");
  const [isDesktop, setIsDesktop] = useState(false);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const customizationEnabled = true;
  const productName =
    "Refurbished Apple Watch Series 9 GPS, 41mm Midnight Aluminum Case with S/M Midnight Sport Band";

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const colorOptions = [
    { id: 1, name: "Pink/Starlight", image: "/dummy-product.png" },
    { id: 2, name: "Midnight", image: "/detail-product.jpg" },
    { id: 3, name: "Grey/Blue", image: "/dummy-product.png" },
  ];

  const selectedVariantName = colorOptions.find(
    (c) => c.id === selectedColor
  )?.name;

  const handleStartOrder = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/auth/signin");
      return;
    }
    router.push("/checkout");
  };

  const handleAddToCart = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/auth/signin");
      return;
    }

    // TODO: wire actual add-to-cart API call using selected variant
    console.log("Add to cart clicked", {
      selectedColor,
      variant: selectedVariantName,
    });
  };

  const handleChatNow = () => {
    console.log("Chat now clicked", {
      selectedColor,
      variant: selectedVariantName,
    });
  };

  const handleSendInquiry = () => {
    setInquiryModalOpen(true);
  };

  const handleInquirySubmit = (data: {
    productName: string;
    variant?: string;
    quantity: number;
    message: string;
  }) => {
    console.log("Inquiry submitted:", data);
  };

  const handleCopyLink = async () => {
    if (typeof window === "undefined") return;

    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1800);
    } catch (error) {
      console.error("Failed to copy product link", error);
    }
  };

  return (
    <>
      <div className="w-full bg-white lg:p-6 lg:rounded-2xl shadow-xl border border-purple-100/50">
        {/* Pricing Badge */}
        <div className="hidden lg:inline-flex items-center gap-2 w-fit rounded-xl px-4 py-2  mb-6 bg-gradient-to-r from-orange to-orange-300 shadow-lg">
          <Star className="w-4 h-4 text-white fill-white" />
          <p className="text-white text-sm font-semibold">
            Lower priced than similar products
          </p>
        </div>

        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={handleCopyLink}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
              shareCopied
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-700 hover:border-orange hover:text-orange"
            }`}
          >
            <Share2 className="h-4 w-4" />
            {shareCopied ? "Link copied" : "Copy link"}
          </button>
        </div>

        {/* Tab Switcher */}
        <PurchaseTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          customizationEnabled={customizationEnabled}
        />

        {/* Tab Panels */}
        {activeTab === "wholesale" ? (
          <WholesalePanel
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
            colorOptions={colorOptions}
            onStartOrder={handleStartOrder}
            onAddToCart={handleAddToCart}
            onChatNow={handleChatNow}
          />
        ) : (
          <CustomizationPanel
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
            colorOptions={colorOptions}
            onSendInquiry={handleSendInquiry}
            onChatNow={handleChatNow}
          />
        )}

        {/* Border before Protections */}
        <div className="w-full h-px bg-gray-200 my-6"></div>

        {/* Protections for this product */}
        <div className="hidden lg:block">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Protections for this product
            </h3>
            <button className="p-2 rounded-lg hover:bg-purple-50 transition-colors">
              <ChevronRight className="w-5 h-5 text-orange" />
            </button>
          </div>

          {/* Protection Cards */}
          <div className="space-y-4">
            {/* Delivery */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50/50 to-transparent border border-orange-100/50 hover:border-orange-200 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange to-orange-300 flex items-center justify-center shrink-0">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    Delivery via <span className="text-orange">MaheDeluxe</span> logistics
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Expect your order to be delivered before scheduled dates or
                    receive a 10% delay compensation.
                  </p>
                </div>
              </div>
            </div>

            {/* Secure Payments */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50/50 to-transparent border border-orange-100/50 hover:border-orange-200 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange to-orange-300 flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    Secure payments
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Every payment you make on MaheDeluxe is secured with strict
                    SSL encryption and PCI DSS data protection protocols.
                  </p>
                </div>
              </div>
            </div>

            {/* Standard Refund Policy */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50/50 to-transparent border border-orange-100/50 hover:border-orange-200 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange to-orange-300 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    Standard refund policy
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Claim a refund if your order doesn&apos;t ship, is missing, or
                    arrives with product issues.
                  </p>
                </div>
              </div>
            </div>

            {/* Trade Assurance */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50/50 to-transparent border border-orange  -100/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange to-orange-300 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-900">
                  Trade Assurance
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed ml-13">
                MaheDeluxe protects all your orders placed and paid on the platform
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <CustomizationInquiryModal
        open={inquiryModalOpen}
        onOpenChange={setInquiryModalOpen}
        productName={productName}
        selectedVariant={selectedVariantName}
        onSubmit={handleInquirySubmit}
      />
    </>
  );
}
