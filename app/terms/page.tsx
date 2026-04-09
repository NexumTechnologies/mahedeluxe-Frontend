import type { Metadata } from "next";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Terms & Conditions | MaheDeluxe",
  description:
    "Read the Terms & Conditions for using MaheDeluxe's B2B marketplace, including buyer and seller responsibilities.",
};

const LAST_UPDATED = "April 9, 2026";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-sm text-slate-500">Legal</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            Terms &amp; Conditions
          </h1>
          <p className="mt-4 text-slate-600 max-w-3xl">
            These Terms &amp; Conditions (&quot;Terms&quot;) govern your access to and use of
            the MaheDeluxe B2B marketplace (the “Platform”), including browsing,
            creating accounts, requesting quotes (RFQs), listing products, placing
            orders, and communicating with other users.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-orange/10 text-orange px-3 py-1 text-xs font-medium">
              Last updated: {LAST_UPDATED}
            </span>
            <span className="inline-flex items-center rounded-full bg-blue/10 text-blue px-3 py-1 text-xs font-medium">
              B2B buyers &amp; sellers
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-900/5 text-slate-700 px-3 py-1 text-xs font-medium">
              Marketplace rules
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Terms</CardTitle>
              <CardDescription>
                Using the Platform means you agree to these Terms.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-10">
              <section id="acceptance" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  1) Acceptance of the Terms
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  By accessing or using the Platform, you agree to be bound by
                  these Terms and our{" "}
                  <Link href="/privacy-policy" className="text-blue hover:underline">
                    Privacy Policy
                  </Link>
                  . If you do not agree, do not use the Platform.
                </p>
              </section>

              <section id="eligibility" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  2) Eligibility and accounts
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-600 list-disc pl-5">
                  <li>
                    You must provide accurate and complete information when
                    creating an account.
                  </li>
                  <li>
                    You are responsible for safeguarding your login credentials
                    and for activity under your account.
                  </li>
                  <li>
                    Buyers and sellers may be required to provide additional
                    business information or documents.
                  </li>
                </ul>
              </section>

              <section id="marketplace" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  3) Marketplace role
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  The Platform facilitates connections between buyers and sellers.
                  Unless explicitly stated, MaheDeluxe is not the direct seller of
                  third-party products. Sellers are responsible for listings,
                  product quality, compliance, and fulfillment. Buyers are
                  responsible for purchase decisions and order requirements.
                </p>
              </section>

              <section id="rfqs" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  4) RFQs, quotes, and communications
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-600 list-disc pl-5">
                  <li>
                    RFQs and quotes may include pricing, lead times, minimum order
                    quantities, specs, and terms proposed by sellers.
                  </li>
                  <li>
                    You are responsible for the content you submit, including any
                    files, documents, and messages.
                  </li>
                  <li>
                    Do not share sensitive information beyond what is reasonably
                    needed to conduct business.
                  </li>
                </ul>
              </section>

              <section id="orders" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  5) Orders, payments, and fees
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  When you place an order through the Platform, you agree to pay
                  applicable prices, taxes, shipping, and fees shown at checkout
                  (if any). Sellers may set their own prices, minimum order
                  quantities, and fulfillment terms, subject to Platform rules.
                </p>
              </section>

              <section id="shipping" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  6) Shipping, delivery, and logistics
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Delivery estimates are not guarantees. Logistics, customs, and
                  import/export requirements may vary by destination. Buyers and
                  sellers are responsible for complying with applicable trade and
                  customs laws and providing accurate shipment information.
                </p>
              </section>

              <section id="returns" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  7) Returns, refunds, and disputes
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Return/refund eligibility may depend on the product category,
                  seller policy, and the reason for the request (for example,
                  defective, damaged in transit, or not-as-described). Disputes
                  should be raised promptly through Platform support so we can
                  assist with resolution.
                </p>
              </section>

              <section id="prohibited" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  8) Prohibited activities
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-600 list-disc pl-5">
                  <li>Illegal, misleading, or fraudulent activity</li>
                  <li>Listing or sourcing prohibited/restricted items</li>
                  <li>Harassment, spam, or abusive behavior</li>
                  <li>Attempting to bypass Platform safeguards or security</li>
                  <li>Infringing intellectual property rights</li>
                </ul>
              </section>

              <section id="ip" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  9) Intellectual property
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  The Platform, including its branding, design, and software, is
                  owned by MaheDeluxe or its licensors and is protected by
                  applicable laws. You may not copy, modify, distribute, or
                  reverse engineer the Platform except as permitted by law.
                </p>
              </section>

              <section id="termination" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  10) Suspension and termination
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  We may suspend or terminate access to the Platform if we believe
                  you violated these Terms, posed a risk to other users, or for
                  legal/compliance reasons. You may stop using the Platform at any
                  time.
                </p>
              </section>

              <section id="disclaimers" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  11) Disclaimers and limitation of liability
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  The Platform is provided on an “as is” and “as available” basis.
                  To the extent permitted by law, MaheDeluxe disclaims warranties
                  and will not be liable for indirect, incidental, special,
                  consequential, or punitive damages.
                </p>
              </section>

              <section id="changes" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  12) Changes to the Terms
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  We may update these Terms from time to time. The “Last updated”
                  date above indicates when changes were made. Continued use of
                  the Platform after changes means you accept the updated Terms.
                </p>
              </section>

              <section id="contact" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  13) Contact
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  For questions about these Terms, contact us through the
                  Platform’s Help/Support experience.
                </p>
              </section>

              <div className="rounded-xl border bg-slate-900/5 p-4">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Note:</span> These Terms are a
                  general marketplace template. You may want legal review to
                  tailor governing law, dispute process, fees, prohibited items,
                  and any region-specific disclosures.
                </p>
              </div>
            </CardContent>
          </Card>

          <aside className="space-y-6 lg:sticky lg:top-24">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-base">Quick links</CardTitle>
                <CardDescription>Jump to key sections.</CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <nav className="text-sm">
                  <ul className="space-y-2 text-slate-600">
                    <li>
                      <Link className="hover:text-slate-900" href="#eligibility">
                        Accounts
                      </Link>
                    </li>
                    <li>
                      <Link className="hover:text-slate-900" href="#marketplace">
                        Marketplace role
                      </Link>
                    </li>
                    <li>
                      <Link className="hover:text-slate-900" href="#orders">
                        Orders &amp; payments
                      </Link>
                    </li>
                    <li>
                      <Link className="hover:text-slate-900" href="#returns">
                        Returns &amp; disputes
                      </Link>
                    </li>
                    <li>
                      <Link className="hover:text-slate-900" href="#prohibited">
                        Prohibited activity
                      </Link>
                    </li>
                    <li>
                      <Link className="hover:text-slate-900" href="#disclaimers">
                        Liability
                      </Link>
                    </li>
                  </ul>
                </nav>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-base">Related</CardTitle>
                <CardDescription>Other legal documents.</CardDescription>
              </CardHeader>
              <CardContent className="py-4 text-sm">
                <Link href="/privacy-policy" className="text-blue hover:underline">
                  Privacy Policy
                </Link>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
