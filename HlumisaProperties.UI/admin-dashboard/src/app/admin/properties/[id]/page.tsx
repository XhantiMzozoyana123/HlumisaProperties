"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getDemoHouses,
  updateHouseStatus,
  updateDemoHouse,
  deleteDemoHouse,
  formatMoney,
  type DemoHouse,
  type PropertyStatus,
} from "@/lib/localData";
import RequireZola from "@/components/RequireZola";

const STATUS_CONFIG: Record<PropertyStatus, { label: string; color: string; bg: string }> = {
  "on-market": { label: "On Market", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  "under-offer": { label: "Under Offer", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
  sold: { label: "Sold", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" },
};

const STATUS_OPTIONS: { value: PropertyStatus; label: string; color: string }[] = [
  { value: "on-market", label: "On Market", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { value: "under-offer", label: "Under Offer", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { value: "sold", label: "Sold", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
];

function spacedToNumber(val: string): number {
  return Number(val.replace(/\s/g, ""));
}

function numberToSpaced(val: number): string {
  return val.toLocaleString("en-ZA").replace(/,/g, " ");
}

export default function PropertyDetailPage() {
  return (
    <RequireZola>
      <PropertyDetailContent />
    </RequireZola>
  );
}

function PropertyDetailContent() {
  const params = useParams();
  const router = useRouter();
  const [house, setHouse] = useState<DemoHouse | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editSellerName, setEditSellerName] = useState("");

  useEffect(() => {
    const houses = getDemoHouses();
    const found = houses.find((h) => h.id === params.id);
    setHouse(found ?? null);
  }, [params.id]);

  function startEditing() {
    if (!house) return;
    setEditTitle(house.title);
    setEditDescription(house.description);
    setEditPrice(numberToSpaced(house.price));
    setEditSellerName(house.sellerName ?? "");
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
  }

  function handleSaveEdit() {
    if (!house) return;
    const newPrice = spacedToNumber(editPrice);
    if (!editTitle.trim() || isNaN(newPrice) || newPrice <= 0) return;

    updateDemoHouse(house.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      price: newPrice,
      sellerName: editSellerName.trim(),
    });

    setHouse((prev) =>
      prev
        ? { ...prev, title: editTitle.trim(), description: editDescription.trim(), price: newPrice, sellerName: editSellerName.trim() }
        : prev
    );
    setEditing(false);
  }

  function handleStatusChange(newStatus: PropertyStatus) {
    if (!house) return;
    setSaving(true);
    updateHouseStatus(house.id, newStatus);
    setHouse((prev) => (prev ? { ...prev, status: newStatus } : prev));
    setTimeout(() => setSaving(false), 300);
  }

  function handleDelete() {
    if (!house) return;
    if (confirm("Delete this property permanently?")) {
      deleteDemoHouse(house.id);
      router.push("/admin/properties");
    }
  }

  if (!house) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-white transition"
        >
          ← Back to Properties
        </button>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-sm text-stone-400">
          Property not found.
        </div>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[house.status];

  return (
    <div className="space-y-8">
      <button
        onClick={() => router.push("/admin/properties")}
        className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-white transition"
      >
        ← Back to Properties
      </button>

      <div className="space-y-4">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] border border-white/10 bg-[#2a241a]">
          <img
            src={house.images[selectedImage]}
            alt={house.title}
            className="h-full w-full object-cover"
          />
          <div
            className={`absolute left-6 top-6 rounded-full border px-5 py-2 text-sm font-bold uppercase tracking-wider backdrop-blur-sm ${cfg.bg} ${cfg.color}`}
          >
            {cfg.label}
          </div>
          <div className="absolute bottom-6 left-6 rounded-full bg-black/70 px-6 py-3 text-lg font-bold text-amber-200 backdrop-blur-sm">
            {formatMoney(house.price)}
          </div>
        </div>

        {house.images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {house.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                  i === selectedImage
                    ? "border-amber-200"
                    : "border-white/10 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} alt={`View ${i + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
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
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Price (ZAR) — use spaces: e.g. 4 500 000</label>
            <input className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500 font-mono" value={editPrice} onChange={(e) => { const cleaned = e.target.value.replace(/[^0-9 ]/g, ""); setEditPrice(cleaned); }} />
            {editPrice && !isNaN(spacedToNumber(editPrice)) && spacedToNumber(editPrice) > 0 && (
              <p className="mt-2 text-xs text-stone-500">→ {formatMoney(spacedToNumber(editPrice))}</p>
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
              <h1 className="text-3xl font-bold text-white">{house.title}</h1>
              <p className="mt-2 text-sm text-stone-400">Added {house.dateAdded}</p>
              {house.sellerName && <p className="mt-1 text-sm text-amber-200/60">Seller: {house.sellerName}</p>}
            </div>
            <p className="leading-relaxed text-stone-300 max-w-3xl">{house.description}</p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Listing Status</h2>
            <p className="mb-4 text-sm text-stone-400">Change the status of this property to reflect its current stage.</p>
            <div className="flex flex-wrap gap-3">
              {STATUS_OPTIONS.map((opt) => {
                const isActive = house.status === opt.value;
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
        <p className="text-xs text-stone-500">Property ID: {house.id}</p>
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