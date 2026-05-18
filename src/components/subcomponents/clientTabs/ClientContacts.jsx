"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, UserPlus, X, Check, Mail, Phone, Briefcase,
  Building2, Activity, TrendingUp, ExternalLink, Loader2,
  Users, Unlink, Star,
} from "lucide-react";
import apiClient from "@/lib/apiClient";
import { CLIENT_ROUTES } from "@/utils/routes";
import { useQuery } from "@apollo/client/react";
import { GET_CONTACTS } from "@/graphql/contactQueries";
import { useRouter } from "next/navigation";

const LIMIT = 15;

export default function ClientContacts({ item, open }) {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [primaryId, setPrimaryId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const fetchContacts = useCallback(async () => {
    if (!item?._id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(CLIENT_ROUTES.contacts(item._id));
      setContacts(res.data.contacts || []);
      setPrimaryId(res.data.primaryContactId || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }, [item?._id]);

  useEffect(() => {
    fetchContacts();
  }, [open, fetchContacts]);

  const handleUnlink = async (contactId) => {
    if (!confirm("Unlink this contact from the client?")) return;
    try {
      await apiClient.delete(CLIENT_ROUTES.unlinkContact(item._id, contactId));
      fetchContacts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to unlink contact");
    }
  };

  const handleSetPrimary = async (contactId) => {
    try {
      await apiClient.patch(CLIENT_ROUTES.primaryContact(item._id), { contactId });
      fetchContacts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to set primary contact");
    }
  };

  const handleLinked = () => {
    setShowPicker(false);
    fetchContacts();
  };

  return (
    <div style={{
      background: "rgba(28,22,52,0.65)",
      border: "1px solid rgba(127,86,217,0.22)",
      borderRadius: 14,
      padding: "20px 24px",
      minHeight: 200,
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Users size={16} style={{ color: "#B797FF" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#E8E0F5" }}>
            Linked Contacts
          </span>
          <span style={{
            fontSize: 11, color: "#8B7CB3",
            background: "rgba(127,86,217,0.12)",
            padding: "2px 8px", borderRadius: 99,
          }}>
            {contacts.length}
          </span>
        </div>
        <button
          onClick={() => setShowPicker(true)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 8,
            background: "rgba(183,151,255,0.12)",
            border: "1px solid rgba(183,151,255,0.3)",
            color: "#B797FF", fontSize: 12, fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <UserPlus size={13} />
          Add Contact
        </button>
      </div>

      {/* Picker modal */}
      {showPicker && (
        <ContactPicker
          clientId={item._id}
          existingIds={contacts.map((c) => c._id)}
          onClose={() => setShowPicker(false)}
          onLinked={handleLinked}
        />
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Loader2 size={20} style={{ color: "#B797FF", animation: "spin 1s linear infinite" }} />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <p style={{ color: "#FCA5A5", fontSize: 13, textAlign: "center", padding: 20 }}>{error}</p>
      )}

      {/* Empty */}
      {!loading && !error && contacts.length === 0 && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "40px 0", gap: 8,
        }}>
          <Users size={32} style={{ color: "#4A4468" }} />
          <p style={{ fontSize: 13, color: "#6B5FA0" }}>No contacts linked yet</p>
          <p style={{ fontSize: 11, color: "#4A4468" }}>Click "Add Contact" to link contacts to this client</p>
        </div>
      )}

      {/* Contact cards */}
      {!loading && !error && contacts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {contacts.map((contact) => (
            <ContactCard
              key={contact._id}
              contact={contact}
              isPrimary={contact._id === primaryId}
              onUnlink={() => handleUnlink(contact._id)}
              onSetPrimary={() => handleSetPrimary(contact._id)}
              onOpen={() => router.push(`/contacts/${contact._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Contact Card ─────────────────────────────────────────────────────── */

function ContactCard({ contact, isPrimary, onUnlink, onSetPrimary, onOpen }) {
  const info = contact.basicInfo || {};
  const pro = contact.professional || {};
  const intel = contact.intelligence || {};
  const activity = intel.activityCounts || {};
  const deals = intel.dealMetrics || {};
  const lifecycle = contact.lifeCycle || {};

  const name = `${info.firstName || ""} ${info.lastName || ""}`.trim() || "—";
  const statusColor = {
    active: "#4ADE80",
    lead: "#FCD34D",
    customer: "#60A5FA",
    inactive: "#6B5FA0",
    churned: "#F87171",
  }[lifecycle.status] || "#8B7CB3";

  return (
    <div
      style={{
        background: "rgba(127,86,217,0.06)",
        border: isPrimary
          ? "1px solid rgba(183,151,255,0.5)"
          : "1px solid rgba(127,86,217,0.15)",
        borderRadius: 12,
        padding: "14px 16px",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
      onClick={onOpen}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(127,86,217,0.12)";
        e.currentTarget.style.borderColor = "rgba(183,151,255,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(127,86,217,0.06)";
        e.currentTarget.style.borderColor = isPrimary
          ? "rgba(183,151,255,0.5)"
          : "rgba(127,86,217,0.15)";
      }}
    >
      {/* Row 1: Name + status + actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
          {/* Avatar */}
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: "rgba(183,151,255,0.15)",
            border: "1px solid rgba(183,151,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#B797FF",
          }}>
            {(info.firstName?.[0] || "").toUpperCase()}{(info.lastName?.[0] || "").toUpperCase()}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 14, fontWeight: 600, color: "#E8E0F5",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {name}
              </span>
              {isPrimary && (
                <span style={{
                  fontSize: 10, fontWeight: 600, color: "#FCD34D",
                  background: "rgba(251,191,36,0.12)",
                  border: "1px solid rgba(251,191,36,0.3)",
                  padding: "1px 7px", borderRadius: 99,
                  display: "inline-flex", alignItems: "center", gap: 3,
                }}>
                  <Star size={8} fill="#FCD34D" /> Primary
                </span>
              )}
              {lifecycle.status && (
                <span style={{
                  fontSize: 10, fontWeight: 500, color: statusColor,
                  background: `${statusColor}18`,
                  border: `1px solid ${statusColor}40`,
                  padding: "1px 7px", borderRadius: 99,
                  textTransform: "capitalize",
                }}>
                  {lifecycle.status}
                </span>
              )}
            </div>
            {pro.jobTitle && (
              <span style={{ fontSize: 11, color: "#8B7CB3" }}>
                {pro.jobTitle}{pro.department ? ` · ${pro.department}` : ""}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {!isPrimary && (
            <button
              onClick={onSetPrimary}
              title="Set as primary"
              style={{
                width: 28, height: 28, borderRadius: 6,
                background: "rgba(251,191,36,0.08)",
                border: "1px solid rgba(251,191,36,0.2)",
                color: "#FCD34D", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Star size={12} />
            </button>
          )}
          <button
            onClick={onUnlink}
            title="Unlink contact"
            style={{
              width: 28, height: 28, borderRadius: 6,
              background: "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.2)",
              color: "#F87171", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Unlink size={12} />
          </button>
          <button
            onClick={onOpen}
            title="Open contact"
            style={{
              width: 28, height: 28, borderRadius: 6,
              background: "rgba(183,151,255,0.08)",
              border: "1px solid rgba(183,151,255,0.2)",
              color: "#B797FF", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ExternalLink size={12} />
          </button>
        </div>
      </div>

      {/* Row 2: Contact details + metrics */}
      <div style={{
        display: "flex", gap: 16, flexWrap: "wrap",
        fontSize: 11, color: "#8B7CB3",
      }}>
        {info.email && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}
            title={info.email}
          >
            <Mail size={10} style={{ flexShrink: 0 }} /> {info.email}
          </span>
        )}
        {info.phone && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Phone size={10} /> {info.phone}
          </span>
        )}
        {pro.company?.name && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Building2 size={10} /> {pro.company.name}
          </span>
        )}

        {/* Metrics */}
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 12 }}>
          {activity.total > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }} title="Total activities">
              <Activity size={10} style={{ color: "#B797FF" }} />
              <span style={{ color: "#C4B5FD" }}>{activity.total}</span>
            </span>
          )}
          {(deals.totalDeals || 0) > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }} title={`${deals.openDeals || 0} open / ${deals.wonDeals || 0} won`}>
              <TrendingUp size={10} style={{ color: "#4ADE80" }} />
              <span style={{ color: "#4ADE80" }}>{deals.totalDeals}</span>
            </span>
          )}
          {intel.engagementScore > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: "#B797FF",
              background: "rgba(183,151,255,0.1)",
              padding: "1px 6px", borderRadius: 4,
            }} title="Engagement score">
              {intel.engagementScore}%
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

/* ─── Contact Picker (modal overlay) ───────────────────────────────────── */

function ContactPicker({ clientId, existingIds, onClose, onLinked }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [linking, setLinking] = useState(false);
  const scrollRef = useRef(null);
  const existingSet = new Set(existingIds.map(String));

  const { data, loading, fetchMore } = useQuery(GET_CONTACTS, {
    variables: {
      filter: search.trim() ? { search: search.trim() } : {},
      sort: { field: "updatedAt", order: "desc" },
      pagination: { page: 1, limit: LIMIT },
    },
    fetchPolicy: "network-only",
  });

  const edges = data?.contacts?.edges || [];
  const pageInfo = data?.contacts?.pageInfo || {};
  const contacts = edges.map((e) => e.node);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || loading || !pageInfo.hasNextPage) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
      const nextPage = (pageInfo.currentPage || 1) + 1;
      fetchMore({
        variables: { pagination: { page: nextPage, limit: LIMIT } },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            contacts: {
              ...fetchMoreResult.contacts,
              edges: [...prev.contacts.edges, ...fetchMoreResult.contacts.edges],
            },
          };
        },
      });
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleLink = async () => {
    if (selected.size === 0) return;
    setLinking(true);
    try {
      await apiClient.post(CLIENT_ROUTES.contacts(clientId), {
        contactIds: Array.from(selected),
      });
      onLinked();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to link contacts");
    } finally {
      setLinking(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}
      onClick={onClose}
    >
      <div
        style={{
          width: 560, maxHeight: "80vh",
          background: "#1E1740",
          border: "1px solid rgba(127,86,217,0.4)",
          borderRadius: 16, overflow: "hidden",
          display: "flex", flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(127,86,217,0.2)",
        }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#E8E0F5" }}>
            Link Contacts
          </span>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#6B5FA0", cursor: "pointer",
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 20px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(20,15,43,0.7)",
            border: "1px solid rgba(69,44,149,0.5)",
            borderRadius: 10, padding: "8px 12px",
          }}>
            <Search size={14} style={{ color: "#8B7CB3", flexShrink: 0 }} />
            <input
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                fontSize: 13, color: "#E8E0F5",
              }}
              placeholder="Search by name, email, company…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button onClick={() => setSearch("")} style={{
                background: "none", border: "none", color: "#6B5FA0", cursor: "pointer",
              }}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Selection count */}
        {selected.size > 0 && (
          <div style={{
            padding: "0 20px 8px", fontSize: 11, color: "#B797FF",
          }}>
            {selected.size} contact{selected.size > 1 ? "s" : ""} selected
          </div>
        )}

        {/* List */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            flex: 1, overflowY: "auto",
            padding: "0 20px 12px",
            maxHeight: 400,
          }}
        >
          {contacts.map((c) => {
            const bi = c.basicInfo || {};
            const pr = c.professional || {};
            const isExisting = existingSet.has(c._id);
            const isSelected = selected.has(c._id);
            const fullName = `${bi.firstName || ""} ${bi.lastName || ""}`.trim();

            return (
              <div
                key={c._id}
                onClick={() => !isExisting && toggleSelect(c._id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", borderRadius: 10, marginBottom: 4,
                  background: isSelected
                    ? "rgba(183,151,255,0.15)"
                    : "rgba(127,86,217,0.04)",
                  border: isSelected
                    ? "1px solid rgba(183,151,255,0.4)"
                    : "1px solid rgba(127,86,217,0.1)",
                  cursor: isExisting ? "default" : "pointer",
                  opacity: isExisting ? 0.45 : 1,
                  transition: "all 0.12s",
                }}
              >
                {/* Checkbox */}
                <div style={{
                  width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                  border: isSelected
                    ? "1.5px solid #B797FF"
                    : "1.5px solid rgba(127,86,217,0.3)",
                  background: isSelected ? "rgba(183,151,255,0.2)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isSelected && <Check size={12} style={{ color: "#B797FF" }} />}
                  {isExisting && <span style={{ fontSize: 9, color: "#6B5FA0" }}>✓</span>}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 500, color: "#E8E0F5",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {fullName || "Unnamed"}
                    {isExisting && (
                      <span style={{ fontSize: 10, color: "#6B5FA0", marginLeft: 6 }}>
                        already linked
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: 11, color: "#6B5FA0",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {bi.email || "No email"}
                    {pr.jobTitle ? ` · ${pr.jobTitle}` : ""}
                    {pr.company?.name ? ` @ ${pr.company.name}` : ""}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
              <Loader2 size={18} style={{ color: "#B797FF", animation: "spin 1s linear infinite" }} />
            </div>
          )}

          {!loading && contacts.length === 0 && (
            <p style={{ textAlign: "center", color: "#6B5FA0", fontSize: 13, padding: 30 }}>
              No contacts found
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10,
          padding: "12px 20px",
          borderTop: "1px solid rgba(127,86,217,0.2)",
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "7px 16px", borderRadius: 8,
              background: "rgba(127,86,217,0.08)",
              border: "1px solid rgba(127,86,217,0.25)",
              color: "#8B7CB3", fontSize: 12, fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleLink}
            disabled={selected.size === 0 || linking}
            style={{
              padding: "7px 16px", borderRadius: 8,
              background: selected.size > 0
                ? "linear-gradient(to bottom, #9B74F0, #6B42C8)"
                : "rgba(127,86,217,0.15)",
              border: "none",
              color: selected.size > 0 ? "#fff" : "#6B5FA0",
              fontSize: 12, fontWeight: 600,
              cursor: selected.size > 0 ? "pointer" : "default",
              opacity: linking ? 0.6 : 1,
            }}
          >
            {linking ? "Linking…" : `Link ${selected.size > 0 ? selected.size : ""} Contact${selected.size !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
