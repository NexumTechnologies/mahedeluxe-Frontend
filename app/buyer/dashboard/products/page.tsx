"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import ScreenModal from "@/components/ui/ScreenModal";
import SizeVariantsEditor from "@/components/product-forms/SizeVariantsEditor";
import { getVariantTypeMeta } from "@/lib/productVariantType";

type CategoryOption = {
  id: number;
  name: string;
};

type ProductCategory = {
  name?: string;
};

type ProductSubCategory = {
  id?: number;
  name?: string;
};

type ProductSubSubCategory = {
  id?: number;
  name?: string;
};

type Product = {
  id: number;
  name: string;
  description?: string | null;
  price?: number | string;
  quantity?: number | string;
  category_id?: number;
  sub_category_id?: number | null;
  sub_sub_category_id?: number | null;
  is_active?: boolean;
  image_url?: string | string[] | null;
  Category?: ProductCategory;
  SubCategory?: ProductSubCategory;
  SubSubCategory?: ProductSubSubCategory;
  min_order_quantity?: number | string;
  sizes?: string[] | string | null;
  colors?: string[] | string | null;
  size_variants?: Array<{
    size?: string;
    price?: number | string;
    image_url?: string[] | string | null;
  }> | null;
};

type SizeVariantForm = {
  size: string;
  price: string;
  image_url: string[];
};

const emptyVariant = (): SizeVariantForm => ({
  size: "",
  price: "",
  image_url: [],
});

function normalizeVariantsForForm(product: Product): SizeVariantForm[] {
  if (!Array.isArray(product?.size_variants) || product.size_variants.length === 0) {
    return [emptyVariant()];
  }

  return product.size_variants.map((variant) => ({
    size: String(variant?.size || ""),
    price: String(variant?.price ?? ""),
    image_url: Array.isArray(variant?.image_url)
      ? variant.image_url
      : variant?.image_url
        ? [String(variant.image_url)]
        : [],
  }));
}

function buildSizeVariantPayload(variants: SizeVariantForm[]) {
  return variants
    .map((variant) => ({
      size: variant.size.trim(),
      price: Number(variant.price),
      image_url: variant.image_url.filter(Boolean),
    }))
    .filter(
      (variant) =>
        variant.size &&
        Number.isFinite(variant.price) &&
        variant.price > 0 &&
        variant.image_url.length > 0,
    );
}

type ProductsResponse =
  | {
      data?: { items?: Product[] };
      products?: Product[];
    }
  | Product[];

type CategoriesResponse =
  | {
      data?: { items?: CategoryOption[] };
      categories?: CategoryOption[];
    }
  | CategoryOption[];

function getProducts(payload: unknown): Product[] {
  const data = payload as ProductsResponse;
  if (Array.isArray(data)) return data;
  return data?.data?.items ?? data?.products ?? [];
}

function getCategories(payload: unknown): CategoryOption[] {
  const data = payload as CategoriesResponse;
  if (Array.isArray(data)) return data;
  return data?.data?.items ?? data?.categories ?? [];
}

