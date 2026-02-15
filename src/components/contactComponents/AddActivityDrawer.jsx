"use client";

import React, { useEffect, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { ADD_ACTIVITY, UPDATE_ACTIVITY } from "@/graphql/contactMutations";
import { uploadFiles } from "@/utils/fileUpload";
import { Drawer } from "@mui/material";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Select from "react-select";

import { X, Upload, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

export default function AddActivityDrawer({
  edit,
  activity,
  open,
  onClose,
  contactId,
  activityType = "note",
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    type: activityType,
    direction: "outbound",
    subject: "",
    htmlBody : "",
    body:  "",
    callDuration : "",
    callOutcome: "",
    callRecordingUrl : "",
    meetingDuration:  "",
    meetingLocation:  "",
    meetingLink:  "",
    meetingAttendees:  "",
    taskPriority:  "medium",
    taskDueDate: "",
    emailFrom:  "",
    emailTo: "",
    emailCc:  "",
    emailBcc:  "",
    status: "completed",
    scheduledAt: "",
    completedAt: "",
    associatedDeal : "",
    associatedTicket : "",
  });

  useEffect(()=> {
   setFormData({
    type: edit ? activity.type : "note",
    direction: edit ? activity.direction : "outbound",
    subject: edit ? activity.subject : "",
    htmlBody : edit ? activity.htmlBody : "",
    body: edit ? activity.body : "",
    callDuration: edit ? activity.callDuration : "",
    callOutcome: edit ? activity.callOutcome : "",
    callRecordingUrl: edit ? activity.direction : "",
    meetingDuration: edit ? activity.meetingDuration : "",
    meetingLocation: edit ? activity.meetingLocation : "",
    meetingLink: edit ? activity.meetingLink : "",
    meetingAttendees: edit ? activity.meetingAttendees.join(",") : "",
    taskPriority: edit ? activity.taskPriority : "medium",
    taskDueDate: edit ? activity.taskDueDate :"",
    emailFrom: edit ? activity.emailFrom : "",
    emailTo: edit ? activity.emailTo.join(",") :"",
    emailCc: edit ? activity.emailCc.join(",") : "",
    emailBcc: edit ? activity.emailBcc.join(",") : "",
    status: edit ? activity.status :"completed",
    scheduledAt: edit ? activity.scheduledAt :"",
    completedAt: edit ? activity.completedAt :"",
    associatedDeal : edit ? activity.associatedDeal : "",
    associatedTicket : edit ? activity.associatedTicket : "",
   });
  }, [edit, open]);

  const [inputValue, setInputValue] = useState("");
  const [directionInputValue, setDirectionInputValue] = useState("");

  const [typeOptions, setTypeOptions] = useState([
    { value: "note", label: "Note" },
    { value: "call", label: "Call" },
    { value: "email", label: "Email" },
    { value: "meeting", label: "Meeting" },
    { value: "task", label: "Task" },
    { value: "linkedin_message", label: "LinkedIn Message" },
    { value: "sms", label: "SMS" },
    { value: "whatsapp", label: "WhatsApp" },
  ]);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [addActivity, { loading }] = useMutation(ADD_ACTIVITY, {
    onCompleted: (result) => {
      if (result.addActivity.success) {
        Swal.fire("Success", "Activity logged successfully", "success");
        onSuccess();
        resetForm();
      }
    },
    onError: (err) => {
      Swal.fire("Error", err.message || "Failed to add activity", "error");
    },
  });

  const [updateActivity, { loading : updatingActivity }] = useMutation(UPDATE_ACTIVITY, {
    onCompleted: (result) => {
      if (result.updateActivity.success) {
        Swal.fire("Success", "Activity logged successfully", "success");
        onSuccess();
        resetForm();
      }
    },
    onError: (err) => {
      Swal.fire("Error", err.message || "Failed to add activity", "error");
    },
  });

  const handleTextInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  const handleInputChange = (e) => {
    setInputValue(e);
  };

  const handleDirectionInputChange = (e) => {
    setDirectionInputValue(e);
  };

  const handleSelectChange = (label, value) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
    setInputValue('');
  };
  const handleDirectionSelectChange = (label, value) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
    setDirectionInputValue('');
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);
      let uploadedFiles = [];
      if (selectedFiles.length > 0) {
        const uploadResult = await uploadFiles(selectedFiles, "activity");
        uploadedFiles = uploadResult.files.map((file) => ({
          fileName: file.fileName,
          fileUrl: file.fileUrl,
          fileSize: file.fileSize,
          mimeType: file.mimeType,
        }));
      }
      const activityInput = {
        type: formData.type ? formData.type : "note",
        direction: formData.direction ? formData.direction : "outbound",
        subject: formData.subject || "",
        body: formData.body || "",
        htmlBody: formData.htmlBody || "",
        status: formData.status || "scheduled",
        callDuration: formData.callDuration ? parseInt(formData.callDuration) : 0,
        callOutcome: formData.callOutcome || "",
        callRecordingUrl: formData.callRecordingUrl || "",
        meetingDuration: formData.meetingDuration ? parseInt(formData.meetingDuration) : 0,
        meetingLocation: formData.meetingLocation || "",
        meetingLink: formData.meetingLink || "",
        meetingAttendees: formData.meetingAttendees
          ? formData.meetingAttendees.split(",").map((a) => a.trim()) : [],
        taskPriority: formData.taskPriority || "medium",
        taskDueDate: formData.taskDueDate ? new Date().toISOString() : null,
        emailFrom: formData.emailFrom || "",
        emailTo: formData.emailTo
          ? formData.emailTo.split(",").map((e) => e.trim()) : [],
        emailCc: formData.emailCc
          ? formData.emailCc.split(",").map((e) => e.trim()) : [],
        emailBcc : formData.emailBcc ? formData.emailBcc.split(",").map((e) => e.trim()) : [],
        scheduledAt : formData.scheduledAt || null,
        attachments : uploadFiles.length>0 ? uploadedFiles : [],
        completedAt : formData.status === "completed" ? new Date().toISOString() : null,
        associatedDeal : formData.associatedDeal || null,
        associatedTicket : formData.associatedTicket || null,
      };

      if (edit){
        await updateActivity({
          variables : {
          contactId : contactId,
          activityId : activity._id,
          activity : activityInput,
      }});
      }else{
        await addActivity({
        variables: {
          contactId,
          activity: activityInput,
        },
       });
      }


      
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error", error.message || "Failed to save activity", "error");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: activityType,
      direction: "outbound",
      subject: "",
      body: "",
      callDuration: "",
      callOutcome: "",
      meetingDuration: "",
      meetingLocation: "",
      meetingLink: "",
      meetingAttendees: "",
      taskPriority: "medium",
      taskDueDate: "",
      emailFrom: "",
      emailTo: "",
      emailCc: "",
      status: "completed",
      scheduledAt: "",
    });
    setSelectedFiles([]);
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
          <h2 className="text-2xl font-bold text-white">
            Log {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
          </h2>
          <button onClick={() => {
            onClose();
            resetForm();
          }} className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
              <Select
              options={typeOptions}
              value={edit ? {value : formData.type, label : formData.type} : typeOptions.find(option => option.value === formData.type)}
              onInputChange={handleInputChange}
              inputValue={inputValue}
              onChange={(selectedOption) => handleSelectChange("type", selectedOption?.value || '')}
              placeholder="Select Activity Type"
              styles={customStyles}
              id="role-select-cus"
              name="Type"
            />
          </div>
          {   ["call", "email", "linkedin_message", "sms", "whatsapp"].includes(
            formData.type
          ) && (
            <Select
              options={[
                { value: "inbound", label: "Inbound" },
                { value: "outbound", label: "Outbound" },
              ]}
              value={
                formData.direction
                  ? { value: formData.direction, label: formData.direction.charAt(0).toUpperCase() + formData.direction.slice(1) }
                  : null
              }
              onInputChange={handleDirectionInputChange}
              inputValue={directionInputValue}
              onChange={(selectedOption) => handleDirectionSelectChange("direction", selectedOption?.value || '')}
              placeholder="Select Direction"
              styles={customStyles}
              id="direction-select-cus"
              name="Direction"
            />
          )

          }
          <div>
            <Label className="text-gray-300">Subject</Label>
            <Input
              name="subject"
              value={formData.subject}
              onChange={handleTextInputChange}
              className="bg-[#0F0A1F] border-[#2D2640] text-white"
              placeholder="Enter subject"
            />
          </div>
          <div>
            <Label className="text-gray-300">Description</Label>
            <Textarea
              name="body"
              value={formData.body}
              onChange={handleTextInputChange}
              rows={4}
              className="bg-[#0F0A1F] border-[#2D2640] text-white"
              placeholder="Enter description..."
            />
          </div>
          {formData.type === "call" && (<div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Duration (seconds)</Label>
                <Input
                  name="callDuration"
                  type="number"
                  value={formData.callDuration}
                  onChange={handleTextInputChange}
                  className="bg-[#0F0A1F] border-[#2D2640] text-white"
                  placeholder="300"
                />
              </div>
              <div>
                <Label className="text-gray-300">Outcome</Label>
                <Select
                  options={[
                    { value: "completed", label: "Completed" },
                    { value: "connected", label: "Connected" },
                    { value: "leftMessage", label: "Left Message" },
                    { value: "noAnswer", label: "No Answer" },
                    { value: "busy", label: "Busy" },
                  ]}
                  value={
                    formData.callOutcome ? { value: formData.callOutcome, label: formData.callOutcome.charAt(0).toUpperCase() + formData.callOutcome.slice(1) }
                    : null
                  }
                  onChange={(selectedOption) => handleSelectChange("callOutcome", selectedOption?.value || '')}
                  placeholder="Select Outcome"
                  styles={customStyles}
                  id="outcome-select-cus"
                  name="Outcome"
                />  
            </div>
            </div>
          )}

      {formData.type === "meeting" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Duration (mins)</Label>
              <Input
                name="meetingDuration"
                type="number"
                value={formData.meetingDuration}
                onChange={handleTextInputChange}
                className="bg-[#0F0A1F] border-[#2D2640] text-white"
                placeholder="60"
              />
            </div>
            <div>
              <Label className="text-gray-300">Location</Label>
              <Input
                name="meetingLocation"
                value={formData.meetingLocation}
                onChange={handleTextInputChange}
                className="bg-[#0F0A1F] border-[#2D2640] text-white"
                placeholder="Room A"
              />
            </div>
          </div>
          <div>
            <Label className="text-gray-300">Meeting Link</Label>
            <Input
              name="meetingLink"
              value={formData.meetingLink}
              onChange={handleTextInputChange}
              className="bg-[#0F0A1F] border-[#2D2640] text-white"
              placeholder="https://zoom.us/..."
            />
          </div>
          <div>
            <Label className="text-gray-300">Attendees (comma separated)</Label>
            <Input
              name="meetingAttendees"
              value={formData.meetingAttendees}
              onChange={handleTextInputChange}
              className="bg-[#0F0A1F] border-[#2D2640] text-white"
              placeholder="john@example.com, jane@example.com"
            />
          </div>
        </div>
      )}

      {formData.type === "task" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-300">Priority</Label>
            <Select
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" },
              ]}
              value={
                formData.taskPriority ? { value: formData.taskPriority, label: formData.taskPriority.charAt(0).toUpperCase() + formData.taskPriority.slice(1) }
                  : null
              }
              onChange={(selectedOption) => handleSelectChange("taskPriority", selectedOption?.value || '')}
              placeholder="Select Priority"
              styles={customStyles}
              id="priority-select-cus"
              name="Priority"
            />
          </div>
          <div>
            <Label className="text-gray-300">Due Date</Label>
            <Input
              name="taskDueDate"
              type="datetime-local"
              value={formData.taskDueDate}
              onChange={handleTextInputChange}
              className="bg-[#0F0A1F] border-[#2D2640] text-white"
            />
          </div>
        </div>
      )}

      {formData.type === "email" && (
        <div className="space-y-4">
          <div>
            <Label className="text-gray-300">From</Label>
            <Input
              name="emailFrom"
              type="email"
              value={formData.emailFrom}
              onChange={handleTextInputChange}
              className="bg-[#0F0A1F] border-[#2D2640] text-white"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <Label className="text-gray-300">To (comma separated)</Label>
            <Input
              name="emailTo"
              value={formData.emailTo}
              onChange={handleTextInputChange}
              className="bg-[#0F0A1F] border-[#2D2640] text-white"
              placeholder="recipient@example.com, other@example.com"
            />
          </div>
          <div>
            <Label className="text-gray-300">CC (comma separated)</Label>
            <Input
              name="emailCc"
              value={formData.emailCc}
              onChange={handleTextInputChange}
              className="bg-[#0F0A1F] border-[#2D2640] text-white"
              placeholder="cc@example.com"
            />
          </div>
        </div>
      )}
      <div>
        <Label className="text-gray-300">Status</Label>
        <Select
          options={[
            { value: "completed", label: "Completed" },
            { value: "scheduled", label: "Scheduled" },
            { value: "pending", label: "Pending" },
            { value: "cancelled", label: "Cancelled" },
          ]}
          value={
            formData.status ? { value: formData.status, label: formData.status.charAt(0).toUpperCase() + formData.status.slice(1) }
              : null
          }
          onChange={(selectedOption) => handleSelectChange("status", selectedOption?.value || '')}
          placeholder="Select Status"
          styles={customStyles}
          id="status-select-cus"
          name="Status"
        />
      </div>

      {formData.status === "scheduled" && (
        <div>
          <Label className="text-gray-300">Scheduled Date & Time</Label>
          <Input
            name="scheduledAt"
            type="datetime-local"
            value={formData.scheduledAt}
            onChange={handleTextInputChange}
            className="bg-[#0F0A1F] border-[#2D2640] text-white"
          />
        </div>
      )}
      <div>
        <Label className="text-gray-300">Attachments</Label>
        <div className="mt-2">
          <label
            htmlFor="activity-files"
            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#2D2640] rounded-lg cursor-pointer hover:border-[#7C3AED] transition-colors bg-[#0F0A1F]"
          >
            <div className="flex flex-col items-center justify-center">
              <Upload className="h-6 w-6 text-gray-400 mb-1" />
              <p className="text-sm text-gray-400">Click to upload files</p>
            </div>
            <Input
              id="activity-files"
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
                <span className="text-sm text-gray-300 truncate flex-1">
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </span>
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
    </div>
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
        disabled={loading || uploading}
        className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
      >
        {uploading ? "Uploading..." : loading ? "Saving..." : "Save Activity"}
      </Button>
    </div>
  </div>
</Drawer>
);
}