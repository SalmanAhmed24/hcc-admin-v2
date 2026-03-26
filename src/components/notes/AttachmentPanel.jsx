/**
 * ============================================================
 * ATTACHMENT PANEL — components/notes/AttachmentPanel.jsx
 * ============================================================
 *
 * Slide-up panel for viewing, adding, and removing file attachments.
 * Uses react-dropzone for drag-drop and tap-to-upload on tablets.
 * Shows a thumbnail grid for images and a file list for documents.
 * ============================================================
 */

"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Paperclip,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Trash2,
  Loader2,
} from "lucide-react";
import { useNoteStore } from "@/store/noteStore";
import { useAttachments } from "@/hooks/useNotes";
import useAuthStore from "@/store/store";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const formatBytes = (bytes) => {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const isImageType = (mimeType) =>
  ["image/jpeg", "image/png", "image/webp", "image/gif", "image/tiff"].includes(
    mimeType
  );

// ─────────────────────────────────────────────
// PENDING FILE CHIP
// Shows a file that's been selected but not yet uploaded.
// ─────────────────────────────────────────────
const PendingFileChip = ({ file, progress, onRemove }) => (
  <div
    className="flex items-center gap-2 rounded-lg px-2.5 py-2"
    style={{ background: "#111520", border: "1px solid #1e2538" }}
  >
    <div
      className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
      style={{ background: "#d9770610", border: "1px solid #d9770630" }}
    >
      {isImageType(file.type) ? (
        <ImageIcon size={13} style={{ color: "#d97706" }} />
      ) : (
        <FileText size={13} style={{ color: "#d97706" }} />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p
        className="text-xs font-medium truncate"
        style={{ color: "#94a3b8" }}
      >
        {file.name}
      </p>
      <div className="flex items-center gap-2 mt-0.5">
        <p className="text-xs" style={{ color: "#334155" }}>
          {formatBytes(file.size)}
        </p>
        {progress != null && (
          <div
            className="flex-1 h-1 rounded-full overflow-hidden"
            style={{ background: "#1e2538", maxWidth: 60 }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                background: "#d97706",
              }}
            />
          </div>
        )}
      </div>
    </div>
    {progress == null && (
      <button
        type="button"
        onClick={() => onRemove(file.name)}
        className="p-0.5 rounded transition-colors hover:bg-white/5"
        style={{ color: "#334155" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#334155")}
      >
        <X size={13} />
      </button>
    )}
    {progress === 100 && (
      <Loader2 size={13} style={{ color: "#d97706" }} className="animate-spin" />
    )}
  </div>
);

// ─────────────────────────────────────────────
// ATTACHMENT ITEM (uploaded / saved)
// ─────────────────────────────────────────────
const AttachmentItem = ({ attachment, noteId, onDeleted }) => {
  const { removeAttachment, isDeleting } = useAttachments(noteId);
  const isImage = isImageType(attachment.mimeType);
  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.user._id;

  const handleDelete = async () => {
    if (!confirm(`Remove "${attachment.originalName}"?`)) return;
    await removeAttachment(attachment._id, currentUserId);
    onDeleted?.();
  };

  return (
    <div
      className="group flex items-center gap-2.5 rounded-lg p-2 transition-colors"
      style={{ border: "1px solid #1a2035", background: "#0d1120" }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "#2a3045")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "#1a2035")
      }
    >
      {/* Thumbnail or file icon */}
      {isImage && attachment.thumbnailUrl ? (
        <div
          className="w-10 h-10 rounded-md flex-shrink-0 overflow-hidden"
          style={{ border: "1px solid #1e2538" }}
        >
          <img
            src={attachment.thumbnailUrl}
            alt={attachment.originalName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div
          className="w-10 h-10 rounded-md flex-shrink-0 flex items-center justify-center"
          style={{ background: "#111520", border: "1px solid #1e2538" }}
        >
          <FileText size={16} style={{ color: "#334155" }} />
        </div>
      )}

      {/* Name + size */}
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-medium truncate"
          style={{ color: "#94a3b8" }}
          title={attachment.originalName}
        >
          {attachment.originalName}
        </p>
        <p className="text-xs" style={{ color: "#334155" }}>
          {formatBytes(attachment.sizeBytes)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {attachment.url && (
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded transition-colors hover:bg-white/5"
            style={{ color: "#475569" }}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={13} />
          </a>
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-1 rounded transition-colors hover:bg-red-950/30"
          style={{ color: "#475569" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// ATTACHMENT PANEL (MAIN EXPORT)
// ─────────────────────────────────────────────
export default function AttachmentPanel({ note, isOpen }) {
  const {
    pendingFiles,
    addPendingFiles,
    removePendingFile,
    uploadProgress,
  } = useNoteStore();

  const savedAttachments = note?.attachments || [];

  const onDrop = useCallback(
    (acceptedFiles) => {
      addPendingFiles(acceptedFiles);
    },
    [addPendingFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 25 * 1024 * 1024, // 25MB
    maxFiles: 10,
  });

  if (!isOpen) return null;

  return (
    <div
      className="flex flex-col"
      style={{
        borderTop: "1px solid #1a2035",
        background: "#0c0f18",
        maxHeight: 320,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: "1px solid #1a2035" }}
      >
        <Paperclip size={13} style={{ color: "#64748b" }} />
        <span className="text-xs font-semibold" style={{ color: "#94a3b8" }}>
          Attachments
        </span>
        <span className="text-xs" style={{ color: "#334155" }}>
          {savedAttachments.length + pendingFiles.length} / 20
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {/* Drop zone */}
        <div
          {...getRootProps()}
          className="rounded-xl p-4 text-center cursor-pointer transition-all duration-200"
          style={{
            border: isDragActive
              ? "2px dashed #d97706"
              : "2px dashed #1e2538",
            background: isDragActive ? "#d9770608" : "transparent",
          }}
        >
          <input {...getInputProps()} />
          <Upload
            size={20}
            className="mx-auto mb-2"
            style={{ color: isDragActive ? "#d97706" : "#334155" }}
          />
          <p className="text-xs" style={{ color: "#475569" }}>
            {isDragActive
              ? "Drop files here"
              : "Tap to add files or drag and drop"}
          </p>
          <p className="text-xs mt-1" style={{ color: "#1e2538", fontSize: "10px" }}>
            Images, PDF, Word · Max 25MB each · 10 files per save
          </p>
        </div>

        {/* Pending (not yet uploaded) */}
        {pendingFiles.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium px-0.5" style={{ color: "#475569" }}>
              Queued — saves with next note save
            </p>
            {pendingFiles.map((file) => (
              <PendingFileChip
                key={file.name}
                file={file}
                progress={uploadProgress[file.name] ?? null}
                onRemove={removePendingFile}
              />
            ))}
          </div>
        )}

        {/* Saved attachments - FIXED KEYS HERE */}
        {savedAttachments.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium px-0.5" style={{ color: "#475569" }}>
              Attached files
            </p>
            {savedAttachments.map((att) => {
              // Create a guaranteed unique key
              const uniqueKey = att.id 
                ? `att-${att.id}` 
                : `att-temp-${att.originalName}-${att.sizeBytes}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              
              return (
                <AttachmentItem
                  key={uniqueKey}
                  attachment={att}
                  noteId={note?.id}
                  onDeleted={() => {
                    // Optional: Add any refresh logic here if needed
                  }}
                />
              );
            })}
          </div>
        )}

        {savedAttachments.length === 0 && pendingFiles.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: "#1e2538" }}>
            No files attached yet
          </p>
        )}
      </div>
    </div>
  );
}