import React, { useEffect, useState } from 'react'
import axios from "axios";
import { apiPath } from "@/utils/routes";
import { Button } from "@mui/material";
import { Edit2Icon, Trash, View } from "lucide-react";
import Swal from "sweetalert2";
import Select from "react-select";
import "./style.scss"
import Drawer from "@mui/material/Drawer";
import "./style.scss";
import Checkbox from "@mui/material/Checkbox";
import { FormControlLabel } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import debounce from "lodash.debounce";
import moment from "moment";


const SubmitResearch = ({item, open}) => {
  
  const [researchStatus, setResearchStatus] = useState("");
  const [isCompleted, setIsCompleted] = useState(false)
  const [assignedTo, setAssignedTo] = useState("");
  const [clientName, setCLientName] = useState(item.clientName);

   const handleCheckboxChange = (e) => {
    setIsCompleted(e.target.checked);
  };

  const handleSubmitResearch =  async (e) => {
    e.preventDefault();
    if (!isCompleted) {
      setMessage("Please complete the research before submitting.");
      return;
    }

    setAssignedTo(item.assignedTo);

    try {
      await axios
        .patch(`${apiPath.prodPath}/api/clients/submitResearch/${item._id}`, {
        assignedTo,
        researchStatus: "completed",
      })
        .then((res) => {
          Swal.fire({
            icon: "success",
            text: "Research Subitted Successfully",
          });
        });
    } catch (error) {
      console.log("Error submitting research:", error);
    }
    
  }

  return (
    <form onSubmit={handleSubmitResearch} className="bg-white p-4 rounded shadow-md w-full max-w-md">
      <label className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={handleCheckboxChange}
          className="accent-purple-600"
        />
        <span className="text-gray-800">
          Research on <strong>{clientName}</strong> completed
        </span>
      </label>

      {isCompleted && (
        <p className="text-green-600 text-sm mb-3">Research marked as completed.</p>
      )}

      <input
        type="submit"
        disabled={!isCompleted}
        className={`w-full px-4 py-2 rounded text-white font-medium ${
          isCompleted
            ? "bg-purple-600 hover:bg-purple-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
        value = {"Submit Research"}
      />
      
    </form>
  );
}

export default SubmitResearch;
