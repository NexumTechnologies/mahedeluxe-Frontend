"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { formatAED } from "@/lib/utils";

export default function SellerProductsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    min_order_quantity: "1",
    category_id: "",
    image_urls: "",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["seller-products"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await api.get("/product/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });

  const products = data?.data?.items || data?.products || data || [];


  console.log("here", products);

  // Load categories for the select
  const { data: categoriesData } = useQuery({
    queryKey: ["seller-categories-options"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await api.get("/category", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });

  const categories =
    categoriesData?.data?.items || categoriesData?.categories || categoriesData || [];

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      const token = localStorage.getItem("token");
      const res = await api.put(
        `/product/${id}`,
        { is_active },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        quantity: Number(form.quantity),
        min_order_quantity: Math.max(1, Number(form.min_order_quantity) || 1),
        category_id: Number(form.category_id),
        // Prefer uploaded URLs; fall back to manual comma-separated input
        image_url:
          uploadedUrls.length > 0
            ? uploadedUrls
            : form.image_urls
                .split(",")
                .map((u) => u.trim())
                .filter(Boolean),
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
        price: "",
        quantity: "",
        min_order_quantity: "1",
        category_id: "",
        image_urls: "",
      });
      setUploadedUrls([]);
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingProductId) return;
      const token = localStorage.getItem("token");
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        quantity: Number(form.quantity),
        min_order_quantity: Math.max(1, Number(form.min_order_quantity) || 1),
        category_id: Number(form.category_id),
        image_url:
          uploadedUrls.length > 0
            ? uploadedUrls
            : form.image_urls
                .split(",")
                .map((u) => u.trim())
                .filter(Boolean),
      };

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
        price: "",
        quantity: "",
        min_order_quantity: "1",
        category_id: "",
        image_urls: "",
      });
      setUploadedUrls([]);
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    },
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Products</h1>
          <p className="mt-1 text-sm text-slate-600">
            All products you have listed for sale.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedProduct(null);
            setSelectedImageIndex(0);
            setFormMode("create");
            setEditingProductId(null);
            setForm({
              name: "",
              description: "",
              price: "",
              quantity: "",
              min_order_quantity: "1",
              category_id: "",
              image_urls: "",
            });
            setUploadedUrls([]);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Product
        </button>
      </header>

      {isLoading ? (
        <div className="py-10 text-center text-gray-500">Loading...</div>
      ) : error ? (
        <div className="py-10 text-center text-red-500">
          Failed to load products.
        </div>
      ) : products.length === 0 ? (
        <div className="py-10 text-center text-gray-500">
          No products found.
        </div>
      ) : (
        <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => {
            const images: string[] = Array.isArray(product.image_url)
              ? product.image_url
              : product.image_url
              ? [product.image_url]
              : [];
            const primaryImage = images[0];
            const extraCount = images.length > 1 ? images.length - 1 : 0;

            return (
              <div
                key={product.id}
                className="border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedImageIndex(0);
                  setSelectedProduct(product);
                }}
              >
                <div className="relative w-full h-40 bg-slate-100">
                  {primaryImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={primaryImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                      No image
                    </div>
                  )}
                  {extraCount > 0 && (
                    <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-full">
                      +{extraCount} more
                    </span>
                  )}
                </div>

                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900 text-sm line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      {product.Category?.name && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 whitespace-nowrap">
                          {product.Category.name}
                        </span>
                      )}
                      {product.is_active === false && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 whitespace-nowrap">
                          Pending approval
                        </span>
                      )}
                    </div>
                  </div>

                  {product.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-2 border-t text-xs">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[11px] text-slate-500">Price</span>
                      <span className="text-green-700 font-semibold text-sm">
                        {formatAED(product.price)}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 text-slate-500">
                      <span className="text-[11px]">Stock</span>
                      <span className="text-xs font-medium">
                        {product.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 my-10">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              {formMode === "create" ? "Add New Product" : "Edit Product"}
            </h2>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (formMode === "edit") {
                  updateMutation.mutate();
                } else {
                  createMutation.mutate();
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full border rounded px-3 py-2 text-sm min-h-[80px]"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({ ...form, quantity: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Minimum order quantity
                </label>
                <input
                  type="number"
                  min={1}
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.min_order_quantity}
                  onChange={(e) =>
                    setForm({ ...form, min_order_quantity: e.target.value })
                  }
                  required
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Buyers can’t purchase below this quantity.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.category_id}
                  onChange={(e) =>
                    setForm({ ...form, category_id: e.target.value })
                  }
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id || cat._id} value={cat.id || cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 border-t pt-4 space-y-3">
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
                      className="inline-flex items-center px-3 py-1.5 rounded-md border text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 cursor-pointer"
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
                        const res = await api.post("/upload/multiple", formData, {
                          headers: {
                            "Content-Type": "multipart/form-data",
                          },
                        });
                        const urls =
                          res.data?.urls || res.data?.url || res.data || [];
                        const newUrls = Array.isArray(urls) ? urls : [urls];
                        setUploadedUrls((prev) => [...prev, ...newUrls]);
                      } catch (err) {
                        console.error("Image upload failed", err);
                        setUploadedUrls([]);
                      } finally {
                        setUploading(false);
                      }
                    }}
                  />
                  {uploading && (
                    <p className="mt-1 text-xs text-gray-500">
                      Uploading images...
                    </p>
                  )}
                  {uploadedUrls.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-green-600">
                        {uploadedUrls.length} image(s) uploaded. Click × to remove.
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
                                setUploadedUrls((prev) =>
                                  prev.filter((u) => u !== url),
                                )
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

              {createMutation.isError && (
                <div className="text-sm text-red-500">
                  Failed to create product. Please check your input.
                </div>
              )}
              {updateMutation.isError && (
                <div className="text-sm text-red-500">
                  Failed to update product. Please check your input.
                </div>
              )}

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm rounded border"
                  onClick={() => setIsModalOpen(false)}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : formMode === "edit"
                    ? "Update Product"
                    : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between border-b px-5 py-4 bg-white/80 backdrop-blur-sm">
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
                onClick={() => {
                  setSelectedProduct(null);
                  setSelectedImageIndex(0);
                }}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>

            <div className="px-5 py-4 space-y-4 text-sm overflow-y-auto max-h-[calc(90vh-60px)]">
              {(() => {
                const imgs: string[] = Array.isArray(selectedProduct.image_url)
                  ? selectedProduct.image_url
                  : selectedProduct.image_url
                  ? [selectedProduct.image_url]
                  : [];
                if (!imgs.length) {
                  return (
                    <div className="flex h-40 w-full items-center justify-center rounded-xl border border-dashed bg-slate-50 text-xs text-slate-400">
                      No images available
                    </div>
                  );
                }
                const activeIndex = Math.min(selectedImageIndex, imgs.length - 1);
                return (
                  <div className="space-y-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgs[activeIndex]}
                      alt={selectedProduct.name || "Product image"}
                      className="w-full h-60 rounded-xl object-cover border"
                    />
                    {imgs.length > 1 && (
                      <div className="flex flex-wrap gap-2">
                        {imgs.map((url: string, idx: number) => (
                          <button
                            key={url}
                            type="button"
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`relative h-16 w-16 rounded-lg overflow-hidden border transition-all ${
                              idx === activeIndex
                                ? "border-blue-500 ring-2 ring-blue-400/60"
                                : "border-slate-200 hover:border-slate-400"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt="Product thumbnail"
                              className="h-full w-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="space-y-2">
                <h3 className="text-base font-semibold text-slate-900">
                  {selectedProduct.name}
                </h3>
                {selectedProduct.Category?.name && (
                  <p className="text-xs text-slate-500">
                    Category: {selectedProduct.Category.name}
                  </p>
                )}
                {selectedProduct.description && (
                  <p className="mt-1 text-sm text-slate-700 whitespace-pre-line">
                    {selectedProduct.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">Price</span>
                    <span className="font-semibold text-emerald-700">
                      {selectedProduct.price} AED
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Stock</span>
                    <span>{selectedProduct.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Min order</span>
                    <span>{selectedProduct.min_order_quantity ?? 1}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  {selectedProduct.createdAt && (
                    <div className="flex justify-between">
                      <span className="font-medium">Created</span>
                      <span className="text-right text-slate-600">
                        {new Date(selectedProduct.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {selectedProduct.updatedAt && (
                    <div className="flex justify-between">
                      <span className="font-medium">Last updated</span>
                      <span className="text-right text-slate-600">
                        {new Date(selectedProduct.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedProduct) return;
                    const imgs: string[] = Array.isArray(selectedProduct.image_url)
                      ? selectedProduct.image_url
                      : selectedProduct.image_url
                      ? [selectedProduct.image_url]
                      : [];
                    setFormMode("edit");
                    setEditingProductId(selectedProduct.id);
                    setForm({
                      name: selectedProduct.name || "",
                      description: selectedProduct.description || "",
                      price: String(selectedProduct.price ?? ""),
                      quantity: String(selectedProduct.quantity ?? ""),
                      min_order_quantity: String(selectedProduct.min_order_quantity ?? 1),
                      category_id: String(
                        selectedProduct.category_id || selectedProduct.Category?.id || "",
                      ),
                      image_urls: "",
                    });
                    setUploadedUrls(imgs);
                    setSelectedProduct(null);
                    setSelectedImageIndex(0);
                    setIsModalOpen(true);
                  }}
                  className="rounded-md border px-3 py-1.5 text-blue-600 border-blue-500 hover:bg-blue-50 font-medium"
                >
                  Edit product
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-md border px-3 py-1.5 text-yellow-700 border-yellow-500 hover:bg-yellow-50 font-medium"
                    disabled={toggleStatusMutation.isPending || selectedProduct?.is_active === false}
                    onClick={() => {
                      if (!selectedProduct) return;
                      // Sellers can only disable an already-approved product.
                      // Enabling requires admin approval.
                      const next = false;
                      setSelectedProduct({ ...selectedProduct, is_active: next });
                      toggleStatusMutation.mutate({
                        id: selectedProduct.id,
                        is_active: next,
                      });
                    }}
                  >
                    {selectedProduct?.is_active === false ? "Pending approval" : "Disable"}
                  </button>
                  <button
                    type="button"
                    className="rounded-md border px-3 py-1.5 text-red-600 border-red-500 hover:bg-red-50 font-medium"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (!selectedProduct) return;
                      if (!window.confirm("Are you sure you want to delete this product?")) {
                        return;
                      }
                      deleteMutation.mutate(selectedProduct.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct(null);
                    setSelectedImageIndex(0);
                  }}
                  className="rounded-md border px-3 py-1.5 text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
