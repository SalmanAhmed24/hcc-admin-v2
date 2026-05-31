/**
 * BulkResearchCampaigns.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * "Research Campaigns" sub-tab inside Mailing > Bulk Email.
 * Fetches research-tagged bulk jobs from the API and displays them in a table
 * with KPI cards. Also provides the "New Research Campaign" button that opens
 * BulkResearchFlow.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import moment from "moment";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import ScienceIcon from "@mui/icons-material/Science";
import RefreshIcon from "@mui/icons-material/Refresh";
import useAuthStore from "@/store/store";
import { apiPath } from "@/utils/routes";
import BulkResearchFlow from "./BulkResearchFlow";

// ── Status badge colors ─────────────────────────────────────────────────────
const STATUS_CFG = {
  queued:     { bg: "rgba(183,151,255,0.15)", color: "#B797FF", label: "Queued" },
  processing: { bg: "rgba(127,86,217,0.20)", color: "#A78BFA", label: "Processing" },
  completed:  { bg: "rgba(74,222,128,0.12)", color: "#4ADE80", label: "Completed" },
  failed:     { bg: "rgba(248,113,113,0.12)", color: "#F87171", label: "Failed" },
};

export default function BulkResearchCampaigns() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.user?._id;

  const [flowOpen, setFlowOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // ── Fetch research campaigns ────────────────────────────────────────────
  const fetchJobs = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // Fetch jobs tagged with source=research; also fetch ALL jobs as fallback
      // for older campaigns sent before the source tag was added
      const res = await axios.get(
        `${apiPath.prodPath3}/api/bulkEmail/getBulkEmailJobs/${userId}`,
        { params: { page, limit, source: "research" } }
      );
      const rows = Array.isArray(res.data?.jobs) ? res.data.jobs : [];
      setJobs(rows);
      setTotalPages(res.data?.pagination?.pages || 1);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [userId, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // Auto-refresh when flow closes (campaign may have been sent)
  const handleFlowClose = () => {
    setFlowOpen(false);
    fetchJobs();
  };

  // ── KPIs ────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total = jobs.length;
    const completed = jobs.filter((j) => j.status === "completed").length;
    const sent = jobs.reduce((s, j) => s + (j.sentCount || 0), 0);
    const recipients = jobs.reduce((s, j) => s + (j.totalRecipients || 0), 0);
    return { total, completed, sent, recipients };
  }, [jobs]);

  // ── Styles ──────────────────────────────────────────────────────────────
  const cardStyle = {
    background: "rgba(20,15,43,0.55)",
    border: "1px solid rgba(127,86,217,0.2)",
    borderRadius: 12,
    padding: "14px 18px",
  };

  const kpiCardStyle = (borderColor) => ({
    ...cardStyle,
    borderColor,
    textAlign: "center",
    padding: "16px 12px",
  });

  return (
    <Box sx={{ p: 2 }}>
      {/* ── Header ─────────────────────────────────────────── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <ScienceIcon sx={{ color: "#B797FF", fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#fff" }}>
            Research Email Campaigns
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={fetchJobs}
            disabled={loading}
            sx={{
              textTransform: "none", fontWeight: 600, borderColor: "rgba(127,86,217,0.3)",
              color: "#B797FF", "&:hover": { borderColor: "#B797FF", bgcolor: "rgba(183,151,255,0.08)" },
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<RocketLaunchIcon />}
            onClick={() => setFlowOpen(true)}
            sx={{
              background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
              textTransform: "none", fontWeight: 600, borderRadius: 2, px: 3,
              "&:hover": { background: "linear-gradient(135deg, #6D28D9 0%, #5B21B6 100%)" },
            }}
          >
            New Research Campaign
          </Button>
        </Box>
      </Box>

      {/* ── KPI cards ──────────────────────────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 3 }}>
        {[
          { v: kpis.total, l: "Campaigns", border: "rgba(127,86,217,0.35)", color: "#B797FF" },
          { v: kpis.completed, l: "Completed", border: "rgba(74,222,128,0.35)", color: "#4ADE80" },
          { v: kpis.sent, l: "Emails Sent", border: "rgba(183,151,255,0.35)", color: "#D8B4FE" },
          { v: kpis.recipients, l: "Total Recipients", border: "rgba(255,255,255,0.12)", color: "#fff" },
        ].map((k) => (
          <div key={k.l} style={kpiCardStyle(k.border)}>
            <div style={{ fontWeight: 700, fontSize: 28, color: k.color, lineHeight: 1 }}>{k.v}</div>
            <div style={{ fontSize: 11, color: "#6F618F", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{k.l}</div>
          </div>
        ))}
      </Box>

      {/* ── Campaign table ─────────────────────────────────── */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#6F618F" }}>Loading campaigns...</div>
      ) : jobs.length === 0 ? (
        /* Empty state */
        <Box sx={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          py: 10, border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 3, bgcolor: "rgba(255,255,255,0.03)",
        }}>
          <ScienceIcon sx={{ fontSize: 48, color: "rgba(255,255,255,0.2)", mb: 2 }} />
          <Typography sx={{ color: "rgba(255,255,255,0.5)", mb: 1 }}>
            No research campaigns found
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.35)", mb: 3, maxWidth: 420, textAlign: "center" }}>
            Send personalized Website Audit emails to multiple clients at once.
            Each email is merged with the client&apos;s own research data.
          </Typography>
          <Button
            variant="outlined" size="small"
            onClick={() => setFlowOpen(true)}
            sx={{
              textTransform: "none", borderColor: "rgba(255,255,255,0.2)", color: "#B797FF",
              "&:hover": { borderColor: "#B797FF", bgcolor: "rgba(183,151,255,0.08)" },
            }}
          >
            Launch your first campaign
          </Button>
        </Box>
      ) : (
        <>
          {/* Table */}
          <div style={{
            ...cardStyle, padding: 0, overflow: "hidden",
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "rgba(127,86,217,0.08)", borderBottom: "1px solid rgba(127,86,217,0.15)" }}>
                  {["Status", "Subject", "Service", "Progress", "Created"].map((h) => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700,
                      color: "#A99BD4", textTransform: "uppercase", letterSpacing: "0.08em",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const status = (job.status || "queued").toLowerCase();
                  const cfg = STATUS_CFG[status] || STATUS_CFG.queued;
                  const sent = job.sentCount || 0;
                  const total = job.totalRecipients || 0;
                  const failed = job.failedCount || 0;
                  const pct = total > 0 ? Math.round((sent / total) * 100) : 0;

                  return (
                    <tr key={job._id} style={{ borderBottom: "1px solid rgba(127,86,217,0.08)" }}>
                      {/* Status */}
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          display: "inline-block", padding: "3px 10px", borderRadius: 20,
                          fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color,
                        }}>{cfg.label}</span>
                      </td>
                      {/* Subject */}
                      <td style={{ padding: "12px 16px", color: "#fff", fontWeight: 500, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {job.subject || "—"}
                      </td>
                      {/* Service */}
                      <td style={{ padding: "12px 16px", color: "#A99BD4" }}>
                        {job.service === "sendgrid" ? "SendGrid" : "Gmail"}
                      </td>
                      {/* Progress */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {/* Progress bar */}
                          <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(127,86,217,0.15)", overflow: "hidden", maxWidth: 100 }}>
                            <div style={{
                              width: `${pct}%`, height: "100%", borderRadius: 3,
                              background: failed > 0 ? "linear-gradient(90deg, #4ADE80, #F87171)" : "#4ADE80",
                              transition: "width 0.3s ease",
                            }} />
                          </div>
                          <span style={{ color: "#fff", fontWeight: 600, fontSize: 12, minWidth: 50 }}>
                            {sent}/{total}
                          </span>
                          {failed > 0 && (
                            <span style={{ color: "#F87171", fontSize: 11 }}>({failed} failed)</span>
                          )}
                        </div>
                      </td>
                      {/* Created */}
                      <td style={{ padding: "12px 16px", color: "#6F618F", fontSize: 12 }}>
                        {job.createdAt ? moment(job.createdAt).format("MMM DD, YYYY h:mm A") : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 2 }}>
              <Button
                size="small" disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                sx={{ textTransform: "none", color: "#B797FF", minWidth: 36 }}
              >
                &larr; Prev
              </Button>
              <Typography sx={{ color: "#6F618F", fontSize: 13, lineHeight: "32px" }}>
                Page {page} of {totalPages}
              </Typography>
              <Button
                size="small" disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                sx={{ textTransform: "none", color: "#B797FF", minWidth: 36 }}
              >
                Next &rarr;
              </Button>
            </Box>
          )}
        </>
      )}

      {/* ── Bulk Research Flow dialog ─────────────────────── */}
      <BulkResearchFlow open={flowOpen} onClose={handleFlowClose} />
    </Box>
  );
}
