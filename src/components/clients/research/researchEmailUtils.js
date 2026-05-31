/**
 * researchEmailUtils.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared utilities for building template merge data from client research.
 * Used by both ResearchEmailDrawer (single) and BulkResearchFlow (bulk).
 *
 * Exports:
 *   buildTemplateData()   — flat key-value map of ALL merge variables
 *   countVariableHealth() — counts filled vs missing vars for preview UI
 *
 * The 5-category audit scores (On-Page SEO, GEO, Links, Usability, Performance)
 * are computed client-side using the same weighted-average logic as the server
 * (server/helpers/scoreCalculators.js). GEO + Usability use server-computed
 * values when available; the other 3 are derived from seoMetrics.
 *
 * IMPORTANT: Every merge variable MUST return a non-empty string so that
 * template placeholders are never left blank. When real data is missing,
 * sensible assumed/default values are used instead.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Letter grade (mirrors server scoreCalculators.js) ───────────────────────
// A = 90-100, B = 75-89, C+ = 65-74, C = 55-64, D = 35-54, F = 0-34
function letterGrade(score) {
  if (score == null || isNaN(score)) return null;
  const s = Math.round(Math.max(0, Math.min(100, score)));
  if (s >= 90) return "A";
  if (s >= 75) return "B";
  if (s >= 65) return "C+";
  if (s >= 55) return "C";
  if (s >= 35) return "D";
  return "F";
}

// ── Grade → hex color for email template rings ──────────────────────────────
function gradeColor(grade) {
  if (!grade) return "#EF4444";
  if (grade === "A" || grade === "B") return "#22C55E";
  if (grade === "C+" || grade === "C") return "#F59E0B";
  return "#EF4444";
}

// ── Weighted average (skips nulls, renormalizes) ────────────────────────────
function weightedAvg(entries) {
  const valid = entries.filter((e) => e.value != null && !isNaN(e.value));
  if (valid.length === 0) return null;
  const totalWeight = valid.reduce((sum, e) => sum + e.weight, 0);
  if (totalWeight === 0) return null;
  return Math.round(Math.max(0, Math.min(100, valid.reduce((sum, e) => sum + (e.value * e.weight) / totalWeight, 0))));
}

// ── On-Page SEO score (from seoMetrics) ─────────────────────────────────────
// Composite of authority + technical on-page factors.
function computeOnPageSeoScore(seo) {
  if (!seo) return null;
  const b = (v) => (v === true ? 100 : v === false ? 0 : null);
  const kwScore = seo.organicKeywords != null ? Math.min(seo.organicKeywords / 500, 1) * 100 : null;
  const idxScore = seo.indexedPages != null ? (seo.indexedPages > 0 ? 100 : 0) : null;
  const blScore = seo.brokenLinks != null ? Math.max(0, 100 - seo.brokenLinks * 10) : null;
  return weightedAvg([
    { value: seo.authorityScore, weight: 0.25 },
    { value: b(seo.schemaMarkup), weight: 0.15 },
    { value: b(seo.sitemapPresent), weight: 0.10 },
    { value: b(seo.robotsTxt), weight: 0.10 },
    { value: b(seo.ssl), weight: 0.10 },
    { value: b(seo.mobileFriendly), weight: 0.10 },
    { value: kwScore, weight: 0.10 },
    { value: idxScore, weight: 0.05 },
    { value: blScore, weight: 0.05 },
  ]);
}

// ── Links score (from seoMetrics) ───────────────────────────────────────────
function computeLinksScore(seo) {
  if (!seo) return null;
  const rdScore = seo.referringDomains != null ? Math.min(seo.referringDomains / 500, 1) * 100 : null;
  const blScore = seo.backlinks != null ? Math.min(seo.backlinks / 5000, 1) * 100 : null;
  return weightedAvg([
    { value: seo.domainRating, weight: 0.35 },
    { value: rdScore, weight: 0.35 },
    { value: blScore, weight: 0.30 },
  ]);
}

// ── Performance score (from seoMetrics speed + CWV) ─────────────────────────
function computePerformanceScore(seo) {
  if (!seo) return null;
  const lcpS = seo.lcp != null ? Math.max(0, 100 - (seo.lcp / 5) * 100) : null;
  const fidS = seo.fid != null ? Math.max(0, 100 - (seo.fid / 300) * 100) : null;
  const clsS = seo.cls != null ? Math.max(0, 100 - (seo.cls / 0.25) * 100) : null;
  return weightedAvg([
    { value: seo.speedMobile, weight: 0.30 },
    { value: seo.speedDesktop, weight: 0.20 },
    { value: lcpS, weight: 0.25 },
    { value: fidS, weight: 0.10 },
    { value: clsS, weight: 0.15 },
  ]);
}

// ── Below-average defaults when data is missing ─────────────────────────────
const DEFAULTS = {
  onPageSeo:   35,   // D
  geo:         20,   // F
  links:       20,   // F
  usability:   30,   // F
  performance: 40,   // D
};

// ── Keys that are allowed to be "0" — they represent numeric metrics, ───────
// not missing data. countVariableHealth uses this to avoid false "missing".
const NUMERIC_KEYS = new Set([
  "authorityScore", "organicTraffic", "organicKeywords", "backlinks",
  "authorityScorePct", "organicTrafficPct",
  "competitor1Score", "competitor1ScorePct", "competitor1Traffic", "competitor1TrafficPct",
  "competitor2Score", "competitor2ScorePct", "competitor2Traffic", "competitor2TrafficPct",
  "competitor3Score", "competitor3ScorePct", "competitor3Traffic", "competitor3TrafficPct",
  "gapPoints", "trafficMultiple",
  "onPageSeoScore", "geoScore", "linksScore", "usabilityScore", "performanceScore",
  "overallAuditScore",
]);

/**
 * Extract a usable domain string from a client record.
 * Tries website, domain, websiteAddress; strips protocol/path, falls back to clientName slug.
 */
function extractDomain(client) {
  const raw = client?.website || client?.domain || client?.websiteAddress || "";
  if (raw) {
    // Strip protocol + trailing slash for cleaner display
    return raw.replace(/^https?:\/\//, "").replace(/\/+$/, "") || raw;
  }
  // Fallback: derive from client name  (e.g. "Joe's Plumbing" → "joesplumbing.com")
  const name = client?.clientName || "";
  if (name) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (slug) return `${slug}.com`;
  }
  return "yourwebsite.com";
}

/**
 * Build the full set of template merge variables from a client + their research data.
 *
 * GUARANTEE: every returned value is a non-empty string so that no template
 * placeholder is left blank or shows "{{key}}" in the final email.
 *
 * @param {Object} client        — client document (clientName, email, contacts, website, etc.)
 * @param {Object} researchData  — the researchReport subdoc (seoMetrics, competitors, geoUsability, etc.)
 * @param {string} senderName    — current user's full name
 * @param {string} senderTitle   — current user's title
 * @returns {Object}             — flat key-value map of all merge variables
 */
export function buildTemplateData(client, researchData, senderName, senderTitle) {
  const seo = researchData?.seoMetrics || {};
  const geo = researchData?.geoUsability || {};
  const competitors = researchData?.competitors || [];

  // ── Competitor analysis (preserved from original) ─────────────────────
  const sorted = [...competitors].sort((a, b) => (b.authorityScore || 0) - (a.authorityScore || 0));
  const c1 = sorted[0] || {};
  const c2 = sorted[1] || {};
  const c3 = sorted[2] || {};

  const topScore = c1.authorityScore || 0;
  const clientScore = seo.authorityScore || 0;
  const gapPoints = Math.max(0, topScore - clientScore);

  const topTraffic = c1.organicTraffic || 0;
  const clientTraffic = seo.organicTraffic || 0;
  const trafficMultiple = clientTraffic > 0
    ? (topTraffic / clientTraffic).toFixed(1)
    : topTraffic > 0 ? "∞" : "1.0";

  const maxScore = Math.max(clientScore, topScore, c2.authorityScore || 0, c3.authorityScore || 0, 1);
  const maxTraffic = Math.max(clientTraffic, topTraffic, c2.organicTraffic || 0, c3.organicTraffic || 0, 1);

  // ── Primary contact ───────────────────────────────────────────────────
  const contacts = client?.contacts || [];
  const primary = contacts.find((c) => c.isPrimary) || contacts[0] || {};
  const firstName = primary.firstName || client?.clientName?.split(" ")[0] || "there";

  // ── Client domain (never empty) ───────────────────────────────────────
  const clientDomain = extractDomain(client);

  // ── 5-category audit scores ───────────────────────────────────────────
  // On-Page SEO, Links, Performance: computed client-side from seoMetrics
  // GEO, Usability: use server-computed values from geoUsability subdoc, fallback to defaults
  const rawOnPage = computeOnPageSeoScore(seo);
  const rawLinks  = computeLinksScore(seo);
  const rawPerf   = computePerformanceScore(seo);
  const rawGeo    = geo.geoOverallScore ?? null;
  const rawUsab   = geo.usabilityOverallScore ?? null;

  // Apply below-average defaults when data is missing
  const onPageScore = rawOnPage ?? DEFAULTS.onPageSeo;
  const geoScore    = rawGeo   ?? DEFAULTS.geo;
  const linksScoreV = rawLinks ?? DEFAULTS.links;
  const usabScore   = rawUsab  ?? DEFAULTS.usability;
  const perfScore   = rawPerf  ?? DEFAULTS.performance;

  const onPageGrade = letterGrade(onPageScore);
  const geoGradeV   = rawGeo != null ? (geo.geoGrade || letterGrade(geoScore)) : letterGrade(geoScore);
  const linksGrade  = letterGrade(linksScoreV);
  const usabGrade   = rawUsab != null ? (geo.usabilityGrade || letterGrade(usabScore)) : letterGrade(usabScore);
  const perfGrade   = letterGrade(perfScore);

  // Overall audit score = simple average of 5 categories
  const overallAudit = Math.round((onPageScore + geoScore + linksScoreV + usabScore + perfScore) / 5);
  const overallAuditGrade = letterGrade(overallAudit);

  return {
    // ── Contact / client ────────────────────────────────────────────────
    firstName,
    clientName: client?.clientName || "Your Company",
    clientDomain,

    // ── Raw SEO metrics ─────────────────────────────────────────────────
    authorityScore: String(clientScore),
    organicTraffic: String(clientTraffic),
    organicKeywords: String(seo.organicKeywords || 0),
    backlinks: String(seo.backlinks || 0),
    authorityScorePct: String(Math.round((clientScore / maxScore) * 100)),
    organicTrafficPct: String(Math.round((clientTraffic / maxTraffic) * 100)),

    // ── Competitor 1 ────────────────────────────────────────────────────
    competitor1Name: c1.name || "Competitor 1",
    competitor1Score: String(c1.authorityScore || 0),
    competitor1ScorePct: String(Math.round(((c1.authorityScore || 0) / maxScore) * 100)),
    competitor1Traffic: String(c1.organicTraffic || 0),
    competitor1TrafficPct: String(Math.round(((c1.organicTraffic || 0) / maxTraffic) * 100)),
    // ── Competitor 2 ────────────────────────────────────────────────────
    competitor2Name: c2.name || "Competitor 2",
    competitor2Score: String(c2.authorityScore || 0),
    competitor2ScorePct: String(Math.round(((c2.authorityScore || 0) / maxScore) * 100)),
    competitor2Traffic: String(c2.organicTraffic || 0),
    competitor2TrafficPct: String(Math.round(((c2.organicTraffic || 0) / maxTraffic) * 100)),
    // ── Competitor 3 ────────────────────────────────────────────────────
    competitor3Name: c3.name || "Competitor 3",
    competitor3Score: String(c3.authorityScore || 0),
    competitor3ScorePct: String(Math.round(((c3.authorityScore || 0) / maxScore) * 100)),
    competitor3Traffic: String(c3.organicTraffic || 0),
    competitor3TrafficPct: String(Math.round(((c3.organicTraffic || 0) / maxTraffic) * 100)),

    // ── Gap metrics ─────────────────────────────────────────────────────
    gapPoints: String(gapPoints),
    trafficMultiple: String(trafficMultiple),

    // ── 5-Category Audit Scores (for website-audit template) ────────────
    onPageSeoScore: String(onPageScore),
    onPageSeoGrade: onPageGrade || "F",
    onPageSeoColor: gradeColor(onPageGrade),

    geoScore: String(geoScore),
    geoGrade: geoGradeV || "F",
    geoColor: gradeColor(geoGradeV),

    linksScore: String(linksScoreV),
    linksGrade: linksGrade || "F",
    linksColor: gradeColor(linksGrade),

    usabilityScore: String(usabScore),
    usabilityGrade: usabGrade || "F",
    usabilityColor: gradeColor(usabGrade),

    performanceScore: String(perfScore),
    performanceGrade: perfGrade || "F",
    performanceColor: gradeColor(perfGrade),

    overallAuditScore: String(overallAudit),
    overallAuditGrade: overallAuditGrade || "F",
    overallAuditColor: gradeColor(overallAuditGrade),

    // ── Sender (never empty) ────────────────────────────────────────────
    senderName: senderName || "Hill Country Coders",
    senderTitle: senderTitle || "Business Growth Consultant",
    bookingLink: "https://calendar.app.google/T8MXTN45ACbcNyJg6",
  };
}

/**
 * Count filled vs missing merge variables.
 *
 * "Missing" means the value is empty/blank — NOT that it's "0".
 * Numeric metric keys (authorityScore, gapPoints, etc.) are allowed to be "0"
 * because zero is a valid data point, not an absence of data.
 *
 * @param {Object} templateData — output from buildTemplateData
 * @returns {{ filled: string[], missing: string[], total: number }}
 */
export function countVariableHealth(templateData) {
  const keys = Object.keys(templateData || {});
  const filled = [];
  const missing = [];

  for (const k of keys) {
    const v = templateData[k];
    // A value is "missing" only if it's truly empty/blank.
    // "0" is valid for numeric metric keys — it means the score is zero, not absent.
    if (!v || v === "—") {
      missing.push(k);
    } else if (v === "0" && !NUMERIC_KEYS.has(k)) {
      // "0" on a non-numeric key (unlikely but defensive) counts as missing
      missing.push(k);
    } else {
      filled.push(k);
    }
  }

  return { filled, missing, total: keys.length };
}
