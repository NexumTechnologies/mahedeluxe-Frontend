import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { getAuthUserFromRequest, requireSeller, AuthUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const authUser: AuthUser | null = await getAuthUserFromRequest();
    try {
      requireSeller(authUser);
    } catch {
      return NextResponse.json(
        { message: "Only sellers can create products" },
        { status: 403 }
      );
    }

    if (!authUser) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      name,
      description,
      price,
      currency,
      minOrderQty,
      category,
      images,
      status,
    } = body;

    if (!name || typeof price !== "number") {
      return NextResponse.json(
        { message: "Name and numeric price are required" },
        { status: 400 }
      );
    }

    const product = await Product.create({
      seller: authUser.id,
      name,
      description,
      price,
      currency: currency || "AED",
      minOrderQty: minOrderQty || 1,
      category,
      images: images || [],
      status: status || "active",
    });

    return NextResponse.json(
      { message: "Product created", product },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Create product error", err);
    return NextResponse.json(
      {
        message: "Server error",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get("sellerId");
    const category = searchParams.get("category");
    const status = searchParams.get("status") || "active";

    const query: Record<string, unknown> = {};
    if (sellerId) query.seller = sellerId;
    if (category) query.category = category;
    if (status) query.status = status;

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return NextResponse.json({ products });
  } catch (err: unknown) {
    console.error("List products error", err);
    return NextResponse.json(
      {
        message: "Server error",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
