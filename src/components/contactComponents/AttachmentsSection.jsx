"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  File,
  FileText,
  Image,
  Video,
  Download,
  Trash2,
  MoreVertical,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import AddAttachmentDrawer from "./AddAttachmentDrawer";
import Swal from "sweetalert2";
import {
  deleteContactAttachment,
  getAttachmentDownloadUrl,
} from "@/utils/attachmentApi";

export default function AttachmentsSection({ contact, onUpdate }) {
  const [addAttachmentOpen, setAddAttachmentOpen] = useState(false);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState(null);
  const [downloadingAttachmentId, setDownloadingAttachmentId] = useState(null);

  const attachments = contact.attachments || [];

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith("image/")) return Image;
    if (mimeType?.startsWith("video/")) return Video;
    if (mimeType?.includes("pdf") || mimeType?.includes("document"))
      return FileText;
    return File;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };


  const handleDownload = async (attachmentId, fileName, fileUrl) => {
    try {
      setDownloadingAttachmentId(attachmentId);

      const result = await getAttachmentDownloadUrl(contact._id, attachmentId);

      if (result.success && result.data.downloadUrl) {
        const link = document.createElement("a");
        link.href = result.data.downloadUrl;
        link.download = fileName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(fileUrl, "_blank");
      }
    } catch (error) {
      console.error("Download error:", error);
      window.open(fileUrl, "_blank");
    } finally {
      setDownloadingAttachmentId(null);
    }
  };


  const handleDelete = async (attachmentId, fileName) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `This will permanently delete "${fileName}".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7C3AED",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setDeletingAttachmentId(attachmentId);

        const deleteResult = await deleteContactAttachment(
          contact._id,
          attachmentId
        );

        if (deleteResult.success) {
          Swal.fire({
            title: "Deleted!",
            text: "Attachment deleted successfully",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });

          if (onUpdate) {
            onUpdate();
          }
        }
      } catch (error) {
        console.error("Error deleting attachment:", error);
        Swal.fire(
          "Error",
          error.message || "Failed to delete attachment",
          "error"
        );
      } finally {
        setDeletingAttachmentId(null);
      }
    }
  };

  const handleOpenInNewTab = async (attachmentId, fileUrl) => {
    try {
      const result = await getAttachmentDownloadUrl(contact._id, attachmentId);

      if (result.success && result.data.downloadUrl) {
        window.open(result.data.downloadUrl, "_blank");
      } else {
        window.open(fileUrl, "_blank");
      }
    } catch (error) {
      console.error("Open file error:", error);
      window.open(fileUrl, "_blank");
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      contract: "bg-purple-500/20 text-purple-400 border-purple-500",
      proposal: "bg-blue-500/20 text-blue-400 border-blue-500",
      invoice: "bg-green-500/20 text-green-400 border-green-500",
      presentation: "bg-orange-500/20 text-orange-400 border-orange-500",
      image: "bg-pink-500/20 text-pink-400 border-pink-500",
      document: "bg-gray-500/20 text-gray-400 border-gray-500",
      other: "bg-gray-500/20 text-gray-400 border-gray-500",
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="bg-[#231C46] rounded-lg border border-[#2D2640] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Attachments</h2>
          <p className="text-sm text-gray-400 mt-1">
            {attachments.length} {attachments.length === 1 ? "file" : "files"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {attachments.length > 0 && (
            <Button
              onClick={onUpdate}
              variant="outline"
              size="sm"
              className="border-[#2D2640] text-gray-400 hover:text-white hover:bg-[#1F1833]"
              title="Refresh attachments"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={() => setAddAttachmentOpen(true)}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {attachments.length === 0 ? (
          <div className="text-center py-12">
            <File className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No attachments yet</p>
            <Button
              onClick={() => setAddAttachmentOpen(true)}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload First File
            </Button>
          </div>
        ) : (
          attachments.map((attachment, index) => {
            const FileIcon = getFileIcon(attachment.mimeType);
            const isDeleting = deletingAttachmentId === attachment._id;
            const isDownloading = downloadingAttachmentId === attachment._id;

            return (
              <Card
                key={attachment._id || index}
                className={`bg-[#0F0A1F] border-[#2D2640] p-4 hover:border-[#7C3AED] transition-colors ${
                  isDeleting ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded bg-[#2D2640] flex items-center justify-center flex-shrink-0">
                    <FileIcon className="h-6 w-6 text-[#7C3AED]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate mb-1">
                      {attachment.fileName}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                      <span>{formatFileSize(attachment.fileSize)}</span>
                      {attachment.category && (
                        <>
                          <span>•</span>
                          <Badge
                            className={`text-xs ${getCategoryColor(
                              attachment.category
                            )}`}
                          >
                            {attachment.category}
                          </Badge>
                        </>
                      )}
                      {attachment.uploadedAt && (
                        <>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(
                              new Date(attachment.uploadedAt),
                              {
                                addSuffix: true,
                              }
                            )}
                          </span>
                        </>
                      )}
                      {attachment.uploadedBy && (
                        <>
                          <span>•</span>
                          <span>
                            by{" "}
                            {typeof attachment.uploadedBy === "object"
                              ? `${attachment.uploadedBy.firstName} ${attachment.uploadedBy.lastName}`
                              : "Unknown"}
                          </span>
                        </>
                      )}
                    </div>
                    {attachment.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {attachment.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() =>
                        handleDownload(
                          attachment._id,
                          attachment.fileName,
                          attachment.fileUrl
                        )
                      }
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white h-8 w-8 p-0"
                      title="Download"
                      disabled={isDeleting || isDownloading}
                    >
                      {isDownloading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white h-8 w-8 p-0"
                          disabled={isDeleting}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() =>
                            handleDownload(
                              attachment._id,
                              attachment.fileName,
                              attachment.fileUrl
                            )
                          }
                          disabled={isDownloading}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleOpenInNewTab(attachment._id, attachment.fileUrl)
                          }
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in New Tab
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleDelete(attachment._id, attachment.fileName)
                          }
                          className="text-red-400 focus:text-red-400"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <AddAttachmentDrawer
        open={addAttachmentOpen}
        onClose={() => setAddAttachmentOpen(false)}
        contactId={contact._id}
        onSuccess={() => {
          setAddAttachmentOpen(false);
          if (onUpdate) {
            onUpdate();
          }
        }}
      />
    </div>
  );
}