"use client";

import { useEffect, useState } from "react";
import { getProfilePicture, saveProfilePicture, type ProfilePicture } from "@/lib/localData";

export default function SettingsPage() {
  const [profilePic, setProfilePic] = useState<ProfilePicture | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const existing = getProfilePicture();
    if (existing) {
      setProfilePic(existing);
      setPreviewUrl(existing.dataUrl);
    }
  }, []);

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreviewUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function handleUpload() {
    if (!previewUrl) return;
    setSaving(true);
    // Simulate a brief save
    setTimeout(() => {
      saveProfilePicture({ dataUrl: previewUrl, name: "uploaded" });
      setProfilePic({ dataUrl: previewUrl, name: "uploaded" });
      setSaving(false);
    }, 300);
  }

  function handleRemove() {
    saveProfilePicture({ dataUrl: "", name: "" });
    setProfilePic(null);
    setPreviewUrl(null);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">Settings</h1>
        <p className="mt-1 text-sm text-stone-400">Manage your profile and preferences.</p>
      </div>

      {/* Profile Picture */}
      <section className="rounded-[2rem] border border-white/10 bg-black/20 p-8">
        <h2 className="text-lg font-semibold text-white">Profile Picture</h2>
        <p className="mt-1 text-sm text-stone-400">
          Upload a photo that will appear at the top of the sidebar and on your profile card.
        </p>

        <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
          {/* Preview */}
          <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/10 bg-[#2a241a]">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-amber-200">HP</span>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="cursor-pointer rounded-full border border-white/10 px-6 py-3 text-sm text-stone-300 transition hover:bg-white/5">
              Choose image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelected}
              />
            </label>

            {previewUrl && (
              <div className="flex gap-2">
                <button
                  onClick={handleUpload}
                  disabled={saving}
                  className="rounded-full bg-amber-200 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-100 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Upload profile picture"}
                </button>
                <button
                  onClick={handleRemove}
                  className="rounded-full border border-rose-300/20 px-6 py-3 text-sm text-rose-200 transition hover:bg-rose-500/10"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {profilePic && (
          <p className="mt-4 text-xs text-emerald-300">
            ✓ Profile picture uploaded
          </p>
        )}
      </section>

      {/* Account Info */}
      <section className="rounded-[2rem] border border-white/10 bg-black/20 p-8">
        <h2 className="text-lg font-semibold text-white">Account</h2>
        <p className="mt-1 text-sm text-stone-400">
          Signed in as <strong className="text-stone-200">Zola Mzozoyana</strong>
        </p>
        <p className="mt-1 text-sm text-stone-500">Username: ZolaMzozoyana1970</p>
      </section>
    </div>
  );
}