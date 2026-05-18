import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import moment from "moment";
import axios from "axios";
import { apiPath } from "@/utils/routes";
import Swal from "sweetalert2";
import React, { useState, useRef, useEffect } from "react";
import AddCLient from "../drawers/addClient";
import ClientDetails from "../drawers/clientOpen";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  Eye,
  Pencil,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #FBBF24, #B45309)",
  "linear-gradient(135deg, #60A5FA, #1D4ED8)",
  "linear-gradient(135deg, #34D399, #047857)",
  "linear-gradient(135deg, #F472B6, #BE185D)",
  "linear-gradient(135deg, #C084FC, #7E22CE)",
  "linear-gradient(135deg, #FB7185, #BE123C)",
  "linear-gradient(135deg, #2DD4BF, #0F766E)",
  "linear-gradient(135deg, #FB923C, #C2410C)",
];

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarGradient(name) {
  return AVATAR_GRADIENTS[hashStr(name || "") % AVATAR_GRADIENTS.length];
}

function relativeDate(date) {
  if (!date) return "";
  const m = moment(date);
  const now = moment();
  const diff = now.diff(m, "days");
  if (diff === 0) return "today";
  if (diff === 1) return "yesterday";
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  return `${Math.floor(diff / 30)}mo ago`;
}

const STATUS_CHIPS = {
  Lead: "chip-violet",
  Active: "chip-success",
  Prospect: "chip-warn",
  Inactive: "chip-neutral",
  Closed: "chip-danger",
};

const RESEARCH_CHIPS = {
  "Research Needed": "chip-warn",
  "Under Research": "chip-info",
  "Research Complete": "chip-success",
  "Research Paused": "chip-paused",
};

const PRIORITY_COLORS = {
  Urgent: "#F87171",
  High: "#FCD34D",
  Medium: "#93C5FD",
  Low: "#A99BD4",
};

function Chip({ label, variant = "chip-violet" }) {
  return (
    <span className={`client-chip ${variant}`}>
      <span className="client-chip-dot" />
      {label}
    </span>
  );
}

function PriorityPill({ priority }) {
  if (!priority) return <span className="text-[#6F618F] text-xs italic">None</span>;
  const color = PRIORITY_COLORS[priority] || "#A99BD4";
  return (
    <span className="client-priority-pill">
      <span className="client-priority-bar" style={{ background: color }} />
      {priority}
    </span>
  );
}

