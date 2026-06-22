"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

async function fetchCategories() {
  const res = await api.get(`/category`);
  if (res.data && res.data.data && Array.isArray(res.data.data.items)) return res.data.data.items;
  if (res.data && Array.isArray(res.data.categories)) return res.data.categories;
  if (Array.isArray(res.data)) return res.data;
  return [];
}

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", image_url: "" });
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => fetchCategories(),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post(`/category`, payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-categories"] }),
  }); 

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: any) => {
      const res = await api.put(`/category/${id}`, payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-categories"] }),
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const uploadCategoryImage = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", "categories");

    // Content-Type is handled automatically by the axios interceptor
    // (detects FormData and removes any preset JSON content-type so the
    // browser sets the correct multipart boundary).
    const res = await api.post("/upload/single", formData);

    const imageUrl =
      res.data?.url || res.data?.data?.url || res.data?.secure_url || "";
    return String(imageUrl || "").trim();
  };

  const getCategoryImageUrl = (value: unknown) => {
    if (Array.isArray(value)) {
      const first = value.find((url) => typeof url === "string" && url.trim().length > 0);
      return first ? String(first) : "";
    }
    if (typeof value === "string") return value;
    return "";
  };

  useEffect(() => {
    if (!editing) {
      setForm({ name: "", image_url: "" });
      return;
    }

    setForm({
      name: editing.name || "",
      image_url: getCategoryImageUrl(editing.image_url),
    });
  }, [editing]);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage product categories.
          </p>
        </div>

        <div>
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-lg"
          >
            Add Category
          </button>
        </div>
      </header>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : (
          <div className="p-4">
            <ul className="divide-y">
              {categories.map((c: any) => (
                <li key={c.id ?? c._id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 overflow-hidden rounded-lg border bg-slate-50">
                      {getCategoryImageUrl(c.image_url) ? (
                        <img
                          src={getCategoryImageUrl(c.image_url)}
                          alt={c.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-sm text-gray-500">ID: {c.id ?? c._id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditing(c);
                        setModalOpen(true);
                      }}
                      className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-lg"
                    >
                      Edit
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
                {editing ? "Edit Category" : "Add Category"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500"
                disabled={uploadingImage || isSaving}
              >
                Close
              </button>
            </div>

            <div className="app-modal-scroll space-y-3 px-6 py-4">
              <div>
                <label className="text-sm">Name</label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm">Category Image</label>
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

                        // Show loader immediately — yield so React paints before upload
                        setUploadingImage(true);
                        await new Promise((r) => setTimeout(r, 0));

                        try {
                          const imageUrl = await uploadCategoryImage(file);
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
                    <img src={form.image_url} alt="Category preview" className="h-full w-full object-cover" />
                  </div>
                ) : null}
              </div>

              <div className="pt-4 flex items-center gap-2">
                <button
                  onClick={async () => {
                    try {
                      const payload = {
                        name: form.name.trim(),
                        image_url: form.image_url.trim() || null,
                      };

                      if (editing) {
                        await updateMutation.mutateAsync({ id: editing.id ?? editing._id, payload });
                      } else {
                        await createMutation.mutateAsync(payload);
                      }
                      setModalOpen(false);
                    } catch (err) {
                      alert((err as Error).message || "Failed");
                    }
                  }}
                  disabled={uploadingImage || isSaving || !form.name.trim()}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-70"
                >
                  {(uploadingImage || isSaving) && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}
                  {uploadingImage ? "Uploading Image..." : isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  disabled={uploadingImage || isSaving}
                  className="px-4 py-2 border rounded"
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
