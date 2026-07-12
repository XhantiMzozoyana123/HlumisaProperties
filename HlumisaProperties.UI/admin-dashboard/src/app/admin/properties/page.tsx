"use client";

import { useEffect, useState } from "react";
import {
  fetchProperties,
  createProperty,
  deleteProperty,
  formatMoney,
} from "@/lib/api";
import Link from "next/link";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Awaited<ReturnType<typeof fetchProperties>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    sellerName: "",
    propertyType: "House",
    listingType: "Sale",
    location: "",
    bedrooms: 0,
    bathrooms: 0,
  });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProperties();
        if (active) setProperties(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load properties.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const newProp = await createProperty({
        ...form,
        price: Number(form.price),
        images: ["[]"],
        dateAdded: new Date().toISOString().split("T")[0],
        status: "on-market",
        isAvailable: true,
        location: form.location,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
      });
      setProperties((current) => [...current, newProp]);
      setForm({
        title: "", description: "", price: "", sellerName: "",
        propertyType: "House", listingType: "Sale", location: "",
        bedrooms: 0, bathrooms: 0,
      });
      setShowForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create property.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this property listing?")) return;
    try {
      await deleteProperty(id);
      setProperties((current) => current.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete property.");
    }
  }

  const filteredProperties = filter === "all" ? properties : properties.filter((p) => p.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p className="text-sm text-stone-400">Loading properties…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 p-6 text-sm text-rose-100">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Properties</h1>
          <p className="mt-1 text-sm text-stone-400">
            {properties.length} listing{properties.length !== 1 ? "s" : ""} in the database.
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
        {["all", "on-market", "under-offer", "sold"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition ${
              filter === f
                ? "bg-white/10 text-white"
                : "text-stone-500 hover:text-stone-300"
            }`}
          >
            {f === "all" ? "All" : f === "on-market" ? "On Market" : f === "under-offer" ? "Under Offer" : "Sold"}
          </button>
        ))}
      </div>

      {/* Add property form */}
      {showForm && (
        <div className="backdrop-card rounded-[2rem] p-6">
          <h2 className="text-lg font-semibold text-white">New property listing</h2>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <input className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500" placeholder="Property title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
            <input className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500" placeholder="Seller name" value={form.sellerName} onChange={(e) => setForm((f) => ({ ...f, sellerName: e.target.value }))} required />
            <input className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500" placeholder="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} required />
            <textarea className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />
            <input className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500" placeholder="Price (ZAR)" type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
            <div className="flex gap-4">
              <select className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none" value={form.propertyType} onChange={(e) => setForm((f) => ({ ...f, propertyType: e.target.value }))}>
                <option>House</option><option>Apartment</option><option>Townhouse</option><option>Land</option>
              </select>
              <select className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none" value={form.listingType} onChange={(e) => setForm((f) => ({ ...f, listingType: e.target.value }))}>
                <option>Sale</option><option>Rent</option>
              </select>
            </div>
            <div className="flex gap-4">
              <input className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500" placeholder="Bedrooms" type="number" value={form.bedrooms} onChange={(e) => setForm((f) => ({ ...f, bedrooms: Number(e.target.value) }))} />
              <input className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500" placeholder="Bathrooms" type="number" value={form.bathrooms} onChange={(e) => setForm((f) => ({ ...f, bathrooms: Number(e.target.value) }))} />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="rounded-full bg-amber-200 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-100">
                Create listing
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-white/10 px-6 py-3 text-sm text-stone-300 transition hover:bg-white/5">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Property list */}
      {filteredProperties.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-sm text-stone-400">
          No properties found. Click &ldquo;+ Add Property&rdquo; to create one.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-white">{property.title}</p>
                <p className="text-xs text-stone-400">
                  {property.status === "on-market" ? "On Market" : property.status === "under-offer" ? "Under Offer" : "Sold"}
                  {property.sellerName && ` · ${property.sellerName}`}
                </p>
                <p className="text-xs text-stone-500">{property.location}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-amber-200">{formatMoney(property.price)}</p>
                <button
                  onClick={() => handleDelete(property.id)}
                  className="rounded-full border border-rose-300/20 px-4 py-1.5 text-xs text-rose-200 transition hover:bg-rose-500/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}