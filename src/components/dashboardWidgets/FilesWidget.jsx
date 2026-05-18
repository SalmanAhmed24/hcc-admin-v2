"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { apiPath } from "@/utils/routes";
import useAuthStore from "@/store/store";
import moment from "moment";
import Swal from "sweetalert2";
import { ChevronDown, Upload, ArrowRight, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddUserFiles from "@/components/subcomponents/drawers/addUserFiles";
import NewFilePreviewDrawer from "@/components/Viewer/NewFilePreviewer";
import { useRouter } from "next/navigation";

function getFileExtension(filename) {
  if (!filename) return "";
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

function getFileTypeInfo(filename) {
  const ext = getFileExtension(filename);
  const map = {
    pdf: { label: "PDF", className: "fw-thumb-pdf" },
    doc: { label: "DOC", className: "fw-thumb-doc" },
    docx: { label: "DOC", className: "fw-thumb-doc" },
    xls: { label: "XLS", className: "fw-thumb-xls" },
    xlsx: { label: "XLS", className: "fw-thumb-xls" },
    csv: { label: "CSV", className: "fw-thumb-xls" },
    png: { label: "IMG", className: "fw-thumb-img" },
    jpg: { label: "IMG", className: "fw-thumb-img" },
    jpeg: { label: "IMG", className: "fw-thumb-img" },
    gif: { label: "IMG", className: "fw-thumb-img" },
    svg: { label: "SVG", className: "fw-thumb-img" },
    webp: { label: "IMG", className: "fw-thumb-img" },
    mp4: { label: "VID", className: "fw-thumb-vid" },
    mov: { label: "VID", className: "fw-thumb-vid" },
    txt: { label: "TXT", className: "fw-thumb-txt" },
    ppt: { label: "PPT", className: "fw-thumb-ppt" },
    pptx: { label: "PPT", className: "fw-thumb-ppt" },
    zip: { label: "ZIP", className: "fw-thumb-zip" },
    rar: { label: "RAR", className: "fw-thumb-zip" },
  };
  return map[ext] || { label: ext.toUpperCase() || "FILE", className: "fw-thumb-default" };
}

function stripExtension(filename) {
  if (!filename) return "";
  const lastDot = filename.lastIndexOf(".");
  return lastDot > 0 ? filename.substring(0, lastDot) : filename;
}

function FileRow({ item, onPreview, onDelete }) {
  const typeInfo = getFileTypeInfo(item.filename);
  const dateLabel = item.date ? moment(item.date).fromNow() : "";

  return (
    <div className="fw-file-row" onClick={() => onPreview(item)}>
      <div className={`fw-file-thumb ${typeInfo.className}`}>{typeInfo.label}</div>
      <div className="fw-file-content">
        <div className="fw-file-name">{stripExtension(item.filename)}</div>
        <div className="fw-file-meta">
          {item.user?.fullname || "Unknown"} · <b>{item.date ? moment(item.date).format("MMM D") : ""}</b>
          {item.tag?.length > 0 && (
            <span className="fw-file-tags">
              {item.tag.slice(0, 2).map((tag, i) => (
                <span key={i} className="fw-file-tag">{tag}</span>
              ))}
            </span>
          )}
        </div>
      </div>
      <div className="fw-file-date">{dateLabel}</div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="fw-file-action" onClick={(e) => e.stopPropagation()}>
            <MoreVertical size={13} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPreview(item); }}>
            Preview
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(item); }} className="text-red-400">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function FilesWidget() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.user?._id || "";
  const username = user?.user?.username || "";
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("User");
  const [files, setFiles] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [totalFiles, setTotalFiles] = useState(0);

  const [fileModal, setFileModal] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const scrollRef = useRef(null);
  const LIMIT = 8;

  const getUrl = useCallback((tab) => {
    if (tab === "User") return `${apiPath.prodPath}/api/files/getFileByUser/${userId}`;
    if (tab === "Shared") return `${apiPath.prodPath}/api/files/getAllSharedFiles/${username}`;
    return `${apiPath.prodPath}/api/files/getAllCommonFiles/`;
  }, [userId, username]);

  const fetchFiles = useCallback(async (tab, pageNum = 1, append = false) => {
    if ((tab === "User" || tab === "Shared") && !userId) return;
    setLoading(true);
    try {
      const url = getUrl(tab);
      const res = await axios.get(url, { params: { page: pageNum, limit: LIMIT } });
      const payload = res.data;
      const newFiles = Array.isArray(payload) ? payload : (payload.files || []);
      const pagination = payload.pagination || {};
      const total = pagination.total || newFiles.length;

      if (append && pageNum > 1) {
        setFiles((prev) => [...prev, ...newFiles]);
      } else {
        setFiles(newFiles);
      }
      setTotalFiles(total);
      setHasMore(pageNum < (pagination.totalPages || 1));
    } catch (err) {
      console.error("Failed to fetch files:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, username, getUrl]);

  useEffect(() => {
    setPage(1);
    setFiles([]);
    if (userId || activeTab === "Common") {
      fetchFiles(activeTab, 1);
    }
  }, [activeTab, userId, fetchFiles]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || loading || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFiles(activeTab, nextPage, true);
    }
  }, [loading, hasMore, page, activeTab, fetchFiles]);

  const handlePreview = (item) => {
    setPreviewFile(item);
    setPreviewOpen(true);
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
              refreshFiles();
            }
          })
          .catch(() => {
            Swal.fire({ icon: "error", text: "Failed to delete file" });
          });
      }
    });
  };

  const refreshFiles = () => {
    setPage(1);
    fetchFiles(activeTab, 1);
  };

  const tabs = [
    { key: "User", label: "User" },
    { key: "Shared", label: "Shared" },
    { key: "Common", label: "Common" },
  ];

  return (
    <>
      <style jsx global>{`
        .fw-file-tabs {
          display: flex; gap: 4px; padding: 10px 16px 6px;
          border-bottom: 1px solid rgba(69,44,149,.12);
        }
        .fw-file-tab {
          padding: 6px 12px; border-radius: 8px;
          background: transparent; border: 0;
          font-size: 12px; font-weight: 500;
          color: #A99BD4; cursor: pointer; transition: all .15s;
        }
        .fw-file-tab:hover { color: #fff; background: rgba(127,86,217,.12); }
        .fw-file-tab.active { background: rgba(127,86,217,.22); color: #fff; }

        .fw-scroll-area { max-height: 380px; overflow-y: auto; padding: 8px 12px 12px 16px; }
        .fw-scroll-area::-webkit-scrollbar { width: 4px; }
        .fw-scroll-area::-webkit-scrollbar-track { background: transparent; }
        .fw-scroll-area::-webkit-scrollbar-thumb { background: rgba(127,86,217,.3); border-radius: 4px; }

        .fw-file-row {
          display: grid; grid-template-columns: 36px 1fr auto 24px;
          gap: 12px; align-items: center;
          padding: 8px 12px; border-radius: 10px;
          transition: background .15s; cursor: pointer;
        }
        .fw-file-row:hover { background: rgba(127,86,217,.1); }

        .fw-file-thumb {
          width: 36px; height: 36px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 9.5px; font-weight: 800; letter-spacing: .08em;
          flex-shrink: 0;
        }
        .fw-thumb-pdf { background: linear-gradient(135deg, #F87171, #B91C1C); }
        .fw-thumb-doc { background: linear-gradient(135deg, #60A5FA, #1D4ED8); }
        .fw-thumb-xls { background: linear-gradient(135deg, #34D399, #047857); }
        .fw-thumb-img { background: linear-gradient(135deg, #C084FC, #7E22CE); }
        .fw-thumb-vid { background: linear-gradient(135deg, #FB923C, #C2410C); }
        .fw-thumb-ppt { background: linear-gradient(135deg, #FB923C, #C2410C); }
        .fw-thumb-txt { background: linear-gradient(135deg, #94A3B8, #475569); }
        .fw-thumb-zip { background: linear-gradient(135deg, #FCD34D, #B45309); }
        .fw-thumb-default { background: linear-gradient(135deg, #6B7280, #374151); }

        .fw-file-content { min-width: 0; line-height: 1.3; }
        .fw-file-name {
          font-size: 13px; font-weight: 500; color: #fff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .fw-file-meta { font-size: 11px; color: #6F618F; margin-top: 1px; }
        .fw-file-meta b { color: #A99BD4; font-weight: 400; }
        .fw-file-tags { display: inline-flex; gap: 4px; margin-left: 6px; }
        .fw-file-tag {
          font-size: 9.5px; font-weight: 500;
          padding: 1px 6px; border-radius: 9999px;
          background: rgba(127,86,217,.15); border: 1px solid rgba(127,86,217,.35);
          color: #B797FF;
        }
        .fw-file-date {
          font-family: monospace; font-size: 10.5px;
          color: #A99BD4; white-space: nowrap;
        }
        .fw-file-action {
          width: 24px; height: 24px; border-radius: 6px;
          background: transparent; border: 0; color: #6F618F;
          display: inline-flex; align-items: center; justify-content: center;
          opacity: 0; transition: all .15s; cursor: pointer;
        }
        .fw-file-row:hover .fw-file-action { opacity: 1; }
        .fw-file-action:hover { background: rgba(127,86,217,.2); color: #fff; }

        .fw-foot {
          padding: 10px 14px 14px;
          border-top: 1px solid rgba(69,44,149,.12);
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
        }
        .fw-foot-cta {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 12px; border-radius: 9px;
          background: rgba(127,86,217,.15); border: 1px solid rgba(69,44,149,.3);
          color: #B797FF; font-weight: 600; font-size: 12px;
          cursor: pointer; transition: all .15s;
        }
        .fw-foot-cta:hover { background: rgba(127,86,217,.28); color: #fff; }
        .fw-foot-link {
          background: transparent; border: 0; color: #6F618F;
          font-size: 12px; cursor: pointer;
          display: inline-flex; align-items: center; gap: 4px;
        }
        .fw-foot-link:hover { color: #B797FF; }
        .fw-loading-indicator {
          text-align: center; padding: 8px; font-size: 11px; color: #6F618F;
        }
        .fw-empty { padding: 24px 14px; color: #6F618F; font-size: 12.5px; text-align: center; }
      `}</style>

      {/* Tabs */}
      <div className="fw-file-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`fw-file-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* File list with infinite scroll */}
      <div className="fw-scroll-area" ref={scrollRef} onScroll={handleScroll}>
        {files.length > 0 ? (
          files.map((item) => (
            <FileRow
              key={item._id}
              item={item}
              onPreview={handlePreview}
              onDelete={handleDelete}
            />
          ))
        ) : !loading ? (
          <div className="fw-empty">No files found</div>
        ) : null}
        {loading && <div className="fw-loading-indicator">Loading...</div>}
      </div>

      {/* Footer */}
      <div className="fw-foot">
        <button className="fw-foot-cta" onClick={() => setFileModal(true)}>
          <Upload size={14} /> Upload file
        </button>
        <button className="fw-foot-link" onClick={() => router.push("/files")}>
          View all files <ArrowRight size={14} />
        </button>
      </div>

      {/* Drawers */}
      <AddUserFiles
        open={fileModal}
        handleClose={() => { setFileModal(false); refreshFiles(); }}
        refreshData={refreshFiles}
      />
      {previewOpen && previewFile && (
        <NewFilePreviewDrawer
          open={previewOpen}
          handleClose={() => { setPreviewOpen(false); setPreviewFile(null); }}
          item={previewFile}
          previewOpen={previewOpen}
        />
      )}
    </>
  );
}
