"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminOrderPercentagePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Product Commission Policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Commission is now configured per product and applied item-by-item
          during order creation.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Per-Product Commission</CardTitle>
          <CardDescription>
            Set commission from the admin product list for each item separately.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border bg-slate-50 p-4 text-sm text-slate-700">
            Open the Product Management page and use the Commission (%) column to
            apply or edit commission for each product.
          </div>
          <div>
            <Link
              href="/admin/products"
              className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Go to Product Management
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
