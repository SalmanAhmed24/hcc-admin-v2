import React, { useState, useEffect } from "react";
import { apiPath } from "@/utils/routes";
import {
  Edit2Icon,
  Share2Icon,
  Trash2Icon,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
import Swal from "sweetalert2";
import axios from "axios";
import AddUserFiles from "../drawers/addUserFiles";
import NewFilePreviewDrawer from "@/components/Viewer/NewFilePreviewer";
import ShareFile from "../drawers/shareWithDrawer";
import moment from "moment";

function getFileExtension(filename) {
  if (!filename) return "";
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

function getFileTypeInfo(filename) {
  const ext = getFileExtension(filename);
  const map = {
    pdf: { label: "PDF", className: "file-thumb-pdf" },
    doc: { label: "DOC", className: "file-thumb-doc" },
    docx: { label: "DOC", className: "file-thumb-doc" },
    xls: { label: "XLS", className: "file-thumb-xls" },
    xlsx: { label: "XLS", className: "file-thumb-xls" },
    csv: { label: "CSV", className: "file-thumb-xls" },
    png: { label: "IMG", className: "file-thumb-img" },
    jpg: { label: "IMG", className: "file-thumb-img" },
    jpeg: { label: "IMG", className: "file-thumb-img" },
    gif: { label: "IMG", className: "file-thumb-img" },
    svg: { label: "SVG", className: "file-thumb-img" },
    webp: { label: "IMG", className: "file-thumb-img" },
    mp4: { label: "VID", className: "file-thumb-vid" },
    mov: { label: "VID", className: "file-thumb-vid" },
    txt: { label: "TXT", className: "file-thumb-txt" },
    zip: { label: "ZIP", className: "file-thumb-zip" },
    rar: { label: "RAR", className: "file-thumb-zip" },
  };
  return map[ext] || { label: ext.toUpperCase() || "FILE", className: "file-thumb-default" };
}

function stripExtension(filename) {
  if (!filename) return "";
  const lastDot = filename.lastIndexOf(".");
  return lastDot > 0 ? filename.substring(0, lastDot) : filename;
}

function FileGridPagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) {
  if (totalPages <= 1) return null;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const pages = [];
  for (let i = 1; i <= Math.min(totalPages, 5); i++) pages.push(i);

  return (
    <div className="file-grid-pagination">
      <span>
        Showing <b style={{ color: "#fff" }}>{startItem}–{endItem}</b> of {totalItems}
      </span>
      <div className="file-grid-page-controls">
        <button
          className="file-grid-page-btn"
          onClick={() => onPageChange(null, Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={12} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            className={`file-grid-page-btn ${p === currentPage ? "active" : ""}`}
            onClick={() => onPageChange(null, p)}
          >
            {p}
          </button>
        ))}
        <button
          className="file-grid-page-btn"
          onClick={() => onPageChange(null, Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

function FileTable({ picklistData, refreshData, picklistName }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [fileModal, setFileModal] = useState(false);
  const [editAttachments, setEditAttachments] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [shareDrawerOpen, setShareDrawerOpen] = useState(false);
  const [shareItem, setShareItem] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const itemsPerPage = 8;

  useEffect(() => {
    if (picklistData && picklistData.length > 0) {
      console.log("Data received:", picklistData.map((i) => i.user?.fullname || "No user"));
    }
  }, [picklistData]);

  const getFilteredData = () => {
    if (picklistName === "Common Files") {
      return (picklistData || []).filter((item) => item.tag?.includes("common"));
    }
    return picklistData || [];
  };

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const onPageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleDelete = (item) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${apiPath.prodPath}/api/files/deleteFile/${item._id}`)
          .then((res) => {
            if (res.status === 200 || res.status === 201) {
              Swal.fire({ title: "Deleted!", text: "Your file has been deleted.", icon: "success" });
              refreshData();
            }
          })
          .catch((err) => {
            console.log(err);
            Swal.fire({ icon: "error", text: "Failed to delete file" });
          });
      }
    });
  };

  const handleShareClick = (item) => {
    setShareItem(item);
    setShareDrawerOpen(true);
  };

  const handlePreviewClick = (item) => {
    setSelectedItem(item);
    setPreviewFile(item);
    setPreviewOpen(true);
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setEditAttachments(true);
    setFileModal(true);
  };

  if (!picklistData || picklistData.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="flex flex-row items-center gap-2 mb-4">
          <Button
            className="bg-[#452C95] w-1/3 text-white hover:bg-[#452C95] hover:opacity-80"
            onClick={() => refreshData()}
          >
            Refresh
          </Button>
        </div>
        <p className="text-white">No files found for {picklistName}</p>
      </div>
    );
  }

  const canEdit = picklistName === "User Files" || picklistName === "Common Files";
  const canShare = picklistName === "User Files";

  const renderGridView = () => (
    <div className="file-grid-container">
      {currentItems.map((item) => {
        const typeInfo = getFileTypeInfo(item.filename);
        return (
          <TooltipProvider key={item._id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="file-tile"
                  onClick={() => handlePreviewClick(item)}
                >
                  <div className="file-tile-header">
                    <div className={`file-thumb ${typeInfo.className}`}>
                      {typeInfo.label}
                    </div>
                    {canEdit && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="file-tile-menu"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical size={14} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handlePreviewClick(item)}>
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(item)}>
                            Edit
                          </DropdownMenuItem>
                          {canShare && (
                            <DropdownMenuItem onClick={() => handleShareClick(item)}>
                              Share
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(item)}
                            className="text-red-400"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <div className="file-tile-name">{stripExtension(item.filename)}</div>
                  <div className="file-tile-meta">
                    <span>{item.user?.fullname || "Unknown"}</span>
                    <span>{item.date ? moment(item.date).format("MMM D") : ""}</span>
                  </div>
                  {item.tag?.length > 0 && (
                    <div className="file-tile-tags">
                      {item.tag.slice(0, 3).map((tag, i) => (
                        <span key={i} className="file-tag-chip">
                          {tag}
                        </span>
                      ))}
                      {item.tag.length > 3 && (
                        <span className="file-tag-chip file-tag-more">
                          +{item.tag.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              {item.note && item.note !== "N/A" && (
                <TooltipContent>
                  <p className="max-w-[200px] text-xs">{item.note}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="modern-table-wrap">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Uploaded By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead style={{ textAlign: "right", paddingRight: 18 }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((item) => {
            const typeInfo = getFileTypeInfo(item.filename);
            return (
              <TableRow className="modern-table-row" key={item._id}>
                <TableCell>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      className={`file-list-icon ${typeInfo.className}`}
                    >
                      {typeInfo.label}
                    </div>
                    <div className="modern-id-stack">
                      <div className="modern-id-name" style={{ maxWidth: 240 }}>
                        {stripExtension(item.filename)}
                      </div>
                      <div className="modern-id-meta">
                        .{getFileExtension(item.filename)}
                        {item.note && item.note !== "N/A" ? ` · ${item.note}` : ""}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="modern-chip chip-violet" style={{ cursor: "default" }}>
                    {item.attachmentCategories || "Uncategorized"}
                  </span>
                </TableCell>
                <TableCell>
                  <span style={{ fontSize: "12.5px", color: "#E1C9FF" }}>
                    {item.user?.fullname || "Unknown"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="modern-date-cell">
                    <span className="modern-date-primary">
                      {item.date ? moment(item.date).format("MMM D") : "N/A"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {item.tag?.length > 0 ? (
                      item.tag.slice(0, 3).map((tag, i) => (
                        <span key={i} className="file-tag-chip">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: "rgba(169,155,212,0.4)", fontSize: 11 }}>
                        No tags
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                    <button className="modern-icon-btn" onClick={() => handlePreviewClick(item)}>
                      <Eye size={14} />
                    </button>
                    {canEdit && (
                      <button className="modern-icon-btn" onClick={() => handleEditClick(item)}>
                        <Edit2Icon size={14} />
                      </button>
                    )}
                    {canShare && (
                      <button className="modern-icon-btn" onClick={() => handleShareClick(item)}>
                        <Share2Icon size={14} />
                      </button>
                    )}
                    {canEdit && (
                      <button
                        className="modern-icon-btn modern-icon-btn-danger"
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2Icon size={14} />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div>
      <style jsx global>{`
        /* ── Modern table tokens (shared with taskTable) ─── */
        .modern-table-wrap {
          background: rgba(28,22,52,.85);
          border: 1px solid rgba(69,44,149,.22);
          border-radius: 16px;
          overflow: hidden;
        }
        .modern-table-wrap table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .modern-table-wrap thead th {
          text-align: left; padding: 10px 14px;
          font-family: inherit; font-weight: 600; font-size: 10.5px;
          text-transform: uppercase; letter-spacing: .12em;
          color: rgba(169,155,212,0.5);
          background: rgba(20,15,43,.55);
          border-bottom: 1px solid rgba(69,44,149,.22);
          position: sticky; top: 0; z-index: 1; white-space: nowrap;
        }
        .modern-table-row { transition: background .15s; cursor: pointer; }
        .modern-table-row:hover { background: rgba(127,86,217,.08) !important; }
        .modern-table-row td {
          padding: 14px 14px; vertical-align: middle;
          border-bottom: 1px solid rgba(69,44,149,.12);
          font-size: 13px; color: rgba(255,255,255,.87);
        }
        .modern-table-row:last-child td { border-bottom: 0; }
        .modern-id-stack { min-width: 0; line-height: 1.3; }
        .modern-id-name { font-weight: 600; color: #fff; font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .modern-id-meta { font-size: 11px; color: rgba(169,155,212,0.6); margin-top: 2px; }
        .modern-date-cell { display: flex; flex-direction: column; line-height: 1.25; }
        .modern-date-primary { color: #fff; font-size: 13px; }
        .modern-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 2px 9px; border-radius: 9999px;
          font-size: 11px; font-weight: 500; border: 1px solid;
          white-space: nowrap;
        }
        .chip-violet { background: rgba(127,86,217,.15); border-color: rgba(127,86,217,.35); color: #E1C9FF; }
        .modern-icon-btn {
          width: 30px; height: 30px; border-radius: 8px;
          background: transparent; border: 1px solid transparent;
          color: rgba(169,155,212,0.6);
          display: inline-flex; align-items: center; justify-content: center;
          transition: all .15s; cursor: pointer;
        }
        .modern-icon-btn:hover { background: rgba(127,86,217,.18); color: #fff; border-color: rgba(127,86,217,.3); }
        .modern-icon-btn-danger:hover { background: rgba(248,113,113,.15); color: #FCA5A5; border-color: rgba(248,113,113,.35); }

        /* ── View toggle toolbar ──────────────────────────── */
        .file-toolbar {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 16px;
        }
        .file-view-toggle {
          display: inline-flex; gap: 2px; padding: 3px;
          background: rgba(20,15,43,.7); border: 1px solid rgba(127,86,217,.35);
          border-radius: 9999px; margin-left: auto;
        }
        .file-view-toggle button {
          background: transparent; border: 0; color: rgba(169,155,212,0.6);
          padding: 5px 10px; border-radius: 9999px; font-size: 11px;
          cursor: pointer; display: inline-flex; align-items: center; gap: 4px;
          transition: all .15s;
        }
        .file-view-toggle button.active {
          background: rgba(127,86,217,.3); color: #fff;
        }
        .file-view-toggle button:hover:not(.active) { color: #fff; }

        /* ── File grid ────────────────────────────────────── */
        .file-grid-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        @media (max-width: 1200px) { .file-grid-container { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 900px)  { .file-grid-container { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px)  { .file-grid-container { grid-template-columns: 1fr; } }

        .file-tile {
          background: rgba(45,36,91,.6);
          border: 1px solid rgba(69,44,149,.4);
          border-radius: 12px; padding: 14px;
          display: flex; flex-direction: column; gap: 10px;
          transition: all .15s; cursor: pointer;
        }
        .file-tile:hover {
          background: rgba(127,86,217,.12);
          border-color: rgba(127,86,217,.5);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px -8px rgba(0,0,0,.4);
        }
        .file-tile-header { position: relative; }
        .file-tile-menu {
          position: absolute; top: 0; right: 0;
          width: 28px; height: 28px; border-radius: 8px;
          background: rgba(20,15,43,.7); border: 1px solid rgba(69,44,149,.5);
          color: rgba(169,155,212,0.6);
          display: inline-flex; align-items: center; justify-content: center;
          cursor: pointer; opacity: 0; transition: opacity .15s;
        }
        .file-tile:hover .file-tile-menu { opacity: 1; }
        .file-tile-menu:hover { color: #fff; border-color: rgba(127,86,217,.5); }

        .file-thumb {
          aspect-ratio: 4/3; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; letter-spacing: .1em; color: #fff;
        }
        .file-thumb-pdf { background: linear-gradient(135deg, #F87171, #B91C1C); }
        .file-thumb-doc { background: linear-gradient(135deg, #60A5FA, #1D4ED8); }
        .file-thumb-xls { background: linear-gradient(135deg, #34D399, #047857); }
        .file-thumb-img { background: linear-gradient(135deg, #C084FC, #7E22CE); }
        .file-thumb-vid { background: linear-gradient(135deg, #FB923C, #C2410C); }
        .file-thumb-txt { background: linear-gradient(135deg, #A1A1AA, #52525B); }
        .file-thumb-zip { background: linear-gradient(135deg, #FCD34D, #B45309); }
        .file-thumb-default { background: linear-gradient(135deg, #6B7280, #374151); }

        .file-list-icon {
          width: 36px; height: 36px; border-radius: 8px;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 700; letter-spacing: .08em; color: #fff; flex-shrink: 0;
        }

        .file-tile-name {
          font-size: 13px; color: #fff; font-weight: 600;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .file-tile-meta {
          font-size: 11px; color: rgba(169,155,212,0.5);
          display: flex; justify-content: space-between;
        }
        .file-tile-tags { display: flex; gap: 5px; flex-wrap: wrap; }
        .file-tag-chip {
          display: inline-flex; padding: 1px 6px; border-radius: 9999px;
          font-size: 9.5px; font-weight: 500;
          background: rgba(127,86,217,.15); border: 1px solid rgba(127,86,217,.35);
          color: #E1C9FF;
        }
        .file-tag-more {
          background: rgba(111,97,143,.2); border-color: rgba(111,97,143,.4);
          color: #A99BD4;
        }

        /* ── File grid pagination ─────────────────────────── */
        .file-grid-pagination {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 0 0; font-size: 12px; color: rgba(169,155,212,0.5);
        }
        .file-grid-page-controls { display: flex; gap: 4px; align-items: center; }
        .file-grid-page-btn {
          width: 28px; height: 28px; border-radius: 8px;
          background: rgba(127,86,217,.08); border: 1px solid rgba(127,86,217,.3);
          color: #E1C9FF; display: inline-flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background .15s; font-size: 12px;
        }
        .file-grid-page-btn:hover { background: rgba(127,86,217,.2); }
        .file-grid-page-btn.active { background: #B797FF; color: #1C1633; border-color: #B797FF; font-weight: 700; }
        .file-grid-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      <div className="flex flex-row items-center gap-2 mb-4">
        <Button
          className="bg-[#452C95] text-white hover:bg-[#452C95] hover:opacity-80"
          onClick={() => refreshData()}
        >
          Refresh
        </Button>
        <div className="file-view-toggle">
          <button
            className={viewMode === "list" ? "active" : ""}
            onClick={() => setViewMode("list")}
          >
            <LayoutList size={13} /> List
          </button>
          <button
            className={viewMode === "grid" ? "active" : ""}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid size={13} /> Grid
          </button>
        </div>
      </div>

      {viewMode === "grid" ? renderGridView() : renderListView()}

      <FileGridPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredData.length}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
      />

      {fileModal && editAttachments && selectedItem && (
        <AddUserFiles
          open={fileModal}
          handleClose={() => {
            setFileModal(false);
            setEditAttachments(false);
            setSelectedItem(null);
          }}
          refreshData={refreshData}
          editAttachments={editAttachments}
          item={selectedItem}
        />
      )}

      {previewOpen && previewFile && (
        <NewFilePreviewDrawer
          open={previewOpen}
          handleClose={() => {
            setPreviewOpen(false);
            setPreviewFile(null);
          }}
          item={previewFile}
          previewOpen={previewOpen}
        />
      )}

      {shareDrawerOpen && shareItem && (
        <ShareFile
          open={shareDrawerOpen}
          handleClose={() => {
            setShareDrawerOpen(false);
            setShareItem(null);
          }}
          item={shareItem}
        />
      )}
    </div>
  );
}

export default FileTable;
