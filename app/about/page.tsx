import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  ClipboardList,
  Handshake,
  MessageSquareQuote,
  ShieldCheck,
  Truck,
  Mail,
  Phone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | MaheDeluxe",
  description:
    "Learn how MaheDeluxe connects buyers and suppliers through a trusted B2B marketplace for sourcing, RFQs, and custom orders.",
};

const workflow = [
  {
    title: "Discover the right suppliers",
    description:
      "Browse wholesale-ready categories, compare offers, and shortlist products built for business buyers.",
    icon: Boxes,
  },
  {
    title: "Send RFQs and custom requirements",
    description:
      "Share quantities, branding needs, packaging preferences, and delivery expectations in one structured workflow.",
    icon: ClipboardList,
  },
  {
    title: "Negotiate and confirm with confidence",
    description:
      "Buyers and sellers align on pricing, minimum order quantities, timelines, and fulfillment details before checkout.",
    icon: Handshake,
  },
  {
    title: "Track fulfillment after the deal",
    description:
      "From approval to delivery, MaheDeluxe helps keep communication, documentation, and order follow-up in one place.",
    icon: Truck,
  },
];

const advantages = [
  "A focused B2B sourcing experience instead of a generic retail catalog",
  "Built for wholesale buyers, distributors, and custom-order conversations",
  "Trusted supplier relationships with room for negotiation and RFQ workflows",
  "Fast communication through direct inquiry, email, and WhatsApp touchpoints",
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_28%,#fff7ed_100%)]">
      <section className="relative overflow-hidden border-b border-slate-200/70 bg-white">
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_42%),radial-gradient(circle_at_top_right,_rgba(249,115,22,0.16),_transparent_34%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
          <div>
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
              About MaheDeluxe
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl">
              A wholesale marketplace designed for serious business buying.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              MaheDeluxe helps buyers discover suppliers, compare offers,
              request custom production, and move from first inquiry to final
              order with less friction. We combine catalog browsing, RFQs, and
              direct supplier communication in one B2B workflow.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Explore Marketplace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
              >
                Talk to Our Team
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                <div className="text-3xl font-semibold text-slate-950">B2B</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Built specifically for wholesale, sourcing, and repeat order relationships.
                </p>
              </div>
              <div className="rounded-3xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
                <div className="text-3xl font-semibold text-orange-600">RFQ</div>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Ideal for price requests, custom packaging, and quantity-based negotiations.
                </p>
              </div>
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                <div className="text-3xl font-semibold text-emerald-700">Direct</div>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Fast inquiry channels help buyers reach sellers without wasted time.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:grid-rows-[1.2fr_0.8fr]">
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-3 shadow-2xl shadow-slate-300/40 sm:col-span-2">
              <Image
                src="/detail-product.jpg"
                alt="MaheDeluxe wholesale marketplace product showcase"
                width={1200}
                height={720}
                className="h-full w-full rounded-[1.4rem] object-cover"
              />
              <div className="absolute inset-x-6 bottom-6 rounded-2xl border border-white/15 bg-slate-950/70 p-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
                  Marketplace idea
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-100">
                  Product discovery, supplier communication, and order intent all living in the same buying journey.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-3 shadow-lg">
              <Image
                src="/top-deals-1.png"
                alt="Wholesale offer tiles on MaheDeluxe"
                width={800}
                height={800}
                className="h-full w-full rounded-[1.4rem] object-cover"
              />
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-3 shadow-lg">
              <Image
                src="/fast-customization-1.png"
                alt="Customization and B2B sourcing"
                width={800}
                height={800}
                className="h-full w-full rounded-[1.4rem] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-300/35">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-300">
              How this works
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              The platform is built around practical B2B buying steps.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Instead of forcing buyers into a retail-style checkout too early,
              MaheDeluxe supports the real flow of B2B commerce: explore,
              inquire, compare, customize, negotiate, and then order.
            </p>

            <div className="mt-8 space-y-4">
              {advantages.map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                  <p className="text-sm leading-6 text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {workflow.map(({ title, description, icon: Icon }, index) => (
              <div
                key={title}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <MessageSquareQuote className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
              Why businesses choose MaheDeluxe
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              We focus on the gap between “I found a product” and “I trust this
              supplier enough to order.” That means better inquiry tools, more
              room for customization, and a stronger relationship-led sourcing
              experience.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-5">
                <ShieldCheck className="h-6 w-6 text-blue-700" />
                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  Trust-first setup
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Buyers can evaluate suppliers before moving into an order conversation.
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <Handshake className="h-6 w-6 text-orange-600" />
                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  Built for negotiation
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  MOQ, price, customization, and shipping details can be aligned clearly.
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <Boxes className="h-6 w-6 text-emerald-700" />
                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  Scalable catalog
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Buyers can browse categories, best deals, and supplier-led offers at speed.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-orange-200 bg-orange-50 p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
              Ready to start sourcing?
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Reach out for supplier guidance, bulk buying support, or custom order help.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-700">
              Whether you are looking for ready inventory or a made-to-order
              solution, our team can guide you to the right next step.
            </p>

            <div className="mt-8 space-y-3">
              <a
                href="mailto:info@mahedeluxe.ae"
                className="flex items-center justify-between rounded-2xl border border-orange-200 bg-white px-5 py-4 text-sm font-semibold text-slate-900 transition hover:border-orange-300"
              >
                <span className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-500" />
                  info@mahedeluxe.ae
                </span>
                <ArrowRight className="h-4 w-4 text-orange-600" />
              </a>
              <a
                href="tel:+971503298799"
                className="flex items-center justify-between rounded-2xl border border-orange-200 bg-white px-5 py-4 text-sm font-semibold text-slate-900 transition hover:border-orange-300"
              >
                <span className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-slate-500" />
                  +971 50 329 8799
                </span>
                <ArrowRight className="h-4 w-4 text-orange-600" />
              </a>
            </div>

            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Open Contact Page
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}