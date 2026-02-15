"use client";
import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { ADD_TICKET, UPDATE_TICKET } from "@/graphql/contactMutations";
import { gql } from "@apollo/client";
import { Drawer } from "@mui/material";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Select from "react-select"; 
import { X } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import { apiPath } from "@/utils/routes";

export default function AddTicketDrawer({ edit, ticket, open, onClose, contactId, onSuccess }) {
  const [formData, setFormData] = useState({
    subject: "",
    content: "",
    status: "new",
    priority: "medium",
    category: "support",
    assignedTo: "",
  });
  const [empOpt, setEmpOpt] = useState([]);
  const [inputValue, setInputValue] = useState("");
  console.log(ticket.assignedTo);

  useEffect(()=>{
    setFormData({
      subject : ticket.subject ? ticket.subject : "",
      content : ticket.content ? ticket.content : "",
      status : ticket.status ? ticket.status : "",
      priority : ticket.priority ? ticket.priority : "",
      category : ticket.category ? ticket.category : "",
      assignedTo : ticket.assignedTo ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.secondName}` : "", 
    })
  }, [edit, open]);

  const userFunction = async() => {
    await axios
        .get(`${apiPath.prodPath}/api/users/allusers`, )
        .then((res) => {
          const name = res.data.map((item) => {
            const userId = item._id;
            const fullname = item.firstName + " " + item.secondName;
            return { label: fullname, value: userId };
          });
          setEmpOpt(name);
        })
        .catch((err) => {
          console.log(err);
          Swal.fire({
            icon: "error",
            text: "Something went wrong with the data fetching",
          });
        });
  }
 useEffect(() => {
  userFunction();
 }, [open]);
 

 const handleSelectReactInputChange = (e) => {
    setInputValue(e);
  };

const handleSelectReactChange = (label, value) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
    setInputValue('');
  };

  const [addTicket, { loading }] = useMutation(ADD_TICKET, {
    onCompleted: (result) => {
      if (result.addTicket.success) {
        Swal.fire("Success", "Ticket created successfully", "success");
        onSuccess();
        resetForm();
      }
    },
    onError: (err) => {
      Swal.fire("Error", err.message || "Failed to create ticket", "error");
    },
  });

  const [updateTicket] = useMutation(UPDATE_TICKET, {
      onCompleted: (result) => {
        if (result.updateTicket.success) {
          Swal.fire("Updated", "Ticket updated successfully", "success");
          onUpdate();
        }
      },
      onError: (err) => {
        Swal.fire("Error", err.message || "Failed to update ticket", "error");
      },
    });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {

    const inputTicket = {
      subject: formData.subject,
      content: formData.content,
      status: formData.status,
      priority: formData.priority,
      category: formData.category,
      assignedTo: formData.assignedTo || undefined,
    }
    const ticketId = ticket ? ticket.ticketId : "";

    if(edit){
      updateTicket({
      variables: {
        contactId,
        ticketId,
        ticket: {
          ...inputTicket
        },
      },
    });
    }else{
      addTicket({
      variables: {
        contactId,
        ticket: {
          ...inputTicket
        },
      },
    });
    }

    
  };

  const resetForm = () => {
    setFormData({
      subject: "",
      content: "",
      status: "new",
      priority: "medium",
      category: "support",
      assignedTo: "",
    });
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
          <h2 className="text-2xl font-bold text-white">Create Ticket</h2>
          <button onClick={() => {
            onClose();
            resetForm();
          }} className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <Label className="text-gray-300">Subject *</Label>
            <Input
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              className="bg-[#0F0A1F] border-[#2D2640] text-white"
              placeholder="Login issue with account"
            />
          </div>

          <div>
            <Label className="text-gray-300">Description *</Label>
            <Textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={5}
              className="bg-[#0F0A1F] border-[#2D2640] text-white"
              placeholder="Describe the issue in detail..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Status</Label>
              <Select
              options={[
                {value : "new", label : "New"},
                {value : "inProgress", label : "In Progress"},
                {value : "waiting", label: "Waiting"},
                {value : "resolved", label : "Resolved"},
                {value : "closed", label : "Closed"}
              ]}
              value={formData.status ? {value : formData.status, label : formData.status} : null}
              onChange={(option) =>
                      handleSelectReactChange("status", option.value)
                    }
              inputValue={inputValue}
              onInputChange={handleSelectReactInputChange}
              className="bg-[#0F0A1F] border-[#2D2640] text-white"
              placeholder="Select Status"
              styles={customStyles}
              id="currency-select-cus"
              name="Status"
              />
            </div>
            <div>
              <Label className="text-gray-300">Priority</Label>
              <Select
              options={[
                {value : "low", label : "Low"},
                {value : "medium", label : "Medium"},
                {value : "high", label : "High"},
                {value : "urgent", label : "Urgent"},
              ]}
              value={ formData.priority ? {value : formData.priority, label : formData.priority} : null}
              onChange={(option) =>
                      handleSelectReactChange("priority", option.value)
                    }
              inputValue={inputValue}
              onInputChange={handleSelectReactInputChange}
              className="bg-[#0F0A1F] border-[#2D2640] text-white"
              placeholder="Select Category"
              styles={customStyles}
              id="currency-select-cus"
              name="Category"
              />
            </div>
          </div>

          <div>
             <Label className="text-gray-300">Category</Label>
             <Select
              options={[
                {value : "technical", label : "Technical"},
                {value : "billing", label : "Billing"},
                {value : "sales", label : "Sales"},
                {value : "support", label : "Support"},
                {value : "other", label : "Other"}
              ]}
              value={ formData.category ? {value : formData.category, label : formData.category} : null}
              onChange={(option) =>
                      handleSelectReactChange("category", option.value)
                    }
              inputValue={inputValue}
              onInputChange={handleSelectReactInputChange}
              className="bg-[#0F0A1F] border-[#2D2640] text-white"
              placeholder="Select Category"
              styles={customStyles}
              id="currency-select-cus"
              name="Category"
              />
          </div>
          <div className="flex flex-col gap-2 w-full">
              <label className="font-satoshi text-md">Assigned To</label>
              <Select
                  options={empOpt}
                  value={formData.assignedTo ? empOpt.find((option) => option.value === formData.assignedTo) : null}
                  onInputChange={handleSelectReactInputChange}
                  inputValue={inputValue}
                  onChange={(v) => handleSelectReactChange("assignedTo", v.value)}
                  placeholder="Select Assigned To"
                  styles={customStyles}
                  id="assignedTo-select-cus"
                  name="Assigned To"
                  required
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
            disabled={loading || !formData.subject || !formData.content}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
          >
            {loading ? "Creating..." : "Create Ticket"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}