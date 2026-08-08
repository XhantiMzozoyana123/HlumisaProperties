"use client";

import { useEffect, useState } from "react";
import {
  getDemoHouses,
  addDemoHouse,
  deleteDemoHouse,
  formatMoney,
  type DemoHouse,
  type PropertyStatus,
} from "@/lib/localData";
import Link from "next/link";
import RequireZola from "@/components/RequireZola";

const STATUS_CONFIG: Record<PropertyStatus, { label: string; color: string; bg: string }> = {
  "on-market": { label: "On Market", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  "under-offer": { label: "Under Offer", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
  sold: { label: "Sold", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" },
};

export default function PropertiesPage() {
  return (
    <RequireZola>
      <PropertiesContent />
    </RequireZola>
  );
}

function PropertiesContent() {
  const [houses, setHouses] = useState<DemoHouse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<PropertyStatus | "all">("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    sellerName: "",
  });
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    setHouses(getDemoHouses());
  }, []);

  function refresh() {
    setHouses(getDemoHouses());
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImages((prev) => [...prev, dataUrl]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.price) return;

    const newHouse: DemoHouse = {
      id: "h" + Date.now(),
      title: form.title,
      description: form.description,
      price: Number(form.price),
      images: images.length > 0 ? images : [
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Crect width='400' height='260' fill='%232a241a'/%3E%3Ctext x='200' y='130' text-anchor='middle' fill='%23d4b373' font-size='18' font-family='sans-serif'%3ENew Listing%3C/text%3E%3C/svg%3E",
      ],
      dateAdded: new Date().toISOString().split("T")[0],
      status: "on-market",
      sellerName: form.sellerName,
    };

    addDemoHouse(newHouse);
    setForm({ title: "", description: "", price: "", sellerName: "" });
    setImages([]);
    setShowForm(false);
    refresh();
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this property listing?")) return;
    deleteDemoHouse(id);
    refresh();
  }

  const filteredHouses = filter === "all" ? houses : houses.filter((h) => h.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Properties</h1>
          <p className="mt-1 text-sm text-stone-400">
            {houses.length} listing{houses.length !== 1 ? "s" : ""} in the database.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-full bg-amber-200 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-100"
        >
          + Add Property
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {(["all", "on-market", "under-offer", "sold"] as const).map((f) => {
          const isActive = filter === f;
          const cfg = f !== "all" ? STATUS_CONFIG[f] : null;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                isActive
                  ? cfg
                    ? `${cfg.bg} ${cfg.color}`
                    : "bg-white/10 text-white"
                  : "text-stone-500 hover:text-stone-300"
              }`}
            >
              {f === "all" ? "All" : cfg?.label}
            </button>
          );
        })}
      </div>

      {/* Add House form */}
      {showForm && (
        <div className="backdrop-card rounded-[2rem] p-6">
          <h2 className="text-lg font-semibold text-white">New property listing</h2>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <input
              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500"
              placeholder="Property title (e.g. Modern Family Home in Sandton)"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
            <input
              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500"
              placeholder="Seller name (e.g. Michael Johnson)"
              value={form.sellerName}
              onChange={(e) => setForm((f) => ({ ...f, sellerName: e.target.value }))}
              required
            />
            <textarea
              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500"
              placeholder="Description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              required
            />
            <input
              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500"
              placeholder="Price (ZAR)"
              type="number"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              required
            />

            {/* Image upload */}
            <div>
              <p className="mb-2 text-sm text-stone-400">Property pictures</p>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm text-stone-300 transition hover:bg-white/5">
                📷 Add images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>

              {images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl border border-white/10">
                      <img src={img} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-bl-xl bg-rose-500/80 text-xs text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" className="rounded-full bg-amber-200 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-100">
                Create listing
              </button>
              <button type="button" onClick={() => { setShowForm(false); setImages([]); }} className="rounded-full border border-white/10 px-6 py-3 text-sm text-stone-300 transition hover:bg-white/5">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Property Grid — 2 columns */}
      {filteredHouses.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-sm text-stone-400">
          No properties found. Click &ldquo;+ Add Property&rdquo; to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredHouses.map((house) => {
            const cfg = STATUS_CONFIG[house.status];
            return (
              <Link
                key={house.id}
                href={`/admin/properties/${house.id}`}
                className="group block overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] transition hover:border-white/20 hover:bg-white/[0.06]"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#2a241a]">
                  <img
                    src={house.images[0]}
                    alt={house.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  {/* Status badge */}
                  <div className={`absolute left-4 top-4 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                  </div>
                  {/* Price overlay */}
                  <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-4 py-2 text-sm font-semibold text-amber-200 backdrop-blur-sm">
                    {formatMoney(house.price)}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 p-5">
                  <h3 className="text-lg font-semibold text-white group-hover:text-amber-200 transition-colors">
                    {house.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-stone-400 line-clamp-2">
                    {house.description}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs uppercase tracking-wider text-stone-500">Seller:</span>
                    <span className="text-sm font-medium text-amber-200/80">
                      {house.sellerName || "Not assigned"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-stone-500">Added {house.dateAdded}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(house.id);
                      }}
                      className="rounded-full border border-rose-300/20 px-4 py-1.5 text-xs text-rose-200 transition hover:bg-rose-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}