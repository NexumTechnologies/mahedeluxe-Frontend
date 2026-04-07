import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalHeader from "@/components/ConditionalHeader";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import ConditionalFooter from "@/components/ConditionalFooter";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
      <body className={`${inter.className} antialiased`}>
        <ReactQueryProvider>
          <ConditionalHeader />
          {children}
          <ConditionalFooter />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
