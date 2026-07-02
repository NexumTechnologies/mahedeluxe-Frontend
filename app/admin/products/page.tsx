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

type AdminProductUser = {
  name?: string;
  email?: string;
  role?: string;
};

type AdminProductCategory = {
  name?: string;
};

type AdminProductSubCategory = {
  id?: number;
  name?: string;
  variant_type?: string;
  variant_options?: string[];
};

type AdminProductSubSubCategory = {
  id?: number;
  name?: string;
};

type AdminProduct = {
  id: number;
  user_id?: number;
  name: string;
  description?: string | null;
  price?: number | string;
  commission_percentage?: number | string;
  quantity?: number | string;
  min_order_quantity?: number | string;
  category_id?: number | string;
  sub_category_id?: number | string | null;
  sub_sub_category_id?: number | string | null;
  is_active?: boolean;
  image_url?: string | string[] | null;
  sizes?: string[] | string | null;
  size_variants?: Array<{
    size?: string;
    price?: number | string;
    image_url?: string[] | string | null;
  }> | null;
  colors?: string[] | string | null;
  User?: AdminProductUser;
  Category?: AdminProductCategory;
  SubCategory?: AdminProductSubCategory;
  SubSubCategory?: AdminProductSubSubCategory;
  createdAt?: string;
  updatedAt?: string;
};

type AdminProductsResponse = {
  data?: {
    items?: AdminProduct[];
    pagination?: {
      totalItems?: number;
      totalPages?: number;
      currentPage?: number;
      pageSize?: number;
    };
  };
  products?: AdminProduct[];
} | AdminProduct[];

type CategoriesResponse =
  | {
      data?: { items?: CategoryOption[] };
      categories?: CategoryOption[];
    }
  | CategoryOption[];

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

const normalizeVariantsForForm = (product: AdminProduct): SizeVariantForm[] => {
  if (
    !Array.isArray(product?.size_variants) ||
    product.size_variants.length === 0
  ) {
    return [emptyVariant()];
  }

  return product.size_variants.map((variant) => ({
    size: String(variant?.size || ""),
    price: String(variant?.price ?? ""),
    image_url: Array.isArray(variant?.image_url)
      ? variant.image_url
      : variant?.image_url
        ? [variant.image_url]
        : [],
  }));
};

const buildSizeVariantPayload = (
  variants: SizeVariantForm[],
) =>
  variants
    .map((variant) => {
      return {
        size: variant.size.trim(),
        price: Number(variant.price),
        image_url: variant.image_url.filter(Boolean),
      };
    })
    .filter(
      (variant) =>
        variant.size &&
        Number.isFinite(variant.price) &&
        variant.price > 0 &&
        variant.image_url.length > 0,
    );

const getProductFormValidationErrors = ({
  form,
  uploadedUrls,
  normalizedSizeVariants,
  requiresSubCategory,
  requiresSubSubCategory,
}: {
  form: {
    name: string;
    description: string;
    quantity: string;
    min_order_quantity: string;
    category_id: string;
    sub_category_id: string;
    sub_sub_category_id: string;
  };
  uploadedUrls: string[];
  normalizedSizeVariants: Array<{
    size: string;
    price: number;
    image_url: string[];
  }>;
  requiresSubCategory: boolean;
  requiresSubSubCategory: boolean;
}) => {
  const errors: string[] = [];

  if (!form.name.trim()) errors.push("Enter a product name.");
  if (!form.description.trim()) errors.push("Enter a product description.");

  if (!String(form.quantity).trim()) {
    errors.push("Enter product quantity.");
  } else if (Number(form.quantity) <= 0) {
    errors.push("Quantity must be greater than 0.");
  }

  if (!String(form.min_order_quantity).trim()) {
    errors.push("Enter minimum order quantity.");
  } else if (Number(form.min_order_quantity) < 1) {
    errors.push("Minimum order quantity must be at least 1.");
  }

  if (
    String(form.quantity).trim() &&
    String(form.min_order_quantity).trim() &&
    Number(form.quantity) > 0 &&
    Number(form.min_order_quantity) >= 1 &&
    Number(form.quantity) < Number(form.min_order_quantity)
  ) {
    errors.push(
      "Quantity must be greater than or equal to minimum order quantity.",
    );
  }

  if (!String(form.category_id).trim()) errors.push("Select a category.");
  if (requiresSubCategory && !String(form.sub_category_id).trim()) {
    errors.push("Select a subcategory.");
  }
  if (requiresSubSubCategory && !String(form.sub_sub_category_id).trim()) {
    errors.push("Select a sub-sub-category.");
  }

  if (uploadedUrls.length === 0) {
    errors.push("Upload at least one product image.");
  }

  if (normalizedSizeVariants.length === 0) {
    errors.push(
      "Add at least one complete variant option with value, price, and assigned image.",
    );
  }

  return errors;
};

