"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";

import { submitContactMessage } from "@/lib/api";

type FormState = {
  name: string;
  email: string;
  message: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  message: "",
};

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = (await submitContactMessage(form)) as { message?: string };
      setStatus({
        type: "success",
        message: response?.message ?? "Your message has been sent. Please check your inbox for confirmation.",
      });
      setForm(initialState);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send your message right now. Please try again.";
      setStatus({ type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Contact Us</h2>
        <p className="mt-2 text-sm text-slate-600">Send us a message and we&apos;ll get back to you shortly.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
              className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
              placeholder="Your name"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
              className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
              placeholder="you@company.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Message</span>
            <textarea
              required
              rows={6}
              value={form.message}
              onChange={(e) => setForm((c) => ({ ...c, message: e.target.value }))}
              className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
              placeholder="How can we help? Please include quantities, timelines, or any other detail."
            />
          </label>

          {status && (
            <div className={`rounded-md px-4 py-3 text-sm font-medium ${status.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
              {status.message}
            </div>
          )}

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 px-5 py-2 text-sm font-semibold text-white shadow transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
