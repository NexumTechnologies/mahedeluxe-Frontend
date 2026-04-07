"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

async function fetchCategories(parent?: string) {
  const params: any = {};
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
  const [form, setForm] = useState({ name: "" });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => fetchCategories(),
  });

  console.log("categories", categories);

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post(`/category`, payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-categories"] }),
  }); 

  console.log("editing", editing);

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: any) => {
      const res = await api.put(`/category/${id}`, payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-categories"] }),
  });

  useEffect(() => {
    if (!editing) setForm({ name: "" });
    else setForm({ name: editing.name || "" });
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
                  <div>
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
          <div className="app-modal-panel z-10 max-w-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-lg font-semibold">
                {editing ? "Edit Category" : "Add Category"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500"
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
              {/* only name is required now */}

              <div className="pt-4 flex items-center gap-2">
                <button
                  onClick={async () => {
                    try {
                      if (editing) {
                        await updateMutation.mutateAsync({ id: editing.id ?? editing._id, payload: form });
                      } else {
                        await createMutation.mutateAsync(form);
                      }
                      setModalOpen(false);
                    } catch (err) {
                      alert((err as Error).message || "Failed");
                    }
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setModalOpen(false)}
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