export default function BuyerProductsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    quantity: "",
    min_order_quantity: "1",
    colors: "",
    category_id: "",
    sub_category_id: "",
    sub_sub_category_id: "",
    image_urls: "",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [sizeVariants, setSizeVariants] = useState<SizeVariantForm[]>([emptyVariant()]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["buyer-products"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await api.get("/product/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });

  const products = getProducts(data);

  const { data: categoriesData } = useQuery({
    queryKey: ["buyer-categories-options"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await api.get("/category", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });

  const categories = getCategories(categoriesData);

  const selectedCategoryId = String(form.category_id || "").trim();
  const { data: subCategoriesData } = useQuery({
    queryKey: ["buyer-subcategories-options", selectedCategoryId],
    enabled: selectedCategoryId.length > 0,
    queryFn: async () => {
      const res = await api.get("/subcategory", {
        params: { category_id: selectedCategoryId, is_active: true },
      });
      return res.data;
    },
  });

  const subCategories =
    (Array.isArray(subCategoriesData?.data?.items) && subCategoriesData.data.items) ||
    (Array.isArray(subCategoriesData?.subcategories) && subCategoriesData.subcategories) ||
    (Array.isArray(subCategoriesData) ? subCategoriesData : []);

  const selectedSubCategoryId = String(form.sub_category_id || "").trim();
  const selectedSubCategory =
    subCategories.find((item: ProductSubCategory) => String(item?.id || "") === selectedSubCategoryId) || null;
  const { data: subSubCategoriesData } = useQuery({
    queryKey: ["buyer-subsubcategories-options", selectedSubCategoryId],
    enabled: selectedSubCategoryId.length > 0,
    queryFn: async () => {
      const res = await api.get("/sub-subcategory", {
        params: { sub_category_id: selectedSubCategoryId, is_active: true },
      });
      return res.data;
    },
  });

  const subSubCategories =
    (Array.isArray(subSubCategoriesData?.data?.items) && subSubCategoriesData.data.items) ||
    (Array.isArray(subSubCategoriesData?.subSubCategories) &&
      subSubCategoriesData.subSubCategories) ||
    (Array.isArray(subSubCategoriesData) ? subSubCategoriesData : []);
  const variantTypeMeta = getVariantTypeMeta(
    (
      selectedSubCategory as { variant_options?: string[]; variant_type?: string } | null
    )?.variant_options ||
      (selectedSubCategory as { variant_options?: string[]; variant_type?: string } | null)
        ?.variant_type,
  );

  const requiresSubCategory = selectedCategoryId.length > 0 && subCategories.length > 0;
  const requiresSubSubCategory =
    selectedSubCategoryId.length > 0 && subSubCategories.length > 0;
  const normalizedSizeVariants = buildSizeVariantPayload(sizeVariants);
  const fallbackVariantPrice = normalizedSizeVariants[0]?.price ?? 0;
  const isFormReady =
    form.name.trim().length > 0 &&
    form.description.trim().length > 0 &&
    String(form.quantity).trim().length > 0 &&
    Number(form.quantity) > 0 &&
    String(form.min_order_quantity).trim().length > 0 &&
    Number(form.min_order_quantity) >= 1 &&
    Number(form.quantity) >= Number(form.min_order_quantity) &&
    String(form.category_id).trim().length > 0 &&
    (!requiresSubCategory || String(form.sub_category_id).trim().length > 0) &&
    (!requiresSubSubCategory || String(form.sub_sub_category_id).trim().length > 0) &&
    normalizedSizeVariants.length > 0 &&
    uploadedUrls.length > 0;

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("token");
      const res = await api.delete(`/product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: () => {
      setSelectedProduct(null);
      setSelectedImageIndex(0);
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["buyer-products"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const payload = {
        name: form.name,
        description: form.description,
        price: fallbackVariantPrice,
        quantity: Number(form.quantity),
        min_order_quantity: Math.max(1, Number(form.min_order_quantity) || 1),
        sizes: normalizedSizeVariants.map((variant) => variant.size),
        colors: form.colors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        category_id: Number(form.category_id),
        sub_category_id: form.sub_category_id ? Number(form.sub_category_id) : null,
        sub_sub_category_id: form.sub_sub_category_id
          ? Number(form.sub_sub_category_id)
          : null,
        image_url:
          uploadedUrls.length > 0
            ? uploadedUrls
            : form.image_urls
                .split(",")
                .map((u) => u.trim())
                .filter(Boolean),
        size_variants: normalizedSizeVariants,
      };

      const res = await api.post("/product", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: () => {
      setIsModalOpen(false);
      setForm({
        name: "",
        description: "",
        quantity: "",
        min_order_quantity: "1",
        colors: "",
        category_id: "",
        sub_category_id: "",
        sub_sub_category_id: "",
        image_urls: "",
      });
      setUploadedUrls([]);
      setSizeVariants([emptyVariant()]);
      queryClient.invalidateQueries({ queryKey: ["buyer-products"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const basePayload = {
        name: form.name,
        description: form.description,
        price: fallbackVariantPrice,
        quantity: Number(form.quantity),
        min_order_quantity: Math.max(1, Number(form.min_order_quantity) || 1),
        sizes: normalizedSizeVariants.map((variant) => variant.size),
        colors: form.colors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        category_id: Number(form.category_id),
        sub_category_id: form.sub_category_id ? Number(form.sub_category_id) : null,
        sub_sub_category_id: form.sub_sub_category_id
          ? Number(form.sub_sub_category_id)
          : null,
        size_variants: normalizedSizeVariants,
      };

      const urls =
        uploadedUrls.length > 0
          ? uploadedUrls
          : form.image_urls
              .split(",")
              .map((u) => u.trim())
              .filter(Boolean);

      const payload =
        urls.length > 0 ? { ...basePayload, image_url: urls } : basePayload;

      const res = await api.put(`/product/${editingProductId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: () => {
      setIsModalOpen(false);
      setEditingProductId(null);
      setFormMode("create");
      setForm({
        name: "",
        description: "",
        quantity: "",
        min_order_quantity: "1",
        colors: "",
        category_id: "",
        sub_category_id: "",
        sub_sub_category_id: "",
        image_urls: "",
      });
      setUploadedUrls([]);
      setSizeVariants([emptyVariant()]);
      queryClient.invalidateQueries({ queryKey: ["buyer-products"] });
    },
  });

  const openCreate = () => {
    setFormMode("create");
    setEditingProductId(null);
    setForm({
      name: "",
      description: "",
      quantity: "",
      min_order_quantity: "1",
      colors: "",
      category_id: "",
      sub_category_id: "",
      sub_sub_category_id: "",
      image_urls: "",
    });
    setUploadedUrls([]);
    setSizeVariants([emptyVariant()]);
    setIsModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setFormMode("edit");
    setEditingProductId(product.id);
    const existingImages: string[] = Array.isArray(product.image_url)
      ? product.image_url
      : product.image_url
        ? [String(product.image_url)]
        : [];
    setForm({
      name: product.name || "",
      description: product.description || "",
      quantity: String(product.quantity ?? ""),
      min_order_quantity: String(product.min_order_quantity ?? 1),
      colors: Array.isArray(product.colors)
        ? product.colors.join(", ")
        : String(product.colors ?? ""),
      category_id: String(product.category_id ?? ""),
      sub_category_id: String(product.sub_category_id ?? product.SubCategory?.id ?? ""),
      sub_sub_category_id: String(
        product.sub_sub_category_id ?? product.SubSubCategory?.id ?? "",
      ),
      image_urls: existingImages.join(", "),
    });
    setUploadedUrls(existingImages);
    setSizeVariants(normalizeVariantsForForm(product));
    setIsModalOpen(true);
  };

  const imagesForSelected = (() => {
    if (!selectedProduct) return [];
    const raw = selectedProduct.image_url;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string" && raw.trim()) return [raw];
    return [];
  })();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Products</h1>
          <p className="mt-1 text-sm text-slate-600">
            Upload products as a buyer. New products are pending until admin
            approval.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center rounded-md bg-blue px-4 py-2 text-white text-sm font-medium"
        >
          Add product
        </button>
      </header>

      <section className="bg-white border rounded-xl p-4 shadow-sm">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-slate-500">
            Loading products...
          </div>
        ) : error ? (
          <div className="py-8 text-center text-sm text-red-500">
            Failed to load products.
          </div>
        ) : !products.length ? (
          <div className="py-8 text-center text-sm text-slate-500">
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => {
              const isApproved = Boolean(product.is_active);
              const images: string[] = Array.isArray(product.image_url)
                ? product.image_url
                : product.image_url
                  ? [String(product.image_url)]
                  : [];
              const primaryImage = images[0] || "/dummy-product.png";

              return (
                <div
                  key={product.id}
                  className="group rounded-xl border bg-white overflow-hidden hover:shadow-sm transition-shadow"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(product);
                      setSelectedImageIndex(0);
                    }}
                    className="w-full text-left"
                  >
                    <div className="relative w-full aspect-4/3 bg-slate-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                      />
                      <div className="absolute left-3 top-3">
                        {isApproved ? (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700">
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">
                            {product.name}
                          </h3>
                          <p className="mt-0.5 text-[11px] text-slate-500 truncate">
                            {product.Category?.name || "Uncategorized"}
                            {product.SubCategory?.name ? ` / ${product.SubCategory.name}` : ""}
                            {product.SubSubCategory?.name
                              ? ` / ${product.SubSubCategory.name}`
                              : ""}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-xs text-slate-500">Price</div>
                          <div className="font-semibold text-slate-900">
                            {product.price} AED
                          </div>
                        </div>
                      </div>

                      {product.description ? (
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {product.description}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400">No description</p>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="rounded-lg border bg-slate-50 px-3 py-2">
                          <div className="text-[11px] text-slate-500">
                            Stock
                          </div>
                          <div className="text-sm font-semibold text-slate-900">
                            {product.quantity ?? "-"}
                          </div>
                        </div>
                        <div className="rounded-lg border bg-slate-50 px-3 py-2">
                          <div className="text-[11px] text-slate-500">
                            Images
                          </div>
                          <div className="text-sm font-semibold text-slate-900">
                            {images.length}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>

                  <div className="px-4 pb-4 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(product)}
                      className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(product)}
                      className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {deleteTarget && (
        <ScreenModal open={!!deleteTarget}>
          <div className="app-modal-overlay">
            <div className="app-modal-panel flex max-w-md flex-col">
              <div className="flex items-start justify-between gap-4 border-b px-6 py-4">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-slate-900">
                    Delete Product
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Are you sure to delete this product?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="px-6 py-4 text-sm text-slate-600">
                This action can’t be undone.
              </div>

              <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 border rounded-md text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(deleteTarget.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-60"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </ScreenModal>
      )}

      {selectedProduct && (
        <ScreenModal open={!!selectedProduct}>
        <div className="app-modal-overlay">
          <div className="app-modal-panel flex max-w-3xl flex-col">
            <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {selectedProduct.name}
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Product details
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="app-modal-scroll grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-3">
              <div className="md:col-span-1">
                {!imagesForSelected.length ? (
                  <div className="w-full aspect-square rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                    No image available
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-full aspect-square rounded-lg bg-slate-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagesForSelected[selectedImageIndex]}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {imagesForSelected.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {imagesForSelected.map((img: string, index: number) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedImageIndex(index)}
                            className={`w-full aspect-square rounded-md bg-slate-100 overflow-hidden border ${
                              index === selectedImageIndex
                                ? "border-blue"
                                : "border-transparent"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img}
                              alt={`${selectedProduct.name} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="md:col-span-2 space-y-3 text-sm">
                {selectedProduct.description && (
                  <div>
                    <div className="text-xs font-semibold text-slate-600">
                      Description
                    </div>
                    <div className="text-slate-900 mt-1">
                      {selectedProduct.description}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg">
                    <div className="text-xs text-slate-500">Price</div>
                    <div className="font-semibold text-slate-900">
                      {selectedProduct.price} AED
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-xs text-slate-500">Stock</div>
                    <div className="font-semibold text-slate-900">
                      {selectedProduct.quantity}
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-xs text-slate-500">Category</div>
                    <div className="font-semibold text-slate-900">
                      {selectedProduct.Category?.name || "-"}
                    </div>
                    {selectedProduct.SubCategory?.name && (
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        {selectedProduct.SubCategory.name}
                      </div>
                    )}
                    {selectedProduct.SubSubCategory?.name && (
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        {selectedProduct.SubSubCategory.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </ScreenModal>
      )}

      {isModalOpen && (
        <ScreenModal open={isModalOpen}>
        <div className="app-modal-overlay">
          <div className="app-modal-panel flex max-w-xl flex-col">
            <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {formMode === "create" ? "Add product" : "Edit product"}
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {formMode === "create"
                    ? "Fill in the details to create a product."
                    : "Update your product details."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="app-modal-scroll px-5 py-4">
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Category
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      category_id: e.target.value,
                      sub_category_id: "",
                      sub_sub_category_id: "",
                    }))
                  }
                  className="mt-1 w-full border rounded px-3 py-2"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="mt-1 w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Subcategory
                </label>
                <select
                  value={form.sub_category_id}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sub_category_id: e.target.value,
                      sub_sub_category_id: "",
                    }))
                  }
                  disabled={!selectedCategoryId || subCategories.length === 0}
                  className="mt-1 w-full border rounded px-3 py-2"
                >
                  <option value="">
                    {!selectedCategoryId
                      ? "Select category first"
                      : subCategories.length === 0
                        ? "No subcategories"
                        : "Select subcategory"}
                  </option>
                  {subCategories.map((sub: ProductSubCategory & { id: number }) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Sub-sub-category
                </label>
                <select
                  value={form.sub_sub_category_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sub_sub_category_id: e.target.value }))
                  }
                  disabled={!selectedSubCategoryId || subSubCategories.length === 0}
                  className="mt-1 w-full border rounded px-3 py-2"
                >
                  <option value="">
                    {!selectedSubCategoryId
                      ? "Select subcategory first"
                      : subSubCategories.length === 0
                        ? "No sub-sub-categories"
                        : "Select sub-sub-category"}
                  </option>
                  {subSubCategories.map((subSub: ProductSubSubCategory & { id: number }) => (
                    <option key={subSub.id} value={subSub.id}>
                      {subSub.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Quantity
                </label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, quantity: e.target.value }))
                  }
                  className="mt-1 w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Minimum order quantity
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.min_order_quantity}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      min_order_quantity: e.target.value,
                    }))
                  }
                  className="mt-1 w-full border rounded px-3 py-2"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Buyers can’t purchase below this quantity.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Colors
                </label>
                <input
                  type="text"
                  value={form.colors}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, colors: e.target.value }))
                  }
                  className="mt-1 w-full border rounded px-3 py-2"
                  placeholder="Red, Blue, Black"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Optional. Comma separated.
                </p>
              </div>
              <div className="md:col-span-2">
                <SizeVariantsEditor
                  variants={sizeVariants}
                  onChange={setSizeVariants}
                  uploadedUrls={uploadedUrls}
                  allowedOptions={variantTypeMeta.options}
                  title={variantTypeMeta.title}
                  optionLabel={variantTypeMeta.label}
                  helperText={variantTypeMeta.helperText}
                  addButtonText={variantTypeMeta.addButtonText}
                  placeholder={variantTypeMeta.placeholder}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-600">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="mt-1 w-full border rounded px-3 py-2 min-h-22.5"
                />
              </div>
              <div className="md:col-span-2">
                <div className="mt-2 border-t pt-4 space-y-3">
                  <p className="text-sm font-semibold text-slate-800">
                    Product Images
                  </p>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Choose image files
                    </label>
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="product-images"
                        aria-disabled={uploading}
                        className={`inline-flex items-center px-3 py-1.5 rounded-md border text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 cursor-pointer ${
                          uploading ? "pointer-events-none opacity-60" : ""
                        }`}
                      >
                        Choose images
                      </label>
                      <span className="text-[11px] text-slate-500">
                        JPG, PNG etc. You can select multiple files.
                      </span>
                    </div>
                    <input
                      id="product-images"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;

                        const formData = new FormData();
                        Array.from(files).forEach((file) =>
                          formData.append("images", file),
                        );

                        try {
                          setUploading(true);
                          const res = await api.post(
                            "/upload/multiple",
                            formData,
                            {
                              headers: {
                                "Content-Type": "multipart/form-data",
                              },
                            },
                          );
                          const urls =
                            res.data?.urls || res.data?.url || res.data || [];
                          const newUrls = Array.isArray(urls) ? urls : [urls];
                          setUploadedUrls((prev) => {
                            const next = [...prev, ...newUrls];
                            setForm((f) => ({
                              ...f,
                              image_urls: next.join(", "),
                            }));
                            return next;
                          });
                        } catch (err) {
                          console.error("Image upload failed", err);
                          setUploadedUrls([]);
                          setForm((f) => ({ ...f, image_urls: "" }));
                        } finally {
                          setUploading(false);
                        }
                      }}
                    />
                    {uploading && (
                      <div className="mt-2 inline-flex items-center gap-2 rounded-md border bg-slate-50 px-3 py-2">
                        <span
                          className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
                          aria-hidden="true"
                        />
                        <p className="text-xs text-slate-600">
                          Uploading images...
                        </p>
                      </div>
                    )}
                    {uploadedUrls.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-green-600">
                          {uploadedUrls.length} image(s) uploaded. Click × to
                          remove.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {uploadedUrls.map((url) => (
                            <div
                              key={url}
                              className="relative w-16 h-16 border rounded overflow-hidden bg-slate-50"
                            >
                              <button
                                type="button"
                                className="absolute -top-1 -right-1 bg-white text-xs rounded-full border px-1 leading-none shadow"
                                onClick={() =>
                                  setUploadedUrls((prev) => {
                                    const next = prev.filter((u) => u !== url);
                                    setForm((f) => ({
                                      ...f,
                                      image_urls: next.join(", "),
                                    }));
                                    return next;
                                  })
                                }
                              >
                                ×
                              </button>
                              <img
                                src={url}
                                alt="Product"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Or paste image URLs (comma separated)
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 text-sm"
                      placeholder="https://... , https://..."
                      value={form.image_urls}
                      onChange={(e) =>
                        setForm({ ...form, image_urls: e.target.value })
                      }
                    />
                    <p className="mt-1 text-[11px] text-slate-500">
                      If you upload files, those URLs will be used; otherwise,
                      we will use the URLs you paste here.
                    </p>
                  </div> */}
                </div>
              </div>
            </div>

            </div>

            <div className="mt-auto flex justify-end gap-2 border-t px-5 py-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="inline-flex items-center rounded-md border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  uploading ||
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  !isFormReady
                }
                onClick={() => {
                  if (formMode === "create") createMutation.mutate();
                  else updateMutation.mutate();
                }}
                className="inline-flex items-center rounded-md bg-blue px-4 py-2 text-white text-sm disabled:opacity-60"
              >
                {formMode === "create"
                  ? createMutation.isPending
                    ? "Posting..."
                    : "Post product"
                  : updateMutation.isPending
                    ? "Saving..."
                    : "Save"}
              </button>
            </div>
          </div>
        </div>
        </ScreenModal>
      )}
    </div>
  );
}
