import { Schema, model, models, Document, Types } from "mongoose";

export interface IProduct extends Document {
  seller: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  currency: string;
  minOrderQty: number;
  category?: string;
  images: string[];
  status: "active" | "draft" | "inactive";
}

const ProductSchema = new Schema<IProduct>(
  {
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    currency: { type: String, default: "AED" },
    minOrderQty: { type: Number, default: 1 },
    category: { type: String },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "draft", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const Product =
  models.Product || model<IProduct>("Product", ProductSchema);