function ClientPopover({ item, anchorEl }) {
  if (!anchorEl) return null;
  const rect = anchorEl.getBoundingClientRect();

  return (
    <div
      className="client-popover"
      style={{
        position: "fixed",
        top: rect.bottom + 8,
        left: rect.left,
        zIndex: 9999,
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="client-avatar"
          style={{ background: getAvatarGradient(item.clientName), width: 40, height: 40, fontSize: 14 }}
        >
          {getInitials(item.clientName)}
        </div>
        <div>
          <div className="text-white font-semibold text-sm">{item.clientName}</div>
          <div className="text-[#8B7CB3] text-xs">{item.email || "No email"}</div>
        </div>
      </div>
      <div className="client-popover-grid">
        <span className="client-popover-label">Phone</span>
        <span className="client-popover-value">{item.phone || "N/A"}</span>
        <span className="client-popover-label">City</span>
        <span className="client-popover-value">{item.city || "N/A"}</span>
        <span className="client-popover-label">State</span>
        <span className="client-popover-value">{item.state || "N/A"}</span>
        <span className="client-popover-label">Territory</span>
        <span className="client-popover-value">{item.territory || "N/A"}</span>
        <span className="client-popover-label">Category</span>
        <span className="client-popover-value">
          {item.needCategory?.categoryName || "N/A"}
        </span>
        <span className="client-popover-label">Website</span>
        <span className="client-popover-value" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.websiteAddress || "N/A"}
        </span>
      </div>
    </div>
  );
}

function EmployeeTable({
  allEmp,
  refreshData,
  currentPage,
  totalPages,
  onPageChange,
  totalClients,
  pageSize,
}) {
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openItem, setOpenItem] = useState(null);
  const [selectedPriorities, setSelectedPriorities] = useState({});
  const [hoveredRow, setHoveredRow] = useState(null);
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const hoverTimerRef = useRef(null);
  const { userId, user } = useCurrentUser();
  const token = user?.jwtToken;

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const handleRowMouseEnter = (item, e) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setHoveredRow(item._id);
      setPopoverAnchor(e.currentTarget);
    }, 500);
  };

  const handleRowMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHoveredRow(null);
    setPopoverAnchor(null);
  };

  const handleRowClick = (item) => {
    setOpenItem(item);
    setOpenModal(true);
  };

  const handlePriorityChange = (clientId, value) => {
    setSelectedPriorities((prev) => ({ ...prev, [clientId]: value }));
  };

  const handleAddToResearch = async (clientId, e) => {
    e.stopPropagation();
    const priority = selectedPriorities[clientId];
    if (!priority) {
      Swal.fire({ icon: "warning", text: "Please select a priority first." });
      return;
    }
    try {
      const res = await axios.patch(
        `${apiPath.prodPath}/api/clients/changeResearchTag/${clientId}`,
        { researchTag: true, researchPriority: priority },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.status === 200) {
        Swal.fire({ icon: "success", text: "Added to research", timer: 1500, showConfirmButton: false });
        refreshData();
      }
    } catch (error) {
      console.error("Failed to update research tag:", error);
      Swal.fire({ icon: "error", text: "Error updating client research tag" });
    }
  };

  const handleEdit = (item, e) => {
    e.stopPropagation();
    setEditId(item._id);
    setEditModal(true);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    Swal.fire({
      icon: "warning",
      text: "Are you sure you want to delete this client?",
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${apiPath.prodPath}/api/clients/delete/${id}`)
          .then(() => refreshData())
          .catch((err) => console.error(err));
      }
    });
  };

  const editEmp = (data) => {
    axios
      .put(`${apiPath.prodPath}/api/clients/edit/${editId}`, data)
      .then(() => refreshData())
      .catch((err) => console.error(err));
  };

  if (!allEmp.length) {
    return (
      <div className="flex items-center justify-center h-40 text-[#6F618F] text-lg font-satoshi">
        No clients found
      </div>
    );
  }

  const start = (currentPage - 1) * (pageSize || 10) + 1;
  const end = Math.min(currentPage * (pageSize || 10), totalClients || allEmp.length);

  return (
    <div className="client-table-wrapper">
      <style>{`
        .client-table-wrapper {
          background: rgba(28,22,52,0.85);
          border: 1px solid rgba(127,86,217,0.22);
          border-radius: 16px;
          overflow: hidden;
        }
        .client-table-wrapper table thead th {
          text-align: left;
          padding: 10px 14px;
          font-family: inherit;
          font-weight: 600;
          font-size: 10.5px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #6F618F;
          background: rgba(20,15,43,0.55);
          border-bottom: 1px solid rgba(127,86,217,0.22);
          position: sticky;
          top: 0;
          z-index: 1;
          white-space: nowrap;
        }
        .client-table-wrapper table tbody tr {
          transition: background 0.15s;
          cursor: pointer;
        }
        .client-table-wrapper table tbody tr:hover {
          background: rgba(127,86,217,0.08);
        }
        .client-table-wrapper table tbody td {
          padding: 14px;
          vertical-align: middle;
          border-bottom: 1px solid rgba(127,86,217,0.12);
          font-size: 13px;
          color: #E8E0F5;
        }
        .client-table-wrapper table tbody tr:last-child td {
          border-bottom: 0;
        }
        .client-avatar {
          width: 36px;
          height: 36px;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }
        .client-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 2px 9px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 500;
          border: 1px solid;
          white-space: nowrap;
        }
        .client-chip-dot {
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: currentColor;
        }
        .chip-success { background: rgba(74,222,128,0.12); border-color: rgba(74,222,128,0.35); color: #86EFAC; }
        .chip-info { background: rgba(96,165,250,0.12); border-color: rgba(96,165,250,0.35); color: #93C5FD; }
        .chip-warn { background: rgba(251,191,36,0.12); border-color: rgba(251,191,36,0.35); color: #FCD34D; }
        .chip-danger { background: rgba(248,113,113,0.12); border-color: rgba(248,113,113,0.35); color: #FCA5A5; }
        .chip-violet { background: rgba(127,86,217,0.15); border-color: rgba(127,86,217,0.35); color: #E1C9FF; }
        .chip-neutral { background: rgba(111,97,143,0.2); border-color: rgba(111,97,143,0.4); color: #A99BD4; }
        .chip-paused { background: rgba(251,146,60,0.12); border-color: rgba(251,146,60,0.35); color: #FDBA74; }
        .client-priority-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 9px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 500;
          background: rgba(20,15,43,0.7);
          border: 1px solid rgba(69,44,149,0.5);
          color: #B0A3CC;
        }
        .client-priority-bar {
          width: 3px;
          height: 12px;
          border-radius: 2px;
        }
        .client-action-btn {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: transparent;
          border: 1px solid transparent;
          color: #6F618F;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          cursor: pointer;
        }
        .client-action-btn:hover {
          background: rgba(127,86,217,0.18);
          color: #fff;
          border-color: rgba(127,86,217,0.3);
        }
        .client-action-btn.danger:hover {
          background: rgba(248,113,113,0.15);
          color: #FCA5A5;
          border-color: rgba(248,113,113,0.35);
        }
        .client-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          border-top: 1px solid rgba(127,86,217,0.12);
          font-size: 12px;
          color: #6F618F;
        }
        .client-page-btn {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(127,86,217,0.08);
          border: 1px solid rgba(127,86,217,0.3);
          color: #B797FF;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
          font-size: 12px;
        }
        .client-page-btn:hover {
          background: rgba(127,86,217,0.2);
        }
        .client-page-btn.active {
          background: #B797FF;
          color: #1C1634;
          border-color: #B797FF;
          font-weight: 700;
        }
        .client-page-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .client-popover {
          background: rgba(28,22,52,0.95);
          border: 1px solid rgba(127,86,217,0.35);
          border-radius: 12px;
          padding: 16px;
          min-width: 280px;
          max-width: 340px;
          box-shadow: 0 12px 40px -8px rgba(0,0,0,0.5);
          backdrop-filter: blur(12px);
          pointer-events: none;
        }
        .client-popover-grid {
          display: grid;
          grid-template-columns: 80px 1fr;
          row-gap: 6px;
          column-gap: 12px;
          font-size: 12px;
        }
        .client-popover-label {
          color: #6F618F;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
        }
        .client-popover-value {
          color: #E8E0F5;
        }
      `}</style>

      <div style={{ overflowX: "auto" }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Research</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Created</TableHead>
              <TableHead style={{ textAlign: "right", paddingRight: 18 }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allEmp.map((item) => (
              <TableRow
                key={item._id}
                onClick={() => handleRowClick(item)}
                onMouseEnter={(e) => handleRowMouseEnter(item, e)}
                onMouseLeave={handleRowMouseLeave}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className="client-avatar"
                      style={{ background: getAvatarGradient(item.clientName) }}
                    >
                      {getInitials(item.clientName)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-semibold text-[13.5px] truncate max-w-[220px]">
                        {item.clientName}
                      </div>
                      <div className="text-[#8B7CB3] text-[11.5px] truncate max-w-[220px]">
                        {item.primaryContact || item.email || "No contact"}
                      </div>
                      <div className="text-[#6F618F] text-[10.5px] truncate max-w-[220px]">
                        {[item.needCategory?.categoryName, item.territory]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Chip
                    label={item.leadStatus || item.status || "—"}
                    variant={STATUS_CHIPS[item.leadStatus] || STATUS_CHIPS[item.status] || "chip-neutral"}
                  />
                </TableCell>

                <TableCell>
                  {item.researchTag ? (
                    <Chip
                      label={item.researchStatus || "Under research"}
                      variant={RESEARCH_CHIPS[item.researchStatus] || "chip-info"}
                    />
                  ) : (
                    <span className="text-[#6F618F] text-xs italic">Not queued</span>
                  )}
                </TableCell>

                <TableCell>
                  <PriorityPill priority={item.researchPriority} />
                </TableCell>

                <TableCell>
                  {item.assignedTo?.name || item.assignedTo ? (
                    <span className="text-[#B797FF] font-medium text-[12.5px]">
                      {typeof item.assignedTo === "string"
                        ? item.assignedTo
                        : item.assignedTo?.name || "—"}
                    </span>
                  ) : (
                    <span className="text-[#6F618F] italic text-[12.5px]">Unassigned</span>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex flex-col leading-tight">
                    <span className="text-white text-[13px]">
                      {moment(item.createdAt).format("MMM D")}
                    </span>
                    <span className="text-[#6F618F] text-[11px]">
                      {relativeDate(item.createdAt)}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="client-action-btn"
                      title="Open"
                      onClick={() => handleRowClick(item)}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      className="client-action-btn"
                      title="Edit"
                      onClick={(e) => handleEdit(item, e)}
                    >
                      <Pencil size={14} />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="client-action-btn" title="More">
                          <MoreVertical size={14} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {!item.researchTag && (
                          <>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePriorityChange(item._id, "High");
                              }}
                            >
                              Set Priority: High
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePriorityChange(item._id, "Urgent");
                              }}
                            >
                              Set Priority: Urgent
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePriorityChange(item._id, "Low");
                              }}
                            >
                              Set Priority: Low
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => handleAddToResearch(item._id, e)}
                              disabled={!selectedPriorities[item._id]}
                            >
                              Add to Research
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem
                          className="text-red-400"
                          onClick={(e) => handleDelete(item._id, e)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {hoveredRow && popoverAnchor && (
        <ClientPopover
          item={allEmp.find((i) => i._id === hoveredRow)}
          anchorEl={popoverAnchor}
        />
      )}

      <div className="client-pagination">
        <span>
          Showing <b className="text-white">{start}–{end}</b> of {totalClients || allEmp.length}
        </span>
        <div className="flex gap-1 items-center">
          <button
            className="client-page-btn"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(null, currentPage - 1)}
          >
            <ChevronLeft size={12} />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let page;
            if (totalPages <= 5) {
              page = i + 1;
            } else if (currentPage <= 3) {
              page = i + 1;
            } else if (currentPage >= totalPages - 2) {
              page = totalPages - 4 + i;
            } else {
              page = currentPage - 2 + i;
            }
            return (
              <button
                key={page}
                className={`client-page-btn ${page === currentPage ? "active" : ""}`}
                onClick={() => onPageChange(null, page)}
              >
                {page}
              </button>
            );
          })}
          <button
            className="client-page-btn"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(null, currentPage + 1)}
          >
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {editModal && (
        <AddCLient
          open={editModal}
          handleClose={() => setEditModal(false)}
          edit={true}
          editData={allEmp.find((i) => i._id === editId)}
          editEmp={editEmp}
        />
      )}
      {openModal && openItem && (
        <ClientDetails
          open={openModal}
          handleClose={() => {
            setOpenModal(false);
            setOpenItem(null);
          }}
          item={openItem}
          refreshData={refreshData}
        />
      )}
    </div>
  );
}

export default EmployeeTable;