function getProductsFromResponse(payload: unknown): AdminProduct[] {
  const data = payload as AdminProductsResponse;
  if (Array.isArray(data)) return data;
  return data?.data?.items ?? data?.products ?? [];
}

function getCategoriesFromResponse(payload: unknown): CategoryOption[] {
  const data = payload as CategoriesResponse;
  if (Array.isArray(data)) return data;
  return data?.data?.items ?? data?.categories ?? [];
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [productModalMode, setProductModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<
    "all" | "seller" | "buyer" | "admin"
  >("all");
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    tone?: "success" | "error";
  } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(
    null,
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [pendingApprovalId, setPendingApprovalId] = useState<number | null>(
    null,
  );
  const [pendingNextIsActive, setPendingNextIsActive] = useState<
    boolean | null
  >(null);
  const [commissionDrafts, setCommissionDrafts] = useState<
    Record<number, string>
  >({});
  const [editingCommissionId, setEditingCommissionId] = useState<number | null>(null);
  const [updatingCommissionId, setUpdatingCommissionId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
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
  const [sizeVariants, setSizeVariants] = useState<SizeVariantForm[]>([
    emptyVariant(),
  ]);

  //========================= API CALLS ==========================//
  //==============================================================//
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-products", activeTab, currentPage, productsPerPage],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await api.get("/product/admin", {
        params: {
          page: currentPage,
          size: productsPerPage,
          ...(activeTab !== "all" ? { role: activeTab } : {}),
        },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res.data;
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories-options"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await api.get("/category", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res.data;
    },
  });

  const categories = getCategoriesFromResponse(categoriesData);
  const selectedCategoryId = String(form.category_id || "").trim();
  const { data: subCategoriesData } = useQuery({
    queryKey: ["admin-subcategories-options", selectedCategoryId],
    enabled: selectedCategoryId.length > 0,
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await api.get("/subcategory", {
        params: { category_id: selectedCategoryId, is_active: true },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res.data;
    },
  });

  const subCategories =
    (Array.isArray(subCategoriesData?.data?.items) && subCategoriesData.data.items) ||
    (Array.isArray(subCategoriesData?.subcategories) && subCategoriesData.subcategories) ||
    (Array.isArray(subCategoriesData) ? subCategoriesData : []);
  const selectedSubCategoryId = String(form.sub_category_id || "").trim();
  const { data: subSubCategoriesData } = useQuery({
    queryKey: ["admin-subsubcategories-options", selectedSubCategoryId],
    enabled: selectedSubCategoryId.length > 0,
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await api.get("/sub-subcategory", {
        params: { sub_category_id: selectedSubCategoryId, is_active: true },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res.data;
    },
  });

  const subSubCategories =
    (Array.isArray(subSubCategoriesData?.data?.items) && subSubCategoriesData.data.items) ||
    (Array.isArray(subSubCategoriesData?.subSubCategories) &&
      subSubCategoriesData.subSubCategories) ||
    (Array.isArray(subSubCategoriesData) ? subSubCategoriesData : []);
  const selectedSubCategory =
    subCategories.find((item: AdminProductSubCategory) => String(item?.id || "") === selectedSubCategoryId) || null;
  const variantTypeMeta = getVariantTypeMeta(
    selectedSubCategory?.variant_options || selectedSubCategory?.variant_type,
  );

  const responseData = Array.isArray(data) ? undefined : data?.data;
  const products = getProductsFromResponse(data);
  const pagination = responseData?.pagination;
  const displayProducts = products.filter((product) => {
    if (activeTab === "all") return true;
    const role = String(product.User?.role || "").toLowerCase();
    return role === activeTab;
  });
  const totalItems =
    activeTab === "all"
      ? pagination?.totalItems ?? displayProducts.length
      : pagination?.totalItems ?? displayProducts.length;
  const totalPages = Math.max(
    pagination?.totalPages ?? Math.ceil(totalItems / productsPerPage) ?? 1,
    1,
  );
  const pageFromApi = pagination?.currentPage ?? currentPage;
  const startIndex = totalItems === 0 ? 0 : (pageFromApi - 1) * productsPerPage + 1;
  const endIndex = Math.min(pageFromApi * productsPerPage, totalItems);

  const imagesForSelected = (() => {
    if (!selectedProduct) return [];
    const raw = selectedProduct.image_url;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string" && raw.trim()) return [raw];
    return [];
  })();
  const selectedProductColors = Array.isArray(selectedProduct?.colors)
    ? selectedProduct.colors.filter(Boolean)
    : typeof selectedProduct?.colors === "string" && selectedProduct.colors.trim()
      ? selectedProduct.colors
          .split(",")
          .map((color) => color.trim())
          .filter(Boolean)
      : [];
  const selectedProductVariants = Array.isArray(selectedProduct?.size_variants)
    ? selectedProduct.size_variants
    : [];

  const approvalMutation = useMutation({
    mutationFn: async ({
      id,
      is_active,
    }: {
      id: number;
      is_active: boolean;
    }) => {
      const token = localStorage.getItem("token");
      const res = await api.patch(
        `/product/${id}/approve`,
        { is_active },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      return res.data;
    },
    onMutate: (variables) => {
      setPendingApprovalId(variables.id);
      setPendingNextIsActive(variables.is_active);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      const approved = Boolean(variables?.is_active);
      setToast({
        show: true,
        message: approved ? "Product approved" : "Product unapproved",
        tone: "success",
      });
      setTimeout(() => setToast(null), 2500);
    },
    onError: () => {
      setToast({
        show: true,
        message: "Failed to update product status",
        tone: "error",
      });
      setTimeout(() => setToast(null), 2500);
    },
    onSettled: () => {
      setPendingApprovalId(null);
      setPendingNextIsActive(null);
    },
  });

  const requiresSubCategory = selectedCategoryId.length > 0 && subCategories.length > 0;
  const requiresSubSubCategory =
    selectedSubCategoryId.length > 0 && subSubCategories.length > 0;
  const normalizedSizeVariants = buildSizeVariantPayload(
    sizeVariants,
  );
  const fallbackVariantPrice = normalizedSizeVariants[0]?.price ?? 0;
  const validationErrors = getProductFormValidationErrors({
    form,
    uploadedUrls,
    normalizedSizeVariants,
    requiresSubCategory,
    requiresSubSubCategory,
  });
  const isFormReady = validationErrors.length === 0;

  const resetForm = () => {
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
    setEditingProductId(null);
    setProductModalMode("create");
    setShowValidationErrors(false);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (product: AdminProduct) => {
    const imageUrls = Array.isArray(product.image_url)
      ? product.image_url
      : typeof product.image_url === "string" && product.image_url.trim().length > 0
        ? [product.image_url]
        : [];

    setProductModalMode("edit");
    setEditingProductId(product.id);
    setForm({
      name: product.name ?? "",
      description: product.description ?? "",
      quantity: String(product.quantity ?? ""),
      min_order_quantity: String(product.min_order_quantity ?? 1),
      colors: Array.isArray(product.colors) ? product.colors.join(", ") : String(product.colors ?? ""),
      category_id: String(product.category_id ?? ""),
      sub_category_id: String(product.sub_category_id ?? product.SubCategory?.id ?? ""),
      sub_sub_category_id: String(
        product.sub_sub_category_id ?? product.SubSubCategory?.id ?? "",
      ),
      image_urls: "",
    });
    setUploadedUrls(imageUrls);
    setSizeVariants(normalizeVariantsForForm(product));
    setShowValidationErrors(false);
    setIsCreateModalOpen(true);
  };

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
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-own-products"] });
      setIsCreateModalOpen(false);
      resetForm();
      setToast({
        show: true,
        message: "Product created successfully",
        tone: "success",
      });
      setTimeout(() => setToast(null), 2500);
    },
    onError: () => {
      setToast({
        show: true,
        message: "Failed to create product",
        tone: "error",
      });
      setTimeout(() => setToast(null), 2500);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingProductId) throw new Error("Missing product id");

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

      const res = await api.put(`/product/${editingProductId}`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-own-products"] });
      setIsCreateModalOpen(false);
      resetForm();
      setToast({
        show: true,
        message: "Product updated successfully",
        tone: "success",
      });
      setTimeout(() => setToast(null), 2500);
    },
    onError: () => {
      setToast({
        show: true,
        message: "Failed to update product",
        tone: "error",
      });
      setTimeout(() => setToast(null), 2500);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("token");
      const res = await api.delete(`/product/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res.data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-own-products"] });
      if (selectedProduct?.id === id) {
        setSelectedProduct(null);
        setSelectedImageIndex(0);
      }
      setDeleteTarget(null);
      setToast({
        show: true,
        message: "Product deleted successfully",
        tone: "success",
      });
      setTimeout(() => setToast(null), 2500);
    },
    onError: () => {
      setToast({
        show: true,
        message: "Failed to delete product",
        tone: "error",
      });
      setTimeout(() => setToast(null), 2500);
    },
  });

  const commissionMutation = useMutation({
    mutationFn: async ({ id, commission }: { id: number; commission: number }) => {
      const token = localStorage.getItem("token");
      const res = await api.patch(
        `/product/${id}/commission`,
        { commission_percentage: commission },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      return res.data;
    },
    onMutate: (variables) => {
      setUpdatingCommissionId(variables.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setToast({
        show: true,
        message: "Product commission updated",
        tone: "success",
      });
      setTimeout(() => setToast(null), 2500);
      setEditingCommissionId(null);
    },
    onError: () => {
      setToast({
        show: true,
        message: "Failed to update product commission",
        tone: "error",
      });
      setTimeout(() => setToast(null), 2500);
    },
    onSettled: () => {
      setUpdatingCommissionId(null);
    },
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {toast?.show && (
        <div className="fixed top-6 right-6 z-50">
          <div
            className={`flex items-center gap-2 rounded-lg px-4 py-2 shadow-lg text-sm font-medium ${
              toast.tone === "error"
                ? "bg-red-600 text-white"
                : "bg-emerald-600 text-white"
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Management</h1>
          <p className="mt-1 text-sm text-slate-600">
            View all products and approve them for the marketplace.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Product
        </button>
      </header>

      <section className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab("all");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("seller");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                activeTab === "seller"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Seller
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("buyer");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                activeTab === "buyer"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Buyer
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("admin");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                activeTab === "admin"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Admin
            </button>
          </div>

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
          ) : !displayProducts.length ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No products found for this tab.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-slate-500 border-b bg-slate-50/60">
                  <tr>
                    <th className="py-3 pr-4">Product</th>
                    <th className="py-2 pr-4">Seller</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Base Price</th>
                    <th className="py-2 pr-4">Commission (%)</th>
                    <th className="py-2 pr-4">Stock</th>
                    <th className="py-2 pr-0 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {displayProducts.map((product) => {
                    const isApproved = Boolean(product.is_active);
                    const images: string[] = Array.isArray(product.image_url)
                      ? product.image_url
                      : product.image_url
                        ? [String(product.image_url)]
                        : [];
                    const primaryImage = images[0] || "/dummy-product.png";
                    const isThisPending =
                      approvalMutation.isPending &&
                      pendingApprovalId === product.id;
                    const pendingLabel =
                      pendingNextIsActive === true
                        ? "Approving..."
                        : pendingNextIsActive === false
                          ? "Unapproving..."
                          : "Updating...";
                    const uploaderRole = product.User?.role
                      ? String(product.User.role)
                      : "";
                    const productCommission = Number(product.commission_percentage ?? 0);
                    const currentCommission = Number.isFinite(productCommission)
                      ? productCommission
                      : 0;
                    const draftCommission =
                      commissionDrafts[product.id] ?? String(currentCommission);
                    const parsedDraftCommission = Number(draftCommission);
                    const isValidDraftCommission =
                      Number.isFinite(parsedDraftCommission) &&
                      parsedDraftCommission >= 0 &&
                      parsedDraftCommission <= 100;
                    const hasCommissionChanged =
                      isValidDraftCommission &&
                      Math.abs(parsedDraftCommission - currentCommission) > 0.0001;

                    return (
                      <tr key={product.id} className="align-top">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3 min-w-55">
                            <div className="w-12 h-12 rounded-lg border bg-slate-100 overflow-hidden shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={primaryImage}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div
                                className="font-semibold text-slate-900"
                                style={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {product.name}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                ID: {product.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 pr-4">
                          <div className="text-xs text-slate-900">
                            {product.User?.name || "Seller"}
                          </div>
                          {uploaderRole && (
                            <div className="text-[11px] text-slate-500 capitalize">
                              {uploaderRole}
                            </div>
                          )}
                          {product.User?.email && (
                            <div className="text-[11px] text-slate-500">
                              {product.User.email}
                            </div>
                          )}
                        </td>
                        <td className="py-2 pr-4 text-xs text-slate-700">
                          <div>{product.Category?.name || "-"}</div>
                          {product.SubCategory?.name && (
                            <div className="text-[11px] text-slate-500">
                              {product.SubCategory.name}
                            </div>
                          )}
                          {product.SubSubCategory?.name && (
                            <div className="text-[11px] text-slate-500">
                              {product.SubSubCategory.name}
                            </div>
                          )}
                        </td>
                        <td className="py-2 pr-4">
                          {isApproved ? (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700">
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-4">
                          <span className="font-semibold text-slate-900">
                            {product.price} AED
                          </span>
                        </td>
                        <td className="py-2 pr-4">
                          {editingCommissionId === product.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                step={0.01}
                                value={draftCommission}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setCommissionDrafts((prev) => ({
                                    ...prev,
                                    [product.id]: value,
                                  }));
                                }}
                                className="w-20 rounded-md border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
                              />
                              <button
                                type="button"
                                disabled={
                                  updatingCommissionId === product.id ||
                                  !isValidDraftCommission ||
                                  !hasCommissionChanged
                                }
                                onClick={() => {
                                  setUpdatingCommissionId(product.id);
                                  commissionMutation.mutate({
                                    id: product.id,
                                    commission: parsedDraftCommission,
                                  });
                                }}
                                className="inline-flex items-center rounded-full bg-slate-900 text-white px-3 py-1 text-[11px] font-medium hover:bg-slate-800 disabled:opacity-60"
                              >
                                {updatingCommissionId === product.id ? "Saving..." : "Save"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCommissionDrafts((prev) => {
                                    const next = { ...prev };
                                    delete next[product.id];
                                    return next;
                                  });
                                  setEditingCommissionId(null);
                                }}
                                className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[12px] font-medium text-slate-800">
                                {currentCommission}%
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCommissionId(product.id);
                                  setCommissionDrafts((prev) => ({
                                    ...prev,
                                    [product.id]: String(currentCommission),
                                  }));
                                }}
                                className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="py-2 pr-4 text-xs text-slate-700">
                          {product.quantity}
                        </td>
                        <td className="py-2 pr-0 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProduct(product);
                                setSelectedImageIndex(0);
                              }}
                              className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(product)}
                              className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium border-blue-500 text-blue-600 hover:bg-blue-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                approvalMutation.mutate({
                                  id: product.id,
                                  is_active: !isApproved,
                                });
                              }}
                              disabled={approvalMutation.isPending}
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium border transition-colors disabled:opacity-60 ${
                                isApproved
                                  ? "border-red-500 text-red-600 hover:bg-red-50"
                                  : "border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                              }`}
                            >
                              {isThisPending && (
                                <span
                                  className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
                                  aria-hidden="true"
                                />
                              )}
                              {isThisPending
                                ? pendingLabel
                                : isApproved
                                  ? "Unapprove"
                                  : "Approve"}
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteTarget(product)}
                              className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium border-red-300 text-red-700 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-slate-500">
                  Showing {startIndex}-{endIndex} of {totalItems} products
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={pageFromApi === 1}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-slate-600">
                    Page {pageFromApi} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={pageFromApi === totalPages}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
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
                  ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¢
                </button>
              </div>

              <div className="px-6 py-4 text-sm text-slate-600">
                This action canÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢t be undone.
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
          <div className="app-modal-panel flex max-w-4xl flex-col">
            <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-slate-900 truncate">
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
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¢
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

              <div className="md:col-span-2 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1 text-[11px] text-slate-500">
                    <div>
                      Product ID: <span className="text-slate-700">{selectedProduct.id}</span>
                    </div>
                    {selectedProduct.user_id && (
                      <div>
                        Seller ID: <span className="text-slate-700">{selectedProduct.user_id}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    {selectedProduct.is_active ? (
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

                {selectedProduct.description ? (
                  <div>
                    <div className="text-xs font-semibold text-slate-600">
                      Description
                    </div>
                    <div className="text-slate-900 mt-1 whitespace-pre-wrap">
                      {selectedProduct.description}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-xs font-semibold text-slate-600">
                      Description
                    </div>
                    <div className="text-slate-500 mt-1">No description</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg">
                    <div className="text-xs text-slate-500">Base Price</div>
                    <div className="font-semibold text-slate-900">
                      {selectedProduct.price ?? "-"} AED
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-xs text-slate-500">Stock</div>
                    <div className="font-semibold text-slate-900">
                      {selectedProduct.quantity ?? "-"}
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-xs text-slate-500">Commission</div>
                    <div className="font-semibold text-slate-900">
                      {Number(selectedProduct.commission_percentage ?? 0)}%
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-xs text-slate-500">Minimum Order Quantity</div>
                    <div className="font-semibold text-slate-900">
                      {selectedProduct.min_order_quantity ?? "-"}
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-xs text-slate-500">Category Details</div>
                    <div className="font-semibold text-slate-900">
                      {selectedProduct.Category?.name || "-"}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      Category ID: {selectedProduct.category_id ?? "-"}
                    </div>
                    {selectedProduct.SubCategory?.name && (
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        Subcategory: {selectedProduct.SubCategory.name}
                        {selectedProduct.sub_category_id
                          ? ` (ID: ${selectedProduct.sub_category_id})`
                          : ""}
                      </div>
                    )}
                    {selectedProduct.SubSubCategory?.name && (
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        Sub-sub-category: {selectedProduct.SubSubCategory.name}
                        {selectedProduct.sub_sub_category_id
                          ? ` (ID: ${selectedProduct.sub_sub_category_id})`
                          : ""}
                      </div>
                    )}
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-xs text-slate-500">Seller / Uploader</div>
                    <div className="font-semibold text-slate-900">
                      {selectedProduct.User?.name || "Seller"}
                    </div>
                    {selectedProduct.User?.email && (
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {selectedProduct.User.email}
                      </div>
                    )}
                    {selectedProduct.User?.role && (
                      <div className="text-[11px] text-slate-500 mt-0.5 capitalize">
                        Role: {selectedProduct.User.role}
                      </div>
                    )}
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-xs text-slate-500">Images</div>
                    <div className="font-semibold text-slate-900">
                      {imagesForSelected.length}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      Total uploaded product images
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-xs text-slate-500">Colors</div>
                    {selectedProductColors.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedProductColors.map((color) => (
                          <span
                            key={color}
                            className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="font-semibold text-slate-900">-</div>
                    )}
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-xs text-slate-500">Dates</div>
                    <div className="mt-1 space-y-1 text-[11px] text-slate-600">
                      <div>
                        Created:{" "}
                        <span className="text-slate-900">
                          {selectedProduct.createdAt
                            ? new Date(selectedProduct.createdAt).toLocaleString()
                            : "-"}
                        </span>
                      </div>
                      <div>
                        Updated:{" "}
                        <span className="text-slate-900">
                          {selectedProduct.updatedAt
                            ? new Date(selectedProduct.updatedAt).toLocaleString()
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-3">
                  <div className="text-xs font-semibold text-slate-600">
                    Product Variants
                  </div>
                  {selectedProductVariants.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {selectedProductVariants.map((variant, index) => {
                        const variantImages = Array.isArray(variant?.image_url)
                          ? variant.image_url
                          : variant?.image_url
                            ? [variant.image_url]
                            : [];

                        return (
                          <div
                            key={`${variant?.size || "variant"}-${index}`}
                            className="rounded-lg border bg-slate-50 p-3"
                          >
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                              <div>
                                <div className="text-[11px] text-slate-500">Option</div>
                                <div className="font-medium text-slate-900">
                                  {variant?.size || "-"}
                                </div>
                              </div>
                              <div>
                                <div className="text-[11px] text-slate-500">Price</div>
                                <div className="font-medium text-slate-900">
                                  {variant?.price ?? "-"} AED
                                </div>
                              </div>
                              <div>
                                <div className="text-[11px] text-slate-500">Images</div>
                                <div className="font-medium text-slate-900">
                                  {variantImages.length}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-slate-500">
                      No variant details available.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        </ScreenModal>
      )}

      {isCreateModalOpen && (
        <ScreenModal open={isCreateModalOpen}>
          <div className="app-modal-overlay">
            <div className="app-modal-panel flex max-w-lg flex-col">
              <div className="border-b px-6 py-4">
                <h2 className="text-xl font-semibold text-slate-900">
                  {productModalMode === "create" ? "Add New Product" : "Edit Product"}
                </h2>
              </div>

              <form
                className="flex min-h-0 flex-1 flex-col"
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowValidationErrors(true);
                  if (!isFormReady) return;
                  if (productModalMode === "edit") {
                    updateMutation.mutate();
                  } else {
                    createMutation.mutate();
                  }
                }}
              >
                <div className="app-modal-scroll space-y-4 px-6 py-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={form.category_id}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          category_id: e.target.value,
                          sub_category_id: "",
                          sub_sub_category_id: "",
                        })
                      }
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Subcategory
                    </label>
                    <select
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={form.sub_category_id}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          sub_category_id: e.target.value,
                          sub_sub_category_id: "",
                        })
                      }
                      disabled={!selectedCategoryId || subCategories.length === 0}
                    >
                      <option value="">
                        {!selectedCategoryId
                          ? "Select a category first"
                          : subCategories.length === 0
                            ? "No subcategories"
                            : "Select a subcategory"}
                      </option>
                      {subCategories.map((sub: AdminProductSubCategory & { id: number }) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Sub-sub-category
                    </label>
                    <select
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={form.sub_sub_category_id}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          sub_sub_category_id: e.target.value,
                        })
                      }
                      disabled={!selectedSubCategoryId || subSubCategories.length === 0}
                    >
                      <option value="">
                        {!selectedSubCategoryId
                          ? "Select a subcategory first"
                          : subSubCategories.length === 0
                            ? "No sub-sub-categories"
                            : "Select a sub-sub-category"}
                      </option>
                      {subSubCategories.map(
                        (subSub: AdminProductSubSubCategory & { id: number }) => (
                          <option key={subSub.id} value={subSub.id}>
                            {subSub.name}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full border rounded px-3 py-2 text-sm min-h-20"
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Colors
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="Red, Blue, Black"
                        value={form.colors}
                        onChange={(e) =>
                          setForm({ ...form, colors: e.target.value })
                        }
                      />
                      <p className="mt-1 text-[11px] text-slate-500">
                        Optional. Comma separated.
                      </p>
                    </div>
                  </div>

                  <SizeVariantsEditor
                    variants={sizeVariants}
                    onChange={setSizeVariants}
                    allowedOptions={variantTypeMeta.options}
                    title={variantTypeMeta.title}
                    optionLabel={variantTypeMeta.label}
                    helperText={variantTypeMeta.helperText}
                    addButtonText={variantTypeMeta.addButtonText}
                    placeholder={variantTypeMeta.placeholder}
                  />

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
                      Buyers can&apos;t purchase below this quantity.
                    </p>
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
                          htmlFor="admin-product-images"
                          className="inline-flex items-center px-3 py-1.5 rounded-md border text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 cursor-pointer"
                        >
                          Choose images
                        </label>
                        <span className="text-[11px] text-slate-500">
                          JPG, PNG etc. You can select multiple files.
                        </span>
                      </div>
                      <input
                        id="admin-product-images"
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
                            setUploadedUrls((prev) => [...prev, ...newUrls]);
                          } catch (err) {
                            console.error("Image upload failed", err);
                            setToast({
                              show: true,
                              message: "Image upload failed",
                              tone: "error",
                            });
                            setTimeout(() => setToast(null), 2500);
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
                            {uploadedUrls.length} image(s) uploaded. Click Ãƒâ€” to
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
                                  onClick={() => {
                                    setUploadedUrls((prev) =>
                                      prev.filter((u) => u !== url),
                                    );
                                  }}
                                >
                                  Ãƒâ€”
                                </button>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
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
                  </div>

                  {showValidationErrors && validationErrors.length > 0 && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      <p className="font-medium">Please fix the following:</p>
                      <ul className="mt-1 list-disc pl-5">
                        {validationErrors.map((message) => (
                          <li key={message}>{message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border rounded-md text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      createMutation.isPending ||
                      updateMutation.isPending ||
                      uploading
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : productModalMode === "edit"
                        ? "Update Product"
                        : "Save Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ScreenModal>
      )}

    </div>
  );
}


