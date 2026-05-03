"use client";
/*
 * TabLocalSeo.jsx — Tab 4
 * PATCH /:id/research/report/localseo
 * FILE LOCATION: src/components/research/tabs/TabLocalSeo.jsx
 */
import { useState, useEffect } from "react";
import DrawerShell, { SectionLabel, Field, Input, Toggle, MetricCard } from "../../DrawerShell";

const EMPTY = {
  napConsistency: false, localCitations: null,
  googleMapsRanking: null, localPackPresence: false,
  yelpPresence: false, yelpRating: null, yelpReviews: null,
  bbbListing: false, bbbRating: "",
};

export default function TabLocalSeo({ client, report, onSave, onSaveNext }) {
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    if (report?.localSeo) setForm({ ...EMPTY, ...report.localSeo });
  }, [report]);

  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSave = async (andNext = false) => {
    setSaving(true);
    try {
      if (andNext) await onSaveNext("localseo", form);
      else         await onSave("localseo", form);
      setLastSaved(new Date());
    } finally { setSaving(false); }
  };

  const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 };

  return (
    <DrawerShell
      title="Local SEO"
      subtitle="Citations, maps ranking, and directory presence"
      saving={saving}
      lastSaved={lastSaved}
      onSave={() => handleSave(false)}
      onSaveNext={() => handleSave(true)}
    >
      <SectionLabel>NAP &amp; citations</SectionLabel>
      <div style={{ marginBottom: 14 }}>
        <Toggle checked={form.napConsistency} onChange={set("napConsistency")} label="NAP consistent across all directories" />
      </div>
      <div style={grid2}>
        <MetricCard label="Local citation count"  value={form.localCitations}    onChange={set("localCitations")}    benchmark="50+" />
        <MetricCard label="Google Maps position"  value={form.googleMapsRanking} onChange={set("googleMapsRanking")} benchmark="Top 3" />
      </div>
      <div style={{ marginBottom: 20 }}>
        <Toggle checked={form.localPackPresence} onChange={set("localPackPresence")} label="Appears in Google Local Pack (map 3-pack)" />
      </div>

      <SectionLabel>Yelp</SectionLabel>
      <div style={{ marginBottom: 12 }}>
        <Toggle checked={form.yelpPresence} onChange={set("yelpPresence")} label="Has Yelp listing" />
      </div>
      <div style={grid2}>
        <MetricCard label="Yelp rating /5"    value={form.yelpRating}  onChange={set("yelpRating")}  benchmark="4.0+" />
        <MetricCard label="Yelp review count" value={form.yelpReviews} onChange={set("yelpReviews")} benchmark="20+" />
      </div>

      <SectionLabel>Better Business Bureau</SectionLabel>
      <div style={{ marginBottom: 12 }}>
        <Toggle checked={form.bbbListing} onChange={set("bbbListing")} label="Has BBB listing" />
      </div>
      {form.bbbListing && (
        <Field label="BBB rating (e.g. A+)">
          <Input value={form.bbbRating} onChange={set("bbbRating")} placeholder="A+" />
        </Field>
      )}
    </DrawerShell>
  );
}