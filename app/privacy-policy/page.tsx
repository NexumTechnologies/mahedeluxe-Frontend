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
  title: "Privacy Policy | MaheDeluxe",
  description:
    "Learn how MaheDeluxe collects, uses, shares, and protects your personal information across our B2B marketplace.",
};

const LAST_UPDATED = "April 9, 2026";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-sm text-slate-500">Legal</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            Privacy Policy
          </h1>
          <p className="mt-4 text-slate-600 max-w-3xl">
            This Privacy Policy explains how MaheDeluxe (the “Platform”) collects,
            uses, shares, and protects information when you browse, register, buy,
            sell, request quotes (RFQs), place orders, or otherwise interact with
            our B2B marketplace.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-orange/10 text-orange px-3 py-1 text-xs font-medium">
              Last updated: {LAST_UPDATED}
            </span>
            <span className="inline-flex items-center rounded-full bg-blue/10 text-blue px-3 py-1 text-xs font-medium">
              Applies to buyers and sellers
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-900/5 text-slate-700 px-3 py-1 text-xs font-medium">
              Covers web & app experiences
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
          <Card id="policy">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Policy details</CardTitle>
              <CardDescription>
                Please read this page carefully. If you do not agree with this
                policy, do not use the Platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-10">
              <section id="who-we-are" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  1) Who we are
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  MaheDeluxe operates a multi-vendor B2B marketplace that connects
                  buyers with suppliers for bulk sourcing, custom orders, and RFQ
                  workflows. Depending on your activity, MaheDeluxe may act as a
                  “controller” (deciding how and why information is processed)
                  and/or a “processor” (processing information on behalf of
                  business users).
                </p>
              </section>

              <section id="information-we-collect" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  2) Information we collect
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  We collect information you provide directly, information
                  collected automatically when you use the Platform, and
                  information from third parties (where permitted).
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border bg-white p-4">
                    <h3 className="font-semibold text-slate-900 text-sm">
                      Account & profile
                    </h3>
                    <ul className="mt-2 space-y-1 text-sm text-slate-600 list-disc pl-5">
                      <li>Name, email, phone number, password (hashed)</li>
                      <li>Company details and business profile (buyer/seller)</li>
                      <li>Addresses and contact preferences</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border bg-white p-4">
                    <h3 className="font-semibold text-slate-900 text-sm">
                      Orders, RFQs & messages
                    </h3>
                    <ul className="mt-2 space-y-1 text-sm text-slate-600 list-disc pl-5">
                      <li>RFQs, quotes, negotiations, and custom order details</li>
                      <li>Order history, invoices, and delivery information</li>
                      <li>Messages and files you share with other users</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border bg-white p-4">
                    <h3 className="font-semibold text-slate-900 text-sm">
                      Verification & documents
                    </h3>
                    <ul className="mt-2 space-y-1 text-sm text-slate-600 list-disc pl-5">
                      <li>Identity/business verification information (where required)</li>
                      <li>Buyer/seller compliance documents you upload</li>
                      <li>Fraud-prevention and platform integrity signals</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border bg-white p-4">
                    <h3 className="font-semibold text-slate-900 text-sm">
                      Device & usage
                    </h3>
                    <ul className="mt-2 space-y-1 text-sm text-slate-600 list-disc pl-5">
                      <li>IP address, device identifiers, browser type</li>
                      <li>Pages viewed, clicks, searches, and session data</li>
                      <li>Approximate location (derived from IP, where enabled)</li>
                    </ul>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-600">
                  If you choose not to provide certain information, some features
                  (such as account creation, RFQs, seller onboarding, or checkout)
                  may be unavailable.
                </p>
              </section>

              <section id="how-we-use" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  3) How we use your information
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-600 list-disc pl-5">
                  <li>
                    Provide and maintain the Platform (accounts, listings, RFQs,
                    orders, payments, and support)
                  </li>
                  <li>
                    Match buyers and sellers, facilitate communications, and
                    enable quotations and negotiations
                  </li>
                  <li>
                    Process transactions and improve trust & safety (fraud
                    detection, dispute handling, abuse prevention)
                  </li>
                  <li>
                    Personalize your experience (e.g., recommendations and
                    relevant content)
                  </li>
                  <li>
                    Analytics and product improvement (performance monitoring and
                    debugging)
                  </li>
                  <li>
                    Send service messages (security alerts, confirmations) and,
                    where allowed, marketing communications
                  </li>
                  <li>
                    Comply with legal obligations and enforce our terms and
                    policies
                  </li>
                </ul>
              </section>

              <section id="how-we-share" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  4) How we share your information
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  We may share information in the following circumstances:
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600 list-disc pl-5">
                  <li>
                    <span className="font-medium text-slate-800">With other users:</span>{" "}
                    when you create RFQs, request quotes, place orders, or message
                    sellers/buyers (for example, sharing business contact and
                    shipping details required to fulfill an order)
                  </li>
                  <li>
                    <span className="font-medium text-slate-800">With vendors and service providers:</span>{" "}
                    hosting, analytics, customer support tools, messaging,
                    verification providers, and other infrastructure providers
                  </li>
                  <li>
                    <span className="font-medium text-slate-800">With payment and logistics partners:</span>{" "}
                    to process payments and coordinate shipping/delivery (we
                    typically do not store full payment card details)
                  </li>
                  <li>
                    <span className="font-medium text-slate-800">For legal and safety reasons:</span>{" "}
                    to comply with law, respond to lawful requests, protect users,
                    and prevent fraud or security issues
                  </li>
                  <li>
                    <span className="font-medium text-slate-800">Business transfers:</span>{" "}
                    if we’re involved in a merger, acquisition, restructuring, or
                    sale of assets
                  </li>
                </ul>
              </section>

              <section id="cookies" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  5) Cookies and similar technologies
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  We use cookies and similar technologies (such as local storage)
                  to keep you signed in, remember preferences, secure sessions,
                  understand usage, and improve the Platform. You can control
                  cookies through your browser settings; disabling cookies may
                  affect certain features.
                </p>
              </section>

              <section id="retention" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  6) Data retention
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  We retain information for as long as needed to provide the
                  Platform and for legitimate business purposes such as auditing,
                  dispute resolution, fraud prevention, and compliance. Retention
                  periods can vary depending on the type of data and the purpose
                  for which it is processed.
                </p>
              </section>

              <section id="security" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  7) Security
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  We use administrative, technical, and organizational measures
                  designed to protect your information. However, no method of
                  transmission or storage is completely secure, so we cannot
                  guarantee absolute security.
                </p>
              </section>

              <section id="your-rights" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  8) Your rights and choices
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Depending on your location, you may have rights to access,
                  correct, delete, or receive a copy of your information, object
                  to certain processing, or withdraw consent (where applicable).
                  You can also update certain information in your account
                  settings.
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  To request help with privacy-related matters, use the Platform’s
                  support/help channel and include enough detail for us to verify
                  your request.
                </p>
              </section>

              <section id="international" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  9) International transfers
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Because we operate globally, your information may be processed
                  in countries other than where you live. When we transfer
                  information internationally, we take steps intended to ensure
                  an appropriate level of protection consistent with applicable
                  laws.
                </p>
              </section>

              <section id="children" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  10) Children’s privacy
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  The Platform is intended for business users and is not directed
                  to children. If you believe a child has provided personal
                  information, contact us through the Platform support channel.
                </p>
              </section>

              <section id="changes" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  11) Changes to this policy
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  We may update this Privacy Policy from time to time. The “Last
                  updated” date above indicates when changes were made. If
                  changes are material, we may provide additional notice within
                  the Platform.
                </p>
              </section>

              <section id="contact" className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-900">
                  12) Contact us
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  For questions about privacy, data access requests, or this
                  policy, contact us via the Platform’s Help/Support experience.
                </p>
              </section>

              <div className="rounded-xl border bg-slate-900/5 p-4">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Note:</span> This page is a
                  general policy template tailored for a B2B marketplace. You may
                  want to review it with legal counsel and adjust details (such
                  as your company name, address, contact email, and applicable
                  regional disclosures).
                </p>
              </div>
            </CardContent>
          </Card>

          <aside className="space-y-6 lg:sticky lg:top-24">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-base">On this page</CardTitle>
                <CardDescription>Quick links to key sections.</CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <nav className="text-sm">
                  <ul className="space-y-2 text-slate-600">
                    <li>
                      <Link className="hover:text-slate-900" href="#who-we-are">
                        Who we are
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="hover:text-slate-900"
                        href="#information-we-collect"
                      >
                        Information we collect
                      </Link>
                    </li>
                    <li>
                      <Link className="hover:text-slate-900" href="#how-we-use">
                        How we use information
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="hover:text-slate-900"
                        href="#how-we-share"
                      >
                        How we share information
                      </Link>
                    </li>
                    <li>
                      <Link className="hover:text-slate-900" href="#cookies">
                        Cookies
                      </Link>
                    </li>
                    <li>
                      <Link className="hover:text-slate-900" href="#your-rights">
                        Your rights
                      </Link>
                    </li>
                    <li>
                      <Link className="hover:text-slate-900" href="#contact">
                        Contact
                      </Link>
                    </li>
                  </ul>
                </nav>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-base">Summary</CardTitle>
                <CardDescription>At a glance.</CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <ul className="space-y-2 text-sm text-slate-600 list-disc pl-5">
                  <li>We collect account, business, and transaction details.</li>
                  <li>We use data to run the marketplace and prevent fraud.</li>
                  <li>We share needed details with counterparties and providers.</li>
                  <li>You can request access, correction, or deletion.</li>
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
