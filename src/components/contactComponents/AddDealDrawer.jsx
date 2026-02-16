"use client";
import React, { useEffect, useState } from "react";
import { Drawer } from "@mui/material";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "react-select";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { apiPath } from "@/utils/apiRoutes";
import useAuthStore from "@/store/store";
import Swal from "sweetalert2";
import { useMutation } from "@apollo/client/react";
import { ADD_DEAL, UPDATE_DEAL } from "@/graphql/contactMutations";
import moment from "moment";

export default function AddDealDrawer({ edit, deal, open, onClose, contactId, onSuccess }) {
  const user = useAuthStore((state) => state.user);
  const [uploading, setUpLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [dealId, setDealId] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    currency: "USD",
    stage: "appointmentScheduled",
    probability: "",
    closeDate: "",
    role: "other",
    isPrimary: false,
  });

  useEffect(() => {
  setFormData({
    name: deal.name ? deal.name : "",
    amount: deal.amount ? deal.amount : 0,
    currency: deal.currency ? deal.currency : "USD",
    stage: deal.stage ? deal.stage : "",
    probability: deal.probability ? deal.probability : "",
    closeDate: deal.closeDate ? moment(deal.closeDate).format('YYYY-MM-DD') : "", 
    role: deal.role ? deal.role : "",
    isPrimary: deal.isPrimary ? deal.isPrimary : false
  });
  setDealId(deal.dealId);
}, [edit, open]);

  const [addDeal , {loading}] = useMutation(ADD_DEAL, {
      onCompleted: (result) => {
        if (result.addDeal.success) {
          Swal.fire("Success", "Deal added successfully", "success");
          onSuccess();
          resetForm();
        }
      },
      onError: (err) => {
        Swal.fire("Error", err.message || "Failed to add deal", "error");
      },
    });

  const [updateDeal , {loading : updatingDeal}] = useMutation(UPDATE_DEAL, {
      onCompleted: (result) => {
        if (result.updateDeal.success) {
          Swal.fire("Success", "Deal added successfully", "success");
          onSuccess();
          resetForm();
        }
      },
      onError: (err) => {
        Swal.fire("Error", err.message || "Failed to add deal", "error");
      },
    });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectReactInputChange = (e) => {
    setInputValue(e);
  };

  const handleSelectReactChange = (label, value) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
    setInputValue('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpLoading(true);


    try {

      const dealInput = {
        name : formData.name ? formData.name : "Untitled Deal",
        amount : parseFloat(formData.amount) ? parseFloat(formData.amount) : 0,
        currency : formData.currency ? formData.currency : "USD",
        stage : formData.stage ? formData.stage : "appointmentScheduled",
        probability : formData.probability ? parseFloat(formData.probability) : null,
        closeDate : formData.closeDate ? moment(formData.closeDate).toISOString() : null,
        role : formData.role ? formData.role : "other",
        isPrimary : formData.isPrimary ? true : false,
      }

      if(edit){
        console.log(dealId, dealInput);
        await updateDeal({
        variables: {
            contactId,
            dealId : dealId,
            deal : dealInput
        }
      });
      }else{
        await addDeal({
        variables: {
            contactId,
            deal : dealInput
        }
      });
      }

      
    } catch (error) {
      console.error("Error adding deal:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to add deal",
        "error"
      );
    } finally {
      setUpLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      amount: "",
      currency: "USD",
      stage: "appointmentScheduled",
      probability: "",
      closeDate: "",
      role: "other",
      isPrimary: false,
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
          <h2 className="text-2xl font-bold text-white">Add Deal</h2>
          <button
            onClick={() => {
            onClose();
            resetForm();
          }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-gray-300">
                Deal Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="bg-[#0F0A1F] border-[#2D2640] text-white"
                placeholder="Q1 Enterprise License"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount" className="text-gray-300">
                  Amount *
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  className="bg-[#0F0A1F] border-[#2D2640] text-white"
                  placeholder="50000"
                 />
                </div>
                <div>
                  <Label htmlFor="currency" className="text-gray-300">
                    Currency
                  </Label>
                  <Select
                    options={[
                      { value: "USD", label: "USD" },
                      { value: "EUR", label: "EUR" },
                      { value: "GBP", label: "GBP" },
                      { value: "CAD", label: "CAD" },
                      { value: "AUD", label: "AUD" },
                      { value: "JPY", label: "JPY" },
                      { value: "CNY", label: "CNY" },
                      { value: "INR", label: "INR" },
                      { value: "BRL", label: "BRL" },
                      { value: "ZAR", label: "ZAR" },
                      { value: "CHF", label: "CHF" },
                      { value: "SEK", label: "SEK" },
                      { value: "NOK", label: "NOK" },
                      { value: "MXN", label: "MXN" },
                      { value: "SGD", label: "SGD" },
                      { value: "HKD", label: "HKD" },
                      { value: "NZD", label: "NZD" },
                      { value: "KRW", label: "KRW" },
                      { value: "TRY", label: "TRY" },
                      { value: "PKR", label: "PKR" },
                      { value: "AED", label: "AED" },
                      { value: "SAR", label: "SAR" },
                      { value: "QAR", label: "QAR" },
                      { value: "KWD", label: "KWD" },
                      { value: "OMR", label: "OMR" },
                      { value: "BHD", label: "BHD" },
                      { value: "DZD", label: "DZD" },
                      { value: "MAD", label: "MAD" },
                      { value: "EGP", label: "EGP" },
                      { value: "LKR", label: "LKR" },
                      { value: "BDT", label: "BDT" },
                      { value: "VND", label: "VND" },
                      { value: "THB", label: "THB" },
                      { value: "MYR", label: "MYR" },
                      { value: "IDR", label: "IDR" },
                      { value: "CZK", label: "CZK" },
                      { value: "HUF", label: "HUF" },
                      { value: "PLN", label: "PLN" },
                      { value: "RON", label: "RON" },
                      { value: "CLP", label: "CLP" },
                      { value: "PEN", label: "PEN" },
                      { value: "COP", label: "COP" },
                      { value: "ARS", label: "ARS" },
                      { value: "UYU", label: "UYU" },
                      { value: "VEF", label: "VEF" },
                      { value: "DOP", label: "DOP" },
                      { value: "CRC", label: "CRC" },
                      { value: "GTQ", label: "GTQ" },
                      { value: "HNL", label: "HNL" },
                      { value: "NIO", label: "NIO" },
                      { value: "PYG", label: "PYG" },
                      { value: "SVC", label: "SVC" },
                      { value: "ZMW", label: "ZMW" },
                      { value: "XOF", label: "XOF" },
                      { value: "XAF", label: "XAF" },
                      { value: "XPF", label: "XPF" },
                      { value: "RWF", label: "RWF" },
                      { value: "BIF", label: "BIF" },
                    ]}
                    value={formData.currency ? { value: formData.currency, label: formData.currency } : null}
                    onChange={(option) =>
                      handleSelectReactChange("currency", option.value)
                    }
                    inputValue={inputValue}
                    onInputChange={handleSelectReactInputChange}
                    className="bg-[#0F0A1F] border-[#2D2640] text-white"
                    placeholder="Select Currency"
                    styles={customStyles}
                    id="currency-select-cus"
                    name="Currency"
                  />
                </div>
                </div>
        <div >
          <div>
            <Label htmlFor="stage" className="text-gray-300">
              Deal Stage *
            </Label>
            <Select
              options={[
                { value: "appointmentScheduled", label: "Appointment Scheduled" },
                { value: "qualifiedToBuy", label: "Qualified to Buy" },
                { value: "presentationScheduled", label: "Presentation Scheduled" },
                { value: "decisionMakerBoughtIn", label: "Decision Maker Bought In" },
                { value: "contractSent", label: "Contract Sent" },
                { value: "closedWon", label: "Closed Won" },
                { value: "closedLost", label: "Closed Lost" },
              ]}
              value={formData.stage ? { value: formData.stage, label: formData.stage.replace(/([A-Z])/g, ' $1').trim() } : null}
              onChange={(option) =>
                handleSelectReactChange("stage", option.value)
              }
              inputValue={inputValue}
              onInputChange={handleSelectReactInputChange}
              className="bg-[#0F0A1F] border-[#2D2640] text-white"
              placeholder="Select Stage"
              styles={customStyles}
              id="stage-select-cus"
              name="Stage"
            />
          </div>
          </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="probability" className="text-gray-300">
              Probability (%)
            </Label>
            <Input
              id="probability"
              name="probability"
              type="number"
              min="0"
              max="100"
              value={formData.probability}
              onChange={handleInputChange}
              className="bg-[#0F0A1F] border-[#2D2640] text-white"
              placeholder="75"
            />
          </div>
          <div>
            <Label htmlFor="closeDate" className="text-gray-300">
              Close Date *
            </Label>
            <Input
              id="closeDate"
              name="closeDate"
              type="date"
              value={formData.closeDate}
              onChange={handleInputChange}
              required
              className="bg-[#0F0A1F] border-[#2D2640] text-white"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="role" className="text-gray-300">
            Contact Role in Deal
          </Label>
          <Select
            options={[
              { value: "decisionMaker", label: "Decision Maker" },
              { value: "influencer", label: "Influencer" },
              { value: "champion", label: "Champion" },
              { value: "blocker", label: "Blocker" },
              { value: "other", label: "Other" },
              { value: "unknown", label: "Unknown" },
              { value: "economicBuyer", label: "Economic Buyer" },
              { value: "technicalBuyer", label: "Technical Buyer" },
              { value: "userBuyer", label: "User Buyer" },
              { value: "middleman", label: "Middleman" },
            ]}
            value={formData.role ? { value: formData.role, label: formData.role.replace(/([A-Z])/g, ' $1').trim() } : null}
            onChange={(option) =>
              handleSelectReactChange("role", option.value)
            }
            inputValue={inputValue}
            onInputChange={handleSelectReactInputChange}
            className="bg-[#0F0A1F] border-[#2D2640] text-white"
            placeholder="Select Role"
            styles={customStyles}
            id="role-select-cus"
            name="Role"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isPrimary"
            checked={formData.isPrimary}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, isPrimary: checked }))
            }
          />
          <Label
            htmlFor="isPrimary"
            className="text-gray-300 text-sm font-normal cursor-pointer"
          >
            Mark as primary deal for this contact
          </Label>
        </div>
      </div>
    </form>

    <div className="flex items-center justify-end gap-3 p-6 border-t border-[#2D2640]">
      <Button
        type="button"
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
        {uploading ? "Uploading..." : loading ? "Saving..." : "Save Deal"}
      </Button>
    </div>
  </div>
</Drawer>
);
}