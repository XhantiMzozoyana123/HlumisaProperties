"use client";

import { useEffect, useState } from "react";
import { fetchLeads, updateLeadContacted, type Lead, formatDate } from "@/lib/api";
import RequireZola from "@/components/RequireZola";

export default function LeadsPage() {
  return (
    <RequireZola>
      <LeadsContent />
    </RequireZola>
  );
}

function LeadsContent() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchLeads();
        if (active) setLeads(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load leads.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, []);

  async function handleToggleContacted(lead: Lead) {
    setTogglingId(lead.id);
    try {
      const updated = await updateLeadContacted(lead.id, !lead.isContacted);
      setLeads((current) =>
        current.map((l) => (l.id === updated.id ? { ...l, isContacted: updated.isContacted } : l))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update lead.");
    } finally {
      setTogglingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p className="text-sm text-stone-400">Loading leads…</p>
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
      <div>
        <h1 className="text-3xl font-semibold text-white">Leads</h1>
        <p className="mt-1 text-sm text-stone-400">
          {leads.length} total lead{leads.length !== 1 ? "s" : ""} captured via referrals.
        </p>
      </div>

      {leads.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-sm text-stone-400">
          No leads have been captured yet.
        </div>
      )}

      <div className="space-y-3">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-base font-semibold text-white">
                  {lead.firstName} {lead.lastName}
                </p>
                <p className="text-sm text-stone-300">{lead.emailAddress}</p>
                <p className="text-sm text-stone-400">{lead.phoneNumber}</p>
                {lead.createdAt && (
                  <p className="text-xs text-stone-500">Created {formatDate(lead.createdAt)}</p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    lead.isContacted
                      ? "bg-emerald-500/10 text-emerald-200"
                      : "bg-amber-500/10 text-amber-200"
                  }`}
                >
                  {lead.isContacted ? "Contacted" : "New"}
                </span>
                <button
                  onClick={() => handleToggleContacted(lead)}
                  disabled={togglingId === lead.id}
                  className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                    lead.isContacted
                      ? "border border-amber-200/30 text-amber-200 hover:bg-amber-200/10"
                      : "border border-emerald-200/30 text-emerald-200 hover:bg-emerald-200/10"
                  } disabled:opacity-50`}
                >
                  {togglingId === lead.id
                    ? "Updating…"
                    : lead.isContacted
                    ? "Mark as new"
                    : "Mark contacted"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}