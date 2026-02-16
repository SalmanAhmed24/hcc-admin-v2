"use client";
import useAuthStore from "@/store/store";
import React, { useState } from "react";
import { Drawer } from "@mui/material";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Select from "react-select"; 
import { X, Upload, FileIcon, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { 
  uploadContactAttachment, 
  uploadMultipleContactAttachments 
} from "@/utils/attachmentApi";

export default function AddAttachmentDrawer({ open, onClose, contactId, onSuccess }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [category, setCategory] = useState("document");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const id = user?.user?._id;
  const [inputValue, setInputValue] = useState("");
  

  const handleSelectReactInputChange = (e) => {
    setInputValue(e);
  };

const handleSelectReactChange = (value) => {
  setCategory(value);
   setInputValue('');
  };


  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        Swal.fire("Error", `File "${file.name}" exceeds 10MB limit`, "error");
        return false;
      }
      return true;
    });
    
    setSelectedFiles(validFiles);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      Swal.fire("Error", "Please select at least one file", "error");
      return;
    }

    try {
      setUploading(true);

      let result;
      
      if (selectedFiles.length === 1) {
        result = await uploadContactAttachment(
          contactId, 
          selectedFiles[0], 
          category, 
          description,
          id
        );
        
        if (result.success) {
          Swal.fire("Success", "File uploaded successfully", "success");
        }
      } else {
        result = await uploadMultipleContactAttachments(
          contactId, 
          selectedFiles, 
          category, 
          description,
          id
        );
        
        if (result.success) {
          const uploadedCount = result.data.totalUploaded;
          const failedCount = result.data.totalFailed;
          
          if (failedCount > 0) {
            Swal.fire(
              "Partial Success", 
              `${uploadedCount} file(s) uploaded, ${failedCount} failed`, 
              "warning"
            );
          } else {
            Swal.fire("Success", `${uploadedCount} file(s) uploaded successfully`, "success");
          }
        }
      }

      if (onSuccess) {
        onSuccess();
      }
      
      resetForm();
      onClose();

    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire("Error", error.message || "Failed to upload files", "error");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setCategory("document");
    setDescription("");
  };

  const handleClose = () => {
    if (!uploading) {
      resetForm();
      onClose();
    }
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#191526", 
      color: "white", 
      borderRadius: "12px",       
      padding: "5px",            
      borderColor: "#452C95",
      "&:hover": {
        borderColor: "darkviolet",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#191526",
      borderRadius: "12px",       
      padding: "5px", 
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "darkviolet" : "#191526", 
      color: "white",
      "&:hover": {
        backgroundColor: "darkviolet",
      },
      borderRadius: "12px",       
      padding: "5px",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "white", 
    }),
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: "600px", backgroundColor: "#231C46", color: "#fff" },
      }}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[#2D2640]">
          <h2 className="text-2xl font-bold text-white">Upload Attachment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <Label className="text-gray-300">Select Files *</Label>
            <div className="mt-2">
              <label
                htmlFor="attachment-files"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#2D2640] rounded-lg cursor-pointer hover:border-[#7C3AED] transition-colors bg-[#0F0A1F]"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-400">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">Any file up to 10MB</p>
                </div>
                <Input
                  id="attachment-files"
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-300">
                  Selected files ({selectedFiles.length}):
                </p>
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-[#0F0A1F] border border-[#2D2640] rounded px-3 py-2"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300 truncate">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeFile(idx)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 h-auto p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label className="text-gray-300">Category</Label>
            <Select
            options={[
              {value : "contract", label : "Contract"},
              {value : "proposal", label : "Proposal"},
              {value : "invoice", label : "Invoice"},
              {value : "image", label : "Image"},
              {value : "discovery form 1", label : "Discovery Form 1"},
              {value : "discovery form 2", label : "Discovery Form 2"},
              {value : "quote", label : "Quote"},
              {value : "documents", label : "Documents"},
              {value : "Presentation", label : "Presentation"},
              {value : "others", label : "Others"}
            ]}
            value={category ? {value : category, label : category} : null}
            onChange={(option) =>
                      handleSelectReactChange(option.value)
                    }
            inputValue={inputValue}
            onInputChange={handleSelectReactInputChange}
            className="bg-[#0F0A1F] border-[#2D2640] text-white"
            placeholder="Select Category"
            styles={customStyles}
            id="category-select-cus"
            name="Status"

            />
          </div>

          <div>
            <Label className="text-gray-300">Description (Optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-[#0F0A1F] border-[#2D2640] text-white"
              placeholder="Add a description for this file..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#2D2640]">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-[#2D2640] text-gray-300 hover:bg-[#1F1833]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={uploading || selectedFiles.length === 0}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}