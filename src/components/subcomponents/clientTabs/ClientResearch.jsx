"use client";

/**
 * ClientResearch.jsx
 * Read-only Research tab inside the clientOpen drawer.
 * Shows research data across 8 sub-tabs with action buttons
 * for Print, Export, Add Research, and Email Research.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Printer, Download, Edit3, Mail,
  Building2, Globe, BarChart3, MapPin, Key,
  Users2, Target, FileText, Check, Loader2,
  AlertCircle, ExternalLink, TrendingUp, TrendingDown, Minus, Sparkles,
} from "lucide-react";
import apiClient from "@/lib/apiClient";
import { CLIENT_ROUTES } from "@/utils/routes";
import { apiPath } from "@/utils/routes";
import axios from "axios";
import useAuthStore from "@/store/store";
import Swal from "sweetalert2";
import ResearchDrawer from "@/components/clients/ResearchDrawer";
import ResearchEmailDrawer from "@/components/clients/research/ResearchEmailDrawer";

// ─────────────────────────────────────────────────────────────────────────────
// SUB-TAB CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const SUB_TABS = [
  { id: "company",     label: "Company Info",  icon: Building2 },
  { id: "social",      label: "Social Media",  icon: Globe },
  { id: "seo",         label: "SEO Metrics",   icon: BarChart3 },
  { id: "localseo",    label: "Local SEO",     icon: MapPin },
  { id: "geousability",label: "GEO & Usability",icon: Sparkles },
  { id: "keywords",    label: "Keywords",      icon: Key },
  { id: "competitors", label: "Competitors",   icon: Users2 },
  { id: "opportunity", label: "Opportunity",   icon: Target },
  { id: "summary",     label: "Summary",       icon: FileText },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function fmt(n) {
  if (n == null || n === "") return "—";
  const num = Number(n);
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toLocaleString();
}

function pct(val, max) {
  if (!val || !max) return 0;
  return Math.min(Math.round((val / max) * 100), 100);
}

function hasData(report, client, tabId) {
  if (!report) return false;
  switch (tabId) {
    case "company":     return !!(client?.industry || client?.companyName);
    case "social":      return !!(client?.socialMedia && Object.values(client.socialMedia).some(v => v));
    case "seo":         return report?.seoMetrics?.authorityScore != null;
    case "localseo":    return report?.localSeo?.napConsistency != null;
    case "geousability": return report?.geoUsability?.geoOverallScore != null;
    case "keywords":    return (report?.topKeywords?.length || 0) > 0;
    case "competitors": return (report?.competitors?.length || 0) > 0;
    case "opportunity": return report?.opportunityScore?.overallScore != null;
    case "summary":     return !!report?.executiveSummary;
    default: return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const cardStyle = {
  background: "rgba(20,15,43,0.5)",
  border: "1px solid rgba(127,86,217,0.2)",
  borderRadius: 14,
  padding: 18,
};

const metricTileStyle = {
  ...cardStyle,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const labelStyle = {
  fontSize: 10.5,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: "#6B5F8A",
  fontWeight: 600,
};

const valueStyle = {
  fontSize: 28,
  fontWeight: 700,
  color: "#fff",
  lineHeight: 1,
  letterSpacing: "-0.02em",
};

const ghostBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "9px 14px",
  borderRadius: 10,
  fontSize: 12.5,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.15s",
  border: "1px solid rgba(127,86,217,0.3)",
  background: "rgba(127,86,217,0.08)",
  color: "#B797FF",
};

const primaryBtn = {
  ...ghostBtn,
  background: "linear-gradient(180deg, #9B74F0, #6B42C8)",
  borderColor: "rgba(127,86,217,0.6)",
  color: "#fff",
  boxShadow: "0 6px 20px -8px rgba(127,86,217,0.6)",
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION RENDERERS
// ─────────────────────────────────────────────────────────────────────────────

function SectionCompanyInfo({ client }) {
  const fields = [
    { label: "Company Name", value: client?.clientName || client?.companyName },
    { label: "Industry", value: client?.industry },
    { label: "Website", value: client?.websiteAddress },
    { label: "Email", value: client?.email },
    { label: "Phone", value: client?.phone },
    { label: "City", value: client?.city },
    { label: "State", value: client?.state },
    { label: "Current DM", value: client?.currentDM },
    { label: "Lead Qualification", value: client?.leadQualification },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
      {fields.map(({ label, value }) => (
        <div key={label} style={cardStyle}>
          <div style={labelStyle}>{label}</div>
          <div style={{ fontSize: 14, color: "#fff", marginTop: 6 }}>{value || "—"}</div>
        </div>
      ))}
      {client?.servicesOffered?.length > 0 && (
        <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
          <div style={labelStyle}>Services Offered</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {client.servicesOffered.map((s, i) => (
              <span key={i} style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(127,86,217,0.15)", border: "1px solid rgba(127,86,217,0.3)", color: "#B797FF", fontSize: 11.5, fontWeight: 500 }}>{typeof s === "object" ? (s.serviceName || s.serviceType || "—") : s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionSocialMedia({ client }) {
  const sm = client?.socialMedia || {};
  const fields = [
    { label: "Facebook", value: sm.facebook },
    { label: "Instagram", value: sm.instagram },
    { label: "Twitter/X", value: sm.twitter },
    { label: "LinkedIn", value: sm.linkedIn },
    { label: "YouTube", value: sm.youtube },
    { label: "TikTok", value: sm.tiktok },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {fields.map(({ label, value }) => (
        <div key={label} style={cardStyle}>
          <div style={labelStyle}>{label}</div>
          <div style={{ fontSize: 13, color: value ? "#B797FF" : "#6B5F8A", marginTop: 6, wordBreak: "break-all" }}>
            {value ? (
              <a href={value.startsWith("http") ? value : `https://${value}`} target="_blank" rel="noreferrer" style={{ color: "#B797FF", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                {value} <ExternalLink size={11} />
              </a>
            ) : "Not provided"}
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionSeoMetrics({ report, client }) {
  const seo = report?.seoMetrics || {};
  const competitors = report?.competitors || [];
  const opp = report?.opportunityScore || {};

  const TrendIcon = ({ val }) => {
    if (!val) return <span style={{ color: "#6B5F8A", fontSize: 11 }}>—</span>;
    if (val > 0) return <span style={{ color: "#86EFAC", fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}><TrendingUp size={12} /> +{val}%</span>;
    if (val < 0) return <span style={{ color: "#FCA5A5", fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}><TrendingDown size={12} /> {val}%</span>;
    return <span style={{ color: "#6B5F8A", fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}><Minus size={12} /> flat</span>;
  };

  const maxAuth = Math.max(seo.authorityScore || 0, ...competitors.map(c => c.authorityScore || 0), 100);

  return (
    <div>
      {/* Metric tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        <div style={{ ...metricTileStyle, background: "linear-gradient(135deg, rgba(127,86,217,0.2), rgba(127,86,217,0.05))", border: "1px solid rgba(127,86,217,0.3)" }}>
          <div style={labelStyle}>Authority Score</div>
          <div style={{ ...valueStyle, color: "#B797FF" }}>{seo.authorityScore ?? "—"}</div>
        </div>
        <div style={metricTileStyle}>
          <div style={labelStyle}>Organic Traffic</div>
          <div style={valueStyle}>{fmt(seo.organicTraffic)}</div>
        </div>
        <div style={metricTileStyle}>
          <div style={labelStyle}>Ranked Keywords</div>
          <div style={valueStyle}>{fmt(seo.organicKeywords)}</div>
        </div>
        <div style={metricTileStyle}>
          <div style={labelStyle}>Backlinks</div>
          <div style={valueStyle}>{fmt(seo.backlinks)}</div>
        </div>
      </div>

      {/* Two-column: Competitor table + Opportunity rail */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Competitor comparison table */}
        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px", padding: "12px 18px", background: "rgba(127,86,217,0.06)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6B5F8A", fontWeight: 600 }}>
            <div>Domain</div>
            <div style={{ textAlign: "right" }}>Authority</div>
            <div style={{ textAlign: "right" }}>Traffic</div>
            <div style={{ textAlign: "right" }}>Keywords</div>
          </div>
          {/* Client row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px", padding: "14px 18px", background: "rgba(127,86,217,0.12)", boxShadow: "inset 3px 0 0 #B797FF", borderBottom: "1px solid rgba(127,86,217,0.12)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #B797FF, #6B42C8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                {(client?.clientName || "?").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{client?.websiteAddress || client?.clientName || "—"}</div>
                <div style={{ fontSize: 11, color: "#6B5F8A" }}>You</div>
              </div>
            </div>
            <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 13, color: "#fff", fontWeight: 600 }}>{seo.authorityScore ?? "—"}</div>
            <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 13, color: "#fff", fontWeight: 600 }}>{fmt(seo.organicTraffic)}</div>
            <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 13, color: "#fff", fontWeight: 600 }}>{fmt(seo.organicKeywords)}</div>
          </div>
          {/* Competitor rows */}
          {competitors.map((comp, i) => {
            const colors = ["linear-gradient(135deg, #F472B6, #BE185D)", "linear-gradient(135deg, #34D399, #047857)", "linear-gradient(135deg, #FB923C, #C2410C)"];
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px", padding: "14px 18px", borderBottom: i < competitors.length - 1 ? "1px solid rgba(127,86,217,0.12)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: colors[i % 3], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                    {(comp.name || "?").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{comp.website || comp.name}</div>
                    <div style={{ fontSize: 11, color: "#6B5F8A" }}>Competitor #{i + 1}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 13, color: "#fff", fontWeight: 600 }}>{comp.authorityScore ?? "—"}</div>
                <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 13, color: "#fff", fontWeight: 600 }}>{fmt(comp.organicTraffic)}</div>
                <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 13, color: "#fff", fontWeight: 600 }}>{fmt(comp.organicKeywords || comp.referringDomains)}</div>
              </div>
            );
          })}
        </div>

        {/* Right rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Opportunity score */}
          <div style={cardStyle}>
            <div style={{ ...labelStyle, marginBottom: 8 }}>Opportunity Score</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 44, fontWeight: 700, color: "#FCD34D", letterSpacing: "-0.02em", lineHeight: 1 }}>{opp.overallScore ?? "—"}</span>
              <span style={{ fontSize: 16, color: "#6B5F8A" }}>/ 100</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "rgba(127,86,217,0.15)", margin: "12px 0 6px", overflow: "hidden" }}>
              <div style={{ width: `${opp.overallScore || 0}%`, height: "100%", background: "linear-gradient(to right, #FCD34D, #F59E0B)", borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 11.5, color: "#6B5F8A", lineHeight: 1.5 }}>
              <span style={{ color: "#FCD34D", fontWeight: 600 }}>
                {(opp.overallScore || 0) >= 70 ? "High" : (opp.overallScore || 0) >= 40 ? "Medium" : "Low"}
              </span> opportunity — {(opp.overallScore || 0) >= 70 ? "strong outreach hook" : "room for growth"}
            </div>
          </div>

          {/* Key findings */}
          {competitors.length > 0 && seo.authorityScore != null && (
            <div style={cardStyle}>
              <div style={{ ...labelStyle, marginBottom: 10 }}>Key Findings</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {competitors[0] && (competitors[0].authorityScore || 0) > (seo.authorityScore || 0) && (
                  <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(20,15,43,0.5)", borderLeft: "3px solid #F87171", fontSize: 12, color: "#A99BD4", lineHeight: 1.5 }}>
                    <strong style={{ color: "#fff" }}>Authority gap:</strong> {(competitors[0].authorityScore || 0) - (seo.authorityScore || 0)} points below #{1} ({competitors[0].name})
                  </div>
                )}
                {seo.organicKeywords != null && (
                  <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(20,15,43,0.5)", borderLeft: "3px solid #FCD34D", fontSize: 12, color: "#A99BD4", lineHeight: 1.5 }}>
                    <strong style={{ color: "#fff" }}>Keywords:</strong> {fmt(seo.organicKeywords)} ranked keywords
                  </div>
                )}
                {seo.backlinks != null && (
                  <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(20,15,43,0.5)", borderLeft: "3px solid #86EFAC", fontSize: 12, color: "#A99BD4", lineHeight: 1.5 }}>
                    <strong style={{ color: "#fff" }}>Backlinks:</strong> {fmt(seo.backlinks)} total backlinks
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionLocalSeo({ report }) {
  const ls = report?.localSeo || {};
  const boolFields = [
    { label: "NAP Consistency", value: ls.napConsistency },
    { label: "Local Pack Presence", value: ls.localPackPresence },
    { label: "Yelp Presence", value: ls.yelpPresence },
    { label: "BBB Listing", value: ls.bbbListing },
  ];
  const numFields = [
    { label: "Local Citations", value: ls.localCitations },
    { label: "Google Maps Ranking", value: ls.googleMapsRanking },
    { label: "Yelp Rating", value: ls.yelpRating },
    { label: "Yelp Reviews", value: ls.yelpReviews },
    { label: "BBB Rating", value: ls.bbbRating },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {boolFields.map(({ label, value }) => (
        <div key={label} style={cardStyle}>
          <div style={labelStyle}>{label}</div>
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
            {value === true ? <Check size={14} style={{ color: "#4ADE80" }} /> : value === false ? <AlertCircle size={14} style={{ color: "#F87171" }} /> : null}
            <span style={{ fontSize: 14, color: "#fff" }}>{value == null ? "—" : value ? "Yes" : "No"}</span>
          </div>
        </div>
      ))}
      {numFields.map(({ label, value }) => (
        <div key={label} style={cardStyle}>
          <div style={labelStyle}>{label}</div>
          <div style={{ ...valueStyle, fontSize: 22, marginTop: 6 }}>{value ?? "—"}</div>
        </div>
      ))}
    </div>
  );
}

// ── GEO & Usability (read-only view) ────────────────────────────────────────
// Shows GEO (AI search visibility) and Usability metrics with overall score badges
function SectionGeoUsability({ report }) {
  const gu = report?.geoUsability || {};

  // Grade badge color helper
  const gradeColor = (grade) => {
    if (!grade) return "#6B5F8A";
    if (grade === "A" || grade === "B") return "#4ADE80";
    if (grade === "C+" || grade === "C") return "#FCD34D";
    return "#F87171";
  };

  const geoFields = [
    { label: "AI Visibility Score", value: gu.aiVisibilityScore, suffix: "/100" },
    { label: "Structured Data Score", value: gu.structuredDataScore, suffix: "/100" },
    { label: "Content E-E-A-T Score", value: gu.contentEeatScore, suffix: "/100" },
    { label: "AI Citation Count", value: gu.aiCitationCount },
    { label: "Chatbot Mentions", value: gu.chatbotMentions },
  ];
  const geoBools = [
    { label: "AI Overview Presence", value: gu.aiOverviewPresence },
  ];
  const usabFields = [
    { label: "Mobile Usability", value: gu.mobileUsabilityScore, suffix: "/100" },
    { label: "Navigation Score", value: gu.navigationScore, suffix: "/100" },
    { label: "Accessibility Score", value: gu.accessibilityScore, suffix: "/100" },
    { label: "Form / CTA Usability", value: gu.formUsability, suffix: "/100" },
    { label: "Readability Score", value: gu.readabilityScore, suffix: "/100" },
  ];
  const usabBools = [
    { label: "Responsive Design", value: gu.responsiveDesign },
  ];

  return (
    <div>
      {/* Overall score badges */}
      {(gu.geoOverallScore != null || gu.usabilityOverallScore != null) && (
        <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
          {gu.geoOverallScore != null && (
            <div style={{ ...cardStyle, flex: 1, display: "flex", alignItems: "center", gap: 14, background: "linear-gradient(135deg, rgba(127,86,217,0.15), rgba(127,86,217,0.05))" }}>
              <span style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg, #7C3AED, #6D28D9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 18 }}>{gu.geoGrade}</span>
              <div>
                <div style={labelStyle}>GEO Score</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: gradeColor(gu.geoGrade), lineHeight: 1 }}>{gu.geoOverallScore}<span style={{ fontSize: 14, color: "#6B5F8A" }}>/100</span></div>
              </div>
            </div>
          )}
          {gu.usabilityOverallScore != null && (
            <div style={{ ...cardStyle, flex: 1, display: "flex", alignItems: "center", gap: 14, background: "linear-gradient(135deg, rgba(127,86,217,0.15), rgba(127,86,217,0.05))" }}>
              <span style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg, #7C3AED, #6D28D9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 18 }}>{gu.usabilityGrade}</span>
              <div>
                <div style={labelStyle}>Usability Score</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: gradeColor(gu.usabilityGrade), lineHeight: 1 }}>{gu.usabilityOverallScore}<span style={{ fontSize: 14, color: "#6B5F8A" }}>/100</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* GEO section */}
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#B797FF", fontWeight: 600, marginBottom: 10 }}>GEO — AI Search Visibility</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
        {geoBools.map(({ label, value }) => (
          <div key={label} style={cardStyle}>
            <div style={labelStyle}>{label}</div>
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
              {value === true ? <Check size={14} style={{ color: "#4ADE80" }} /> : value === false ? <AlertCircle size={14} style={{ color: "#F87171" }} /> : null}
              <span style={{ fontSize: 14, color: "#fff" }}>{value == null ? "—" : value ? "Yes" : "No"}</span>
            </div>
          </div>
        ))}
        {geoFields.map(({ label, value, suffix }) => (
          <div key={label} style={metricTileStyle}>
            <div style={labelStyle}>{label}</div>
            <div style={valueStyle}>{value != null ? `${fmt(value)}${suffix || ""}` : "—"}</div>
          </div>
        ))}
      </div>

      {/* Usability section */}
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#B797FF", fontWeight: 600, marginBottom: 10 }}>Usability</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {usabBools.map(({ label, value }) => (
          <div key={label} style={cardStyle}>
            <div style={labelStyle}>{label}</div>
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
              {value === true ? <Check size={14} style={{ color: "#4ADE80" }} /> : value === false ? <AlertCircle size={14} style={{ color: "#F87171" }} /> : null}
              <span style={{ fontSize: 14, color: "#fff" }}>{value == null ? "—" : value ? "Yes" : "No"}</span>
            </div>
          </div>
        ))}
        {usabFields.map(({ label, value, suffix }) => (
          <div key={label} style={metricTileStyle}>
            <div style={labelStyle}>{label}</div>
            <div style={valueStyle}>{value != null ? `${fmt(value)}${suffix || ""}` : "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionKeywords({ report }) {
  const keywords = report?.topKeywords || [];
  if (!keywords.length) return <div style={{ color: "#6B5F8A", fontSize: 13, textAlign: "center", padding: 40 }}>No keywords recorded yet.</div>;

  const trendColors = { up: "#86EFAC", down: "#FCA5A5", stable: "#6B5F8A" };
  const TrendIcon = ({ trend }) => {
    if (trend === "up") return <TrendingUp size={12} style={{ color: trendColors.up }} />;
    if (trend === "down") return <TrendingDown size={12} style={{ color: trendColors.down }} />;
    return <Minus size={12} style={{ color: trendColors.stable }} />;
  };

  return (
    <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 80px 100px 80px 60px", padding: "12px 18px", background: "rgba(127,86,217,0.06)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6B5F8A", fontWeight: 600 }}>
        <div>Keyword</div>
        <div style={{ textAlign: "right" }}>Position</div>
        <div style={{ textAlign: "right" }}>Search Volume</div>
        <div style={{ textAlign: "right" }}>Difficulty</div>
        <div style={{ textAlign: "center" }}>Trend</div>
      </div>
      {keywords.map((kw, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 80px 100px 80px 60px", padding: "12px 18px", borderTop: "1px solid rgba(127,86,217,0.12)" }}>
          <div style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>{kw.keyword}</div>
          <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 13, color: "#fff" }}>{kw.position ?? "—"}</div>
          <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 13, color: "#fff" }}>{fmt(kw.searchVolume)}</div>
          <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 13, color: "#fff" }}>{kw.difficulty ?? "—"}</div>
          <div style={{ textAlign: "center" }}><TrendIcon trend={kw.trend} /></div>
        </div>
      ))}
    </div>
  );
}

function SectionCompetitors({ report, client }) {
  const competitors = report?.competitors || [];
  if (!competitors.length) return <div style={{ color: "#6B5F8A", fontSize: 13, textAlign: "center", padding: 40 }}>No competitors recorded yet.</div>;

  const ratingColors = { green: "#4ADE80", yellow: "#FCD34D", red: "#F87171", gray: "#6B5F8A" };
  const ratingBg = { green: "rgba(74,222,128,0.1)", yellow: "rgba(252,211,77,0.1)", red: "rgba(248,113,113,0.1)", gray: "rgba(107,95,138,0.1)" };
  const colors = ["linear-gradient(135deg, #F472B6, #BE185D)", "linear-gradient(135deg, #34D399, #047857)", "linear-gradient(135deg, #FB923C, #C2410C)", "linear-gradient(135deg, #60A5FA, #1D4ED8)"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {competitors.map((comp, i) => (
        <div key={i} style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: colors[i % 4], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              {(comp.name || "?").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{comp.name}</div>
              <div style={{ fontSize: 12, color: "#6B5F8A" }}>{comp.website || "—"}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 12 }}>
            {[
              { label: "Authority", val: comp.authorityScore, rKey: "authorityScore" },
              { label: "Traffic", val: comp.organicTraffic, rKey: "traffic" },
              { label: "Mobile Spd", val: comp.speedMobile, rKey: "speedMobile" },
              { label: "GMB Reviews", val: comp.gmbReviews, rKey: "gmbReviews" },
            ].map(({ label, val, rKey }) => {
              const rating = comp.ratings?.[rKey] || "gray";
              return (
                <div key={label} style={{ textAlign: "center", padding: 8, borderRadius: 10, background: ratingBg[rating] }}>
                  <div style={{ fontSize: 10, color: "#6B5F8A", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: ratingColors[rating] }}>{val ?? "—"}</div>
                </div>
              );
            })}
          </div>
          {comp.seoInsights && (
            <div style={{ fontSize: 12, color: "#A99BD4", lineHeight: 1.5, marginTop: 8, padding: "8px 10px", background: "rgba(20,15,43,0.5)", borderRadius: 8 }}>
              <strong style={{ color: "#fff" }}>Insights:</strong> {comp.seoInsights}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SectionOpportunity({ report }) {
  const opp = report?.opportunityScore || {};
  const scores = opp.scores || {};
  const actions = opp.priorityActions || [];
  const services = opp.recommendedServices || [];

  const scoreColor = (n) => n >= 70 ? "#4ADE80" : n >= 40 ? "#FCD34D" : "#F87171";

  return (
    <div>
      {/* Overall + sub-scores */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20, marginBottom: 24 }}>
        <div style={{ ...cardStyle, textAlign: "center" }}>
          <div style={labelStyle}>Overall Score</div>
          <div style={{ fontSize: 56, fontWeight: 700, color: "#FCD34D", lineHeight: 1, marginTop: 8 }}>{opp.overallScore ?? "—"}</div>
          {opp.grade && <div style={{ marginTop: 6, fontSize: 14, fontWeight: 600, color: "#B797FF" }}>Grade: {opp.grade}</div>}
        </div>
        <div style={cardStyle}>
          <div style={{ ...labelStyle, marginBottom: 14 }}>Sub-Scores</div>
          {Object.entries(scores).map(([key, val]) => (
            <div key={key} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#A99BD4", textTransform: "capitalize" }}>{key}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: val != null ? scoreColor(val) : "#6B5F8A" }}>{val ?? "—"}</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ width: `${val || 0}%`, height: "100%", background: val != null ? scoreColor(val) : "transparent", borderRadius: 99, transition: "width 0.3s" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Actions */}
      {actions.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...labelStyle, marginBottom: 12 }}>Priority Actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {actions.map((a, i) => (
              <div key={i} style={{ ...cardStyle, display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(127,86,217,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B797FF", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{a.rank || i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{a.finding || a.action}</div>
                  {a.action && a.finding && <div style={{ fontSize: 12, color: "#A99BD4", marginTop: 2 }}>{a.action}</div>}
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    {a.category && <span style={{ padding: "2px 8px", borderRadius: 999, background: "rgba(127,86,217,0.15)", color: "#B797FF", fontSize: 10, fontWeight: 500 }}>{a.category}</span>}
                    {a.effort && <span style={{ padding: "2px 8px", borderRadius: 999, background: "rgba(252,211,77,0.1)", color: "#FCD34D", fontSize: 10, fontWeight: 500 }}>{a.effort}</span>}
                    {a.estimatedImpact && <span style={{ padding: "2px 8px", borderRadius: 999, background: "rgba(74,222,128,0.1)", color: "#86EFAC", fontSize: 10, fontWeight: 500 }}>{a.estimatedImpact}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended services */}
      {services.length > 0 && (
        <div>
          <div style={{ ...labelStyle, marginBottom: 12 }}>Recommended Services</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {services.map((s, i) => (
              <div key={i} style={cardStyle}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{s.service}</div>
                <div style={{ fontSize: 12, color: "#A99BD4", marginTop: 4 }}>{s.reason}</div>
                {s.priority && <span style={{ display: "inline-block", marginTop: 6, padding: "2px 8px", borderRadius: 999, background: s.priority === "immediate" ? "rgba(248,113,113,0.1)" : "rgba(127,86,217,0.1)", color: s.priority === "immediate" ? "#F87171" : "#B797FF", fontSize: 10, fontWeight: 500 }}>{s.priority}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionSummary({ report }) {
  return (
    <div>
      <div style={{ ...cardStyle, marginBottom: 14 }}>
        <div style={{ ...labelStyle, marginBottom: 10 }}>Executive Summary</div>
        <div style={{ fontSize: 14, color: "#E1C9FF", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
          {report?.executiveSummary || <span style={{ color: "#6B5F8A" }}>No executive summary written yet.</span>}
        </div>
      </div>
      {report?.aiNotes && (
        <div style={cardStyle}>
          <div style={{ ...labelStyle, marginBottom: 10 }}>AI Notes</div>
          <div style={{ fontSize: 13, color: "#A99BD4", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{report.aiNotes}</div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ClientResearch({ item, open }) {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState("seo");

  // Drawer states
  const [researchDrawerOpen, setResearchDrawerOpen] = useState(false);
  const [emailDrawerOpen, setEmailDrawerOpen] = useState(false);

  // Fetch research data
  const fetchResearch = useCallback(async () => {
    if (!item?._id) return;
    setLoading(true);
    try {
      const res = await apiClient.get(CLIENT_ROUTES.researchReport(item._id));
      setReport(res.data?.report || null);
      setClientData(res.data?.client || null);
    } catch (err) {
      console.error("Failed to load research:", err);
      setReport(null);
      setClientData(null);
    } finally {
      setLoading(false);
    }
  }, [item?._id]);

  useEffect(() => {
    if (open && item?._id) fetchResearch();
  }, [open, item?._id, fetchResearch]);

  // Action handlers
  const handlePrint = () => window.print();

  const handleExport = async () => {
    try {
      const response = await apiClient.get(CLIENT_ROUTES.researchReportExport(item._id), { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `SEO_Report_${clientData?.clientName || item?.clientName || "client"}_${Date.now()}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      Swal.fire({ icon: "success", text: "Report exported successfully", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message || "Failed to export report", "error");
    }
  };

  const handleAddResearch = () => setResearchDrawerOpen(true);
  const handleEmailResearch = () => setEmailDrawerOpen(true);

  // Status info
  const status = report?.status || "none";
  const generatedBy = report?.generatedBy?.name || "—";
  const generatedAt = report?.generatedAt ? new Date(report.generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
  const version = report?.reportVersion || 0;

  // Render section content
  const renderSection = () => {
    const c = clientData || item;
    switch (activeSubTab) {
      case "company":     return <SectionCompanyInfo client={c} />;
      case "social":      return <SectionSocialMedia client={c} />;
      case "seo":         return <SectionSeoMetrics report={report} client={c} />;
      case "localseo":    return <SectionLocalSeo report={report} />;
      case "geousability": return <SectionGeoUsability report={report} />;
      case "keywords":    return <SectionKeywords report={report} />;
      case "competitors": return <SectionCompetitors report={report} client={c} />;
      case "opportunity": return <SectionOpportunity report={report} />;
      case "summary":     return <SectionSummary report={report} />;
      default:            return null;
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, color: "#6B5F8A" }}>
        <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ marginLeft: 10, fontSize: 13 }}>Loading research data...</span>
      </div>
    );
  }

  return (
    <>
      <div style={{ padding: "0 0 24px" }}>
        {/* Status bar + Action buttons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 0 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 14px", borderRadius: 999,
              background: status === "complete" || status === "exported" ? "rgba(74,222,128,0.12)" : status === "draft" ? "rgba(96,165,250,0.12)" : "rgba(107,95,138,0.12)",
              border: `1px solid ${status === "complete" || status === "exported" ? "rgba(74,222,128,0.35)" : status === "draft" ? "rgba(96,165,250,0.35)" : "rgba(107,95,138,0.35)"}`,
              color: status === "complete" || status === "exported" ? "#86EFAC" : status === "draft" ? "#93C5FD" : "#6B5F8A",
              fontSize: 12, fontWeight: 500,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: "currentColor" }} />
              {status === "complete" || status === "exported" ? "Research complete" : status === "draft" ? "Draft in progress" : "No research"}
            </span>
            {status !== "none" && (
              <span style={{ fontSize: 12, color: "#6B5F8A" }}>
                {status === "complete" || status === "exported" ? "Completed" : "Drafted"} by <strong style={{ color: "#A99BD4" }}>{generatedBy}</strong> · {generatedAt}
                {version > 0 && <> · <strong style={{ color: "#A99BD4" }}>v{version}</strong></>}
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button style={ghostBtn} onClick={handlePrint}><Printer size={14} /> Print</button>
            <button style={ghostBtn} onClick={handleExport} disabled={!report}><Download size={14} /> Export</button>
            <button style={ghostBtn} onClick={handleAddResearch}><Edit3 size={14} /> Add Research</button>
            <button style={primaryBtn} onClick={handleEmailResearch} disabled={!report}>
              <Mail size={14} /> Email Research
            </button>
          </div>
        </div>

        {/* Sub-tab strip */}
        <div style={{ display: "flex", gap: 4, paddingBottom: 16, borderBottom: "1px solid rgba(127,86,217,0.12)", overflowX: "auto" }}>
          {SUB_TABS.map(({ id, label, icon: Icon }) => {
            const active = activeSubTab === id;
            const filled = hasData(report, clientData || item, id);
            return (
              <button
                key={id}
                onClick={() => setActiveSubTab(id)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 12px", borderRadius: 10,
                  background: active ? "rgba(127,86,217,0.2)" : "transparent",
                  border: active ? "1px solid #B797FF" : "1px solid transparent",
                  cursor: "pointer", transition: "all 0.15s",
                  fontSize: 12.5, fontWeight: active ? 600 : 500,
                  color: active ? "#fff" : "#6B5F8A",
                  whiteSpace: "nowrap",
                }}
              >
                {filled ? <Check size={13} style={{ color: "#4ADE80" }} /> : <Icon size={13} style={{ opacity: 0.5 }} />}
                {label}
              </button>
            );
          })}
        </div>

        {/* Section content */}
        <div style={{ paddingTop: 24 }}>
          {report ? renderSection() : (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#6B5F8A" }}>
              <AlertCircle size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>No research data yet</div>
              <div style={{ fontSize: 13, maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>
                Click "Add Research" to start capturing data for this client.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Research Drawer (for Add Research) */}
      <ResearchDrawer
        open={researchDrawerOpen}
        onOpenChange={setResearchDrawerOpen}
        client={item}
        onSuccess={() => { setResearchDrawerOpen(false); fetchResearch(); }}
      />

      {/* Email Research Drawer */}
      <ResearchEmailDrawer
        open={emailDrawerOpen}
        onClose={() => setEmailDrawerOpen(false)}
        client={clientData || item}
        researchData={report}
      />

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}