"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminCategoryDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "" });

  //========================= API CALLS ==========================//
  //==============================================================//
  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/categories/${id}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setCategory(data.category || null);
      if (data.category) setForm({ name: data.category.name || "" });
    } catch (err) {
      console.error(err);
      setCategory(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!category) return <div className="p-6 text-red-600">Category not found</div>;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Category: {category.name}</h1>
          <p className="text-sm text-gray-500 mt-1">ID: {category.id ?? category._id}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/admin/categories')} className="px-3 py-1 border rounded">Back</button>
          <button onClick={() => setEditing((e) => !e)} className="px-3 py-1 bg-indigo-600 text-white rounded">{editing ? 'Cancel' : 'Edit'}</button>
        </div>
      </header>

      {!editing ? (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="text-sm text-gray-500">Name</div>
              <div className="font-medium">{category.name}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm">Name</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full border px-3 py-2 rounded" />
            </div>
            <div className="pt-3 flex items-center gap-2">
              <button onClick={async () => {
                try {
                  const res = await fetch(`/api/categories/${id}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
                  if (!res.ok) throw new Error('Update failed');
                  await load();
                  setEditing(false);
                } catch (err) { alert((err as Error).message || 'Failed'); }
              }} className="bg-indigo-600 text-white px-4 py-2 rounded">Save</button>
              <button onClick={() => setEditing(false)} className="px-4 py-2 border rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
