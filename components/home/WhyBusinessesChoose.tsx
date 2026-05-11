import Link from "next/link";
import { MessageSquareQuote, ShieldCheck, Handshake, Boxes, Mail, Phone } from "lucide-react";

export default function WhyBusinessesChoose() {
  return (
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
            </a>
            <a
              href="tel:+971503298799"
              className="flex items-center justify-between rounded-2xl border border-orange-200 bg-white px-5 py-4 text-sm font-semibold text-slate-900 transition hover:border-orange-300"
            >
              <span className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-slate-500" />
                +971 50 329 8799
              </span>
            </a>
          </div>

          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Open Contact Page
          </Link>
        </div>
      </div>
    </section>
  );
}
