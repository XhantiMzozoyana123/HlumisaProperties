"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchProperties, updateProperty, deleteProperty, formatMoney } from "@/lib/api";

type Property = Awaited<ReturnType<typeof fetchProperties>>[number];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  "on-market": { label: "On Market", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  "under-offer": { label: "Under Offer", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
  sold: { label: "Sold", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" },
};

const STATUS_OPTIONS: { value: string; label: string; color: string }[] = [
  { value: "on-market", label: "On Market", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { value: "under-offer", label: "Under Offer", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { value: "sold", label: "Sold", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
];

/** Convert a File to a base64 data URI (e.g. data:image/png;base64,...) */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editSellerName, setEditSellerName] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const props = await fetchProperties();
        const found = props.find((p: Property) => p.id === Number(params.id));
        if (active) setProperty(found ?? null);
      } catch {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [params.id]);

  function startEditing() {
    if (!property) return;
    setEditTitle(property.title);
    setEditDescription(property.description);
    setEditPrice(String(property.price));
    setEditSellerName(property.sellerName ?? "");
    setEditImageFile(null);
    setEditImagePreview(null);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setEditImageFile(null);
    setEditImagePreview(null);
  }

  function handleEditImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setEditImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setEditImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setEditImagePreview(null);
    }
  }

  async function handleSaveEdit() {
    if (!property) return;
    const newPrice = Number(editPrice);
    if (!editTitle.trim() || isNaN(newPrice) || newPrice <= 0) return;

    let imageBase64 = property.imageBase64;
    if (editImageFile) {
      imageBase64 = await fileToBase64(editImageFile);
    }

    try {
      const updated = await updateProperty(property.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        price: newPrice,
        sellerName: editSellerName.trim(),
        imageBase64,
      });
      setProperty(updated);
      setEditing(false);
      setEditImageFile(null);
      setEditImagePreview(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update property.");
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!property) return;
    setSaving(true);
    try {
      const updated = await updateProperty(property.id, { status: newStatus });
      setProperty(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!property) return;
    if (confirm("Delete this property permanently?")) {
      try {
        await deleteProperty(property.id);
        router.push("/admin/properties");
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete property.");
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-white transition">
          ← Back to Properties
        </button>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-sm text-stone-400">Loading property…</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="space-y-6">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-white transition">
          ← Back to Properties
        </button>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-sm text-stone-400">Property not found.</div>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[property.status] || STATUS_CONFIG["on-market"];

  return (
    <div className="space-y-8">
      <button onClick={() => router.push("/admin/properties")} className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-white transition">
        ← Back to Properties
      </button>

      <div className="space-y-4">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] border border-white/10 bg-[#2a241a]">
          {property.imageBase64 ? (
            <img src={property.imageBase64} alt={property.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-stone-500 text-sm">No image</div>
          )}
          <div className={`absolute left-6 top-6 rounded-full border px-5 py-2 text-sm font-bold uppercase tracking-wider backdrop-blur-sm ${cfg.bg} ${cfg.color}`}>
            {cfg.label}
          </div>
          <div className="absolute bottom-6 left-6 rounded-full bg-black/70 px-6 py-3 text-lg font-bold text-amber-200 backdrop-blur-sm">
            {formatMoney(property.price)}
          </div>
        </div>
      </div>

      {editing ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">Edit Property</h2>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Title</label>
            <input className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Seller Name</label>
            <input className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500" value={editSellerName} onChange={(e) => setEditSellerName(e.target.value)} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Description</label>
            <textarea className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500" rows={4} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Price (ZAR)</label>
            <input className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500 font-mono" type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
          </div>

          {/* Image upload in edit */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Property Image</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleEditImageSelect}
              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-stone-300 file:mr-3 file:rounded-full file:border-0 file:bg-amber-200 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-stone-950 hover:file:bg-amber-100"
            />
            {editImagePreview && (
              <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
                <img src={editImagePreview} alt="New image preview" className="max-h-48 w-full object-cover" />
              </div>
            )}
            {!editImagePreview && property.imageBase64 && (
              <p className="mt-2 text-xs text-stone-500">Current image will be kept if no new file is selected.</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button onClick={handleSaveEdit} className="rounded-full bg-amber-200 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-100">Save Changes</button>
            <button onClick={cancelEditing} className="rounded-full border border-white/10 px-6 py-3 text-sm text-stone-300 transition hover:bg-white/5">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">{property.title}</h1>
              <p className="mt-2 text-sm text-stone-400">Added {property.dateAdded}</p>
              {property.sellerName && <p className="mt-1 text-sm text-amber-200/60">Seller: {property.sellerName}</p>}
            </div>
            <p className="leading-relaxed text-stone-300 max-w-3xl">{property.description}</p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Listing Status</h2>
            <p className="mb-4 text-sm text-stone-400">Change the status of this property to reflect its current stage.</p>
            <div className="flex flex-wrap gap-3">
              {STATUS_OPTIONS.map((opt) => {
                const isActive = property.status === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    disabled={saving}
                    className={`rounded-full border px-6 py-3 text-sm font-bold uppercase tracking-wider transition ${
                      isActive
                        ? `${opt.color} ring-2 ring-offset-2 ring-offset-stone-950`
                        : "border-white/10 text-stone-500 hover:border-white/20 hover:text-stone-300"
                    } disabled:opacity-50`}
                  >
                    {isActive && "✓ "}{opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="flex items-center justify-between border-t border-white/10 pt-6">
        <p className="text-xs text-stone-500">Property ID: {property.id}</p>
        <div className="flex items-center gap-3">
          {!editing && (
            <button onClick={startEditing} className="rounded-full border border-white/10 px-6 py-3 text-sm text-stone-300 transition hover:bg-white/5">✏️ Edit Property</button>
          )}
          <button onClick={handleDelete} className="rounded-full border border-rose-300/20 px-6 py-3 text-sm text-rose-200 transition hover:bg-rose-500/10">Delete Property</button>
        </div>
      </div>
    </div>
  );
}