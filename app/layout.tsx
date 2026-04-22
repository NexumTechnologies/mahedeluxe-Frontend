import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import ConditionalHeader from "@/components/ConditionalHeader";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import ConditionalFooter from "@/components/ConditionalFooter";
import DeploymentVersionWatcher from "@/components/DeploymentVersionWatcher";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans-primary",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "MaheDeluxe - Multi-Vendor B2B Marketplace | Connect with Global Suppliers",
  description:
    "Source products from verified vendors worldwide. Build your business with our trusted multi-vendor B2B marketplace platform connecting buyers and sellers globally.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${cormorant.variable} ${manrope.className} antialiased`}>
        <ReactQueryProvider>
          <DeploymentVersionWatcher />
          <ConditionalHeader />
          {children}
          <ConditionalFooter />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
