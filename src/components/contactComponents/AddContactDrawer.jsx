"use client";
import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_CONTACT, UPDATE_CONTACT } from "@/graphql/contactMutations";
import { Drawer } from "@mui/material";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "react-select"; 
import { X } from "lucide-react";
import useAuthStore from "@/store/store";
import Swal from "sweetalert2";

export default function AddContactDrawer({ edit, open, contact, onClose, onSuccess }) {
  const user = useAuthStore((state) => state.user);
  const [inputValue, setInputValue] = useState("")

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    alternateEmail: "",
    phone: "",
    mobilePhone: "",
    salutation: "",
    jobTitle: "",
    department: "",
    seniority : "",
    companyId: "",
    street: "",
    street2 : "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    linkedIn: "",
    twitter: "",
    website: "",
    lifecycleStage: "lead",
    leadStatus: "new",
    source: "manual",
    tags: "",
    instagram: "",
    facebook: "",
    github: "",
  });

  const [createContact, { loading }] = useMutation(CREATE_CONTACT, {
    onCompleted: (result) => {
      console.log("Mutation Result:", result);
      if (result.createContact.success) {
        Swal.fire("Success", "Contact created successfully", "success");
        onSuccess();
        resetForm();
        onClose();
      } else {
        Swal.fire("Error", result.createContact.message || "Unknown error", "error");
      }
    },
    onError: (err) => {
      console.error("Apollo Link/Server Error:", err);
      Swal.fire("Error", err.message || "Failed to create contact", "error");
    },
  });

  const [updateContact, { loading: LoadingUpdate }] = useMutation(UPDATE_CONTACT, {
    onCompleted: (result) => {
      console.log("Mutation Result:", result);
      if (result.updateContact.success) {
        Swal.fire("Success", "Contact updated successfully", "success");
        onSuccess();
        resetForm();
        onClose();
      } else {
        Swal.fire("Error", result.updateContact.message || "Unknown error", "error");
      }
    },
    onError: (err) => {
      console.error("Apollo Link/Server Error:", err);
      Swal.fire("Error", err.message || "Failed to updated contact", "error");
    },
  });

  console.log(contact, "this is the contact");

  useEffect (()=> {
    console.log(contact);
    setFormData({
      firstName : contact?.basicInfo?.firstName || "",
      lastName : contact?.basicInfo?.lastName || "",
      email: contact?.basicInfo?.email || "",
      alternateEmail: contact?.basicInfo?.alternateEmail || null,
      phone: contact?.basicInfo?.phone || null,
      mobilePhone: contact?.basicInfo?.mobilePhone || null, 
      salutation: contact?.basicInfo?.salutation || null,
      street: contact?.address?.street || null,
      street2: contact?.address?.street2 || null,
      city: contact?.address?.city || null,
      state: contact?.address?.state || null,
      postalCode: contact?.address?.postalCode || null,
      country: contact?.address?.country || null,
      linkedIn: contact?.socialMedia?.linkedIn || null,
      twitter: contact?.socialMedia?.twitter || null,
      website: contact?.socialMedia?.website || null,
      instagram: contact?.socialMedia?.instagram || null,
      facebook: contact?.socialMedia?.facebook || null,
      github: contact?.socialMedia?.github || null,
      lifecycleStage: contact?.lifeCycle?.stage,
      leadStatus: contact?.lifeCycle?.leadStatus,
      source: contact?.lifeCycle?.source,
      tags: contact?.lifeCycle?.tags || [],
    });
  }, [edit, open]);

  const handleSelectReactInputChange = (e) => {
    setInputValue(e);
  };

