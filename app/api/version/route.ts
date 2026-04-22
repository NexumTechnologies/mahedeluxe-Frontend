import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "Surrogate-Control": "no-store",
};

export async function GET() {
  return NextResponse.json(
    {
      buildId: process.env.NEXT_PUBLIC_APP_BUILD_ID || "dev",
      timestamp: new Date().toISOString(),
    },
    {
      headers: noStoreHeaders,
    },
  );
}