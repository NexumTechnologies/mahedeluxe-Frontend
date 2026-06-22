"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

type CategoryOption = {
  id: number;
  name: string;
};

type SubCategoryOption = {
  id: number;
  name: string;
  category_id?: number;
  Category?: {
    id?: number;
    name?: string;
  };
};

type SubSubCategoryItem = {
  id: number;
  name: string;
  description?: string | null;
  image_url?: string | null;
  is_active?: boolean;
  sub_category_id?: number;
  SubCategory?: SubCategoryOption;
};

async function fetchCategories() {
  const res = await api.get("/category");
  if (Array.isArray(res.data?.data?.items)) return res.data.data.items;
  if (Array.isArray(res.data?.categories)) return res.data.categories;
  if (Array.isArray(res.data)) return res.data;
  return [];
}

async function fetchSubCategories() {
  const res = await api.get("/subcategory");
  if (Array.isArray(res.data?.data?.items)) return res.data.data.items;
  if (Array.isArray(res.data?.subcategories)) return res.data.subcategories;
  if (Array.isArray(res.data)) return res.data;
  return [];
}

async function fetchSubSubCategories() {
  const res = await api.get("/sub-subcategory");
  if (Array.isArray(res.data?.data?.items)) return res.data.data.items;
  if (Array.isArray(res.data?.subSubCategories)) return res.data.subSubCategories;
  if (Array.isArray(res.data)) return res.data;
  return [];
}

export default function AdminSubSubCategoriesPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SubSubCategoryItem | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category_id: "",
    sub_category_id: "",
    image_url: "",
  });

  const { data: categories = [] } = useQuery<CategoryOption[]>({
    queryKey: ["admin-categories"],
    queryFn: fetchCategories,
  });

  const { data: subCategories = [] } = useQuery<SubCategoryOption[]>({
    queryKey: ["admin-subcategories-options-all"],
    queryFn: fetchSubCategories,
  });

  const { data: subSubCategories = [], isLoading } = useQuery<SubSubCategoryItem[]>({
    queryKey: ["admin-subsubcategories"],
    queryFn: fetchSubSubCategories,
  });

  const filteredSubCategories = subCategories.filter((subCategory) => {
    if (!form.category_id.trim()) return true;
    return String(subCategory.category_id || subCategory.Category?.id || "") === form.category_id;
  });

  const createMutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      const res = await api.post("/sub-subcategory", {
        name: payload.name,
        description: payload.description,
        sub_category_id: Number(payload.sub_category_id),
        image_url: payload.image_url,
      });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-subsubcategories"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: typeof form }) => {
      const res = await api.put(`/sub-subcategory/${id}`, {
        name: payload.name,
        description: payload.description,
        sub_category_id: Number(payload.sub_category_id),
        image_url: payload.image_url,
      });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-subsubcategories"] }),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.patch(`/sub-subcategory/${id}/toggle-status`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-subsubcategories"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/sub-subcategory/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-subsubcategories"] }),
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", "sub-subcategories");

    const res = await api.post("/upload/single", formData);
    return String(res.data?.url || res.data?.data?.url || res.data?.secure_url || "").trim();
  };

  useEffect(() => {
    if (!editing) {
      setForm({
        name: "",
        description: "",
        category_id: "",
        sub_category_id: "",
        image_url: "",
      });
      return;
    }

    setForm({
      name: editing.name || "",
      description: editing.description || "",
      category_id: String(
        editing.SubCategory?.category_id || editing.SubCategory?.Category?.id || "",
      ),
      sub_category_id: String(editing.sub_category_id || editing.SubCategory?.id || ""),
      image_url: editing.image_url || "",
    });
  }, [editing]);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Sub-sub-categories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the third level under each subcategory.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white"
        >
          Add Sub-sub-category
        </button>
      </header>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        {isLoading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : (
          <div className="p-4">
            <ul className="divide-y">
              {subSubCategories.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-lg border bg-slate-50">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{item.name}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                          {item.SubCategory?.Category?.name || "No category"}
                        </span>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">
                          {item.SubCategory?.name || "No subcategory"}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] ${
                            item.is_active === false
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {item.is_active === false ? "Inactive" : "Active"}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500">
                        {item.description || "No description"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(item);
                        setModalOpen(true);
                      }}
                      className="rounded-lg border border-indigo-500 px-3 py-1.5 text-sm text-indigo-600"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleStatusMutation.mutate(item.id)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
                    >
                      {item.is_active === false ? "Activate" : "Deactivate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete "${item.name}"?`)) {
                          deleteMutation.mutate(item.id);
                        }
                      }}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="app-modal-overlay">
          <div className="app-modal-panel z-10 flex max-h-[calc(100dvh-2rem)] max-w-2xl flex-col">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-lg font-semibold">
                {editing ? "Edit Sub-sub-category" : "Add Sub-sub-category"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-500"
                disabled={uploadingImage || isSaving}
              >
                Close
              </button>
            </div>

            <div className="app-modal-scroll space-y-3 px-6 py-4">
              <div>
                <label className="text-sm">Category</label>
                <select
                  value={form.category_id}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      category_id: e.target.value,
                      sub_category_id: "",
                    }))
                  }
                  className="w-full rounded border px-3 py-2"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm">Subcategory</label>
                <select
                  value={form.sub_category_id}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, sub_category_id: e.target.value }))
                  }
                  className="w-full rounded border px-3 py-2"
                  disabled={!form.category_id.trim()}
                >
                  <option value="">Select subcategory</option>
                  {filteredSubCategories.map((subCategory) => (
                    <option key={subCategory.id} value={subCategory.id}>
                      {subCategory.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded border px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="min-h-24 w-full rounded border px-3 py-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm">Image</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer rounded border bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100">
                    {uploadingImage ? "Uploading..." : "Upload Image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingImage || isSaving}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        setUploadingImage(true);
                        await new Promise((resolve) => setTimeout(resolve, 0));

                        try {
                          const imageUrl = await uploadImage(file);
                          if (!imageUrl) throw new Error("Upload did not return image URL");
                          setForm((prev) => ({ ...prev, image_url: imageUrl }));
                        } catch (err) {
                          alert((err as Error).message || "Image upload failed");
                        } finally {
                          setUploadingImage(false);
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>
                  {form.image_url && (
                    <button
                      type="button"
                      className="rounded border px-3 py-2 text-sm"
                      onClick={() => setForm((prev) => ({ ...prev, image_url: "" }))}
                    >
                      Remove
                    </button>
                  )}
                </div>

                {form.image_url ? (
                  <div className="h-24 w-24 overflow-hidden rounded-lg border bg-slate-50">
                    <img
                      src={form.image_url}
                      alt="Sub-sub-category preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-2 pt-4">
                <button
                  type="button"
                  disabled={
                    uploadingImage ||
                    isSaving ||
                    !form.name.trim() ||
                    !form.category_id.trim() ||
                    !form.sub_category_id.trim()
                  }
                  onClick={async () => {
                    try {
                      const payload = {
                        name: form.name.trim(),
                        description: form.description.trim(),
                        category_id: form.category_id,
                        sub_category_id: form.sub_category_id,
                        image_url: form.image_url.trim(),
                      };

                      if (editing) {
                        await updateMutation.mutateAsync({ id: editing.id, payload });
                      } else {
                        await createMutation.mutateAsync(payload);
                      }

                      setModalOpen(false);
                    } catch (err) {
                      alert((err as Error).message || "Failed");
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-70"
                >
                  {(uploadingImage || isSaving) && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}
                  {uploadingImage ? "Uploading Image..." : isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={uploadingImage || isSaving}
                  className="rounded border px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