const handleSelectReactChange = (label, value) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
    setInputValue('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange2 = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    console.log("Attempting to submit form...");
    
    const currentUserId = user?.user?._id || user?._id;

    let variables;

    if(!edit){
      variables = {
      // id: contact._id,
      basicInfo: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        alternateEmail: formData.alternateEmail || null,
        phone: formData.phone || null,
        mobilePhone: formData.mobilePhone || null, 
        salutation: formData.salutation || null,
      },
      address: {
        street: formData.street || null,
        street2: formData.street2 || null,
        city: formData.city || null,
        state: formData.state || null,
        postalCode: formData.postalCode || null,
        country: formData.country || null,
      },
      socialMedia: {
        linkedIn: formData.linkedIn || null,
        twitter: formData.twitter || null,
        website: formData.website || null,
        instagram: formData.instagram || null,
        facebook: formData.facebook || null,
        github: formData.github || null,
      },
      lifeCycle: {
        stage: formData.lifecycleStage,
        leadStatus: formData.leadStatus,
        source: formData.source,
        tags: formData.tags || [],
      },
      ownerId: currentUserId || null,
    };
    }else{
      variables = {
      id: contact._id,
      basicInfo: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        alternateEmail: formData.alternateEmail || null,
        phone: formData.phone || null,
        mobilePhone: formData.mobilePhone || null, 
        salutation: formData.salutation || null,
      },
      address: {
        street: formData.street || null,
        street2: formData.street2 || null,
        city: formData.city || null,
        state: formData.state || null,
        postalCode: formData.postalCode || null,
        country: formData.country || null,
      },
      socialMedia: {
        linkedIn: formData.linkedIn || null,
        twitter: formData.twitter || null,
        website: formData.website || null,
        instagram: formData.instagram || null,
        facebook: formData.facebook || null,
        github: formData.github || null,
      },
      lifeCycle: {
        stage: formData.lifecycleStage,
        leadStatus: formData.leadStatus,
        source: formData.source,
        tags: edit ? (formData.tags) : (formData.tags
          ? formData.tags.split(",").map((t) => t.trim()).filter(t => t !== "")
          : []),
      },
    };
    }
    
    

    


    try {
      if (edit){
        await updateContact({variables});
      }else{
        await createContact({ variables });
      }
      
    } catch (err) {
      console.error("Catch block error:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      alternateEmail: "",
      phone: "",
      mobilePhone: "",
      salutation: "",
      jobTitle: "",
      department: "",
      seniority : "",
      companyId: "",
      street: "",
      street2 : "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      linkedIn: "",
      twitter: "",
      website: "",
      lifecycleStage: "lead",
      leadStatus: "new",
      source: "manual",
      tags: "",
      instagram: "",
      facebook: "",
      github: "",
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

  const isFormValid = formData.firstName && formData.lastName && formData.email;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
          sx: {
            width: "1142px",  
            height: "dvh", 
            position: "absolute",
            left: "15%",
            top: "1%",
            transform: "translate(-50%, -50%)",
            borderRadius: "16px",  
            marginTop : "30px",
            marginBottom: "30px",
          },
        }}
        >
      <div className="p-10 flex flex-col bg-[#2D245B] flex-wrap">
        <div className="flex items-center justify-between p-6 border-b border-[#2D2640]">
          <h2 className="text-white font-satoshi text-2xl font-bold mb-5">Add New Contact</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div className="flex flex-row gap-2 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
                <div className="flex flex-col gap-2 w-1/2">
                  <Label className="text-gray-300 font-satoshi text-md">First Name *</Label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] text-white"
                    placeholder="John"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2 w-1/2">
                  <Label className="text-gray-300 font-satoshi text-md">Last Name *</Label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] text-white"
                    placeholder="Doe"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2 w-1/2">
                  <Label className="text-gray-300 font-satoshi text-md">Salutation</Label>
                  <Input
                    name="salutation"
                    value={formData.salutation}
                    onChange={handleInputChange}
                    className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] text-white"
                    placeholder="Mr./Ms./Dr."
                  />
                </div>
              </div>
              <div className="flex flex-row gap-2 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
                <div className="flex flex-col gap-2 w-1/2">
                <Label className="text-gray-300 font-satoshi text-md">Email *</Label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] text-white"
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <Label className="text-gray-300 font-satoshi text-md">Alternate Email</Label>
                <Input
                  name="alternateEmail"
                  type="email"
                  value={formData.alternateEmail}
                  onChange={handleInputChange}
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] text-white"
                  placeholder="john@example.com"
                />
              </div>
              </div>
              

              <div className="flex flex-row gap-2 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
                <div className="flex flex-col gap-2 w-1/2">
                  <Label className="text-gray-300 font-satoshi text-md">Phone</Label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] text-white"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="flex flex-col gap-2 w-1/2">
                  <Label className="text-gray-300 font-satoshi text-md">Mobile</Label>
                  <Input
                    name="mobilePhone"
                    value={formData.mobilePhone}
                    onChange={handleInputChange}
                    className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] text-white"
                    placeholder="+1 (555) 987-6543"
                  />
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Address</h3>
            <div className="space-y-4">
              <Input
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] text-white"
                placeholder="Street Address"
              />
              <Input
                name="street2"
                value={formData.street2}
                onChange={handleInputChange2}
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] text-white"
                placeholder="Street Address 2"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] text-white"
                  placeholder="City"
                />
                <Input
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] text-white"
                  placeholder="State"
                />
                
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] text-white"
                  placeholder="Zipcode"
                />
                <Input
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] text-white"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Social Media Links</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="linkedIn"
                value={formData.linkedIn}
                onChange={handleInputChange}
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] text-white"
                placeholder="LinkedIn URL"
              />
              <Input
                name="twitter"
                value={formData.twitter}
                onChange={handleInputChange}
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] text-white"
                placeholder="Twitter URL"
              />
              <Input
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] text-white"
                placeholder="Website URL"
              />
              <Input
                name="github"
                value={formData.github}
                onChange={handleInputChange}
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] text-white"
                placeholder="GitHub URL"
              />
              <Input
                name="instagram"
                value={formData.instagram}
                onChange={handleInputChange}
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] text-white"
                placeholder="Instagram URL"
              />
              <Input
                name="facebook"
                value={formData.facebook}
                onChange={handleInputChange}
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] text-white"
                placeholder="Facebook URL"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Lifecycle</h3>
            <div className="grid grid-cols-2 gap-4">
              <Select
              options={[
                {value : "lead", label : "Lead"},
                {value : "customer", label : "Customer"},
                {value : "subscriber", label : "Subscriber"},
              ]}
              value={ formData.lifecycleStage ? {value : formData.lifecycleStage, label : formData.lifecycleStage} : null}
              onChange={(option) =>
                      handleSelectReactChange("lifecycleStage", option.value)
                    }
              inputValue={inputValue}
              onInputChange={handleSelectReactInputChange}
              className="bg-[#0F0A1F] border-[#2D2640] text-white"
              placeholder="Select Lifecycle Stage"
              styles={customStyles}
              id="currency-select-cus"
              name="LifeCycleStage"
              />
              <Select
              options={[
                {value : "new", label : "New"},
                {value : "open", label : "Open"},
                {value : "inProgress", label : "In Progress"},
              ]}
              value={ formData.leadStatus ? {value : formData.leadStatus, label : formData.leadStatus} : null}
              onChange={(option) =>
                      handleSelectReactChange("leadStatus", option.value)
                    }
              inputValue={inputValue}
              onInputChange={handleSelectReactInputChange}
              className="bg-[#0F0A1F] border-[#2D2640] text-white"
              placeholder="Select Status"
              styles={customStyles}
              id="currency-select-cus"
              name="LeadStatus"
              />
            </div>
          </div>   
        </div>

        <div className="p-6 border-t border-[#2D2640] flex justify-end gap-3 bg-[#1A1625]">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#2D2640] text-gray-300 hover:bg-[#1F1833]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !isFormValid}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white min-w-[120px]"
          >
            {edit ? (LoadingUpdate ? "Updating..." : "Update Contact"): (loading ? "Creating..." : "Create Contact")}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}