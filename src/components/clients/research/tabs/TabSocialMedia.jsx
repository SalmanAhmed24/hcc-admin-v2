"use client";
/*
 * TabSocialMedia.jsx — Tab 2
 * Uses existing PATCH /api/clients/addResearchSocialMedia/:id endpoint
 * FILE LOCATION: src/components/research/tabs/TabSocialMedia.jsx
 */
import { useState, useEffect } from "react";
import DrawerShell, { SectionLabel, Field, Input } from "../../DrawerShell";
import apiClient from "@/lib/apiClient";
import { apiPath } from "@/utils/routes";

const PLATFORMS = [
  { key: "facebook",  label: "Facebook",    placeholder: "https://facebook.com/yourbusiness" },
  { key: "twitter",   label: "X / Twitter", placeholder: "https://x.com/yourbusiness" },
  { key: "linkedin",  label: "LinkedIn",    placeholder: "https://linkedin.com/company/yourbusiness" },
  { key: "instagram", label: "Instagram",   placeholder: "https://instagram.com/yourbusiness" },
  { key: "youtube",   label: "YouTube",     placeholder: "https://youtube.com/@yourbusiness" },
  { key: "tiktok",    label: "TikTok",      placeholder: "https://tiktok.com/@yourbusiness" },
  { key: "pinterest", label: "Pinterest",   placeholder: "https://pinterest.com/yourbusiness" },
  { key: "blueSky",   label: "Bluesky",     placeholder: "https://bsky.app/profile/yourbusiness" },
];

const EMPTY = Object.fromEntries(PLATFORMS.map((p) => [p.key, ""]));

export default function TabSocialMedia({ client, onSave, onSaveNext }) {
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    if (client?.socialMedia) setForm({ ...EMPTY, ...client.socialMedia });
  }, [client]);

  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSave = async (andNext = false) => {
    setSaving(true);
    try {
      await apiClient.patch(
        `${apiPath.prodPath}/api/clients/addResearchSocialMedia/${client._id}`,
        form
      );
      setLastSaved(new Date());
      if (andNext) await onSaveNext("social", form);
      else         await onSave("social", form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DrawerShell
      title="Social media presence"
      subtitle="Links to this company's social profiles"
      saving={saving}
      lastSaved={lastSaved}
      onSave={() => handleSave(false)}
      onSaveNext={() => handleSave(true)}
    >
      <SectionLabel>Social profiles</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {PLATFORMS.map(({ key, label, placeholder }) => (
          <Field key={key} label={label}>
            <Input value={form[key]} onChange={set(key)} placeholder={placeholder} type="url" />
          </Field>
        ))}
      </div>
    </DrawerShell>
  );
}