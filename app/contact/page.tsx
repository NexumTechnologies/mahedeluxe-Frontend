import type { Metadata } from "next";

import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | MaheDeluxe",
  description:
    "Contact MaheDeluxe for sourcing support, supplier questions, bulk order help, and marketplace assistance.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf5_0%,#ffffff_42%,#f8fafc_100%)] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <ContactForm />
      </div>
    </main>
  );
}