// import React, { useEffect, useState } from 'react'
// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import MoreVertIcon from "@mui/icons-material/MoreVert";

// import axios from "axios";
// import { apiPath } from "@/utils/routes";
// import { Button } from "@mui/material";
// import { Edit2Icon, Trash, View } from "lucide-react";
// import Swal from "sweetalert2";
// import Select from "react-select";
// import ClientInteractionDetails from './clientTabsOpen/clientInteractionOpen';

// const Interactions = ({item, open}) => {

//   const [clientItem, setClientItem] = useState(item);
//   const[loader, setLoader] = useState(false);
//   const[id, setId] = useState("");
  
//   const [editInteraction, setEditInteraction] = useState(false);
//   const [interactionId, setInteractionId] = useState("");

//   const [interactionCategory, setInteractionCategory] = useState("");
//   const [interactionCategoryOpt, setInteractionCategoryOpt] = useState([]);
//   const [inputInteractionCategory, setInputInteractionCategory] = useState("");

//   const [interactionDescription, setInteractionDescription] = useState("");
//   const [date, setDate] = useState("");

//   const[createdBy, setCreatedBy] = useState("");
//   const[createdByOpt, setCreatedByOpt] = useState([]);
//   const[inputCreatedBy, setInputCreatedBy] = useState("");

//   const[openModal, setOpenModal] = useState(false);
//   const[empId, setEmpId] = useState("");
  

//    useEffect(()=>{
//     interactionCategoryOptions();
//     axios
//     .get(`${apiPath.prodPath}/api/users/allusers`)
//     .then((res) => {
//       const name = res.data.map((item) => {
//         const fullname = item.firstName + " " + item.secondName;
//         console.log(fullname);
//         return fullname;
//       });
//       const options = name.map((item)=>{
//         const statusOption = {
//           label : item,
//           value : item,
//         }
//         return statusOption;
//       });
//       setCreatedByOpt(options);
//     })
//     .catch((err) => {
//       console.log(err);
//       Swal.fire({
//         icon: "error",
//         text: "Something went wrong with the data fetching",
//       });
//     });

//     axios.get(`${apiPath.prodPath}/api/clients/client/${item._id}`)
//       .then((res) => {
//         setClientItem(res.data);
//         setLoader(false);
//       });
   
//   }, [open, loader]);

//   async function interactionCategoryOptions() {
//     const interactionCategories = await axios.get(`${apiPath.prodPath}/api/picklist/interactionType/getAllInteractionCategory`)
//     .then((res) => {
//       const categoryArr = res.data.interactionCategory;
//       console.log(categoryArr)
//       return categoryArr;
//     }); 
    
//     const options = interactionCategories.map((item)=>{
//       const statusOption = {
//         label : item.categoryName,
//         value : item.categoryName,
//       }
//       return statusOption;
//     });
//     setInteractionCategoryOpt(options);
//   }
  

//   const handleInputCreatedBy = (e) => {
//     setInputCreatedBy(e);
//   }
  
//   const handleInputInteractionCatagory = (e) => {
//     setInputInteractionCategory(e);
//   }

//   // const handleInteractionCategory = (e)=> {
//   //   setInteractionCategory(e);
//   // }

//   const handleUpload = async (e) => {
//     e.preventDefault();
    
//     if (editInteraction) {
//       const formData = new FormData();
//       console.log(interactionCategory, " ", interactionDescription, " ", date, " ", createdBy, " ");
//       formData.append("interactionCategory", interactionCategory);
//       formData.append("interactionDescription", interactionDescription);
//       formData.append("date", date);
//       formData.append("createdBy", createdBy.value);
      
//       await axios
//         .patch(`${apiPath.prodPath}/api/clients/editClientInteractions/${item._id}&&${interactionId}`, formData)
//         .then((res) => {
//           Swal.fire({
//             icon: "success",
//             text: "Client interaction Updated Successfully",
//           });
//           setInteractionCategory("");
//           setInputCreatedBy("");
//           setInputInteractionCategory("");
//           setInteractionDescription("");
//           setDate("");
//           setCreatedBy("");
//           setEditInteraction(false);
//         })
//         .catch((err) => {
//           console.log(err);
//           Swal.fire({
//             icon: "error",
//             text: "Something went wrong with the editing interaction",
//           });
//           setEditInteraction(false);
//         });

//     }else{
//       const formData = new FormData();
//       console.log(interactionCategory, " ", interactionDescription, " ", date, " ", createdBy, " ");
//       formData.append("interactionCategory", interactionCategory.value);
//       formData.append("interactionDescription", interactionDescription);
//       formData.append("date", date);
//       formData.append("createdBy", createdBy.value);
      
//       await axios
//         .patch(`${apiPath.prodPath}/api/clients/addClientInteractions/${item._id}`, formData)
//         .then((res) => {
//           Swal.fire({
//             icon: "success",
//             text: "Client Interaction added Successfully",
//           });
//           setInteractionCategory("");
//           setInputCreatedBy("");
//           setInputInteractionCategory("");
//           setInteractionDescription("");
//           setDate("");
//           setCreatedBy("");
//         })
//         .catch((err) => {
//           console.log(err);
//           Swal.fire({
//             icon: "error",
//             text: "Something went wrong with the adding interaction",
//           });
//         });
      
//     }
//   setLoader(true);    
//   };

//   const handleDelete = async (id) => {
//     Swal.fire({
//               icon: "warning",
//               text: `Are you sure you want to delete the note`,
//               showCancelButton: true,
//               cancelButtonText: "No",
//               showConfirmButton: true,
//               confirmButtonText: "Yes",
//             }).then(async(result)=>{
//               if(result.isConfirmed){
//                 await axios
//                   .patch(`${apiPath.prodPath}/api/clients/deleteClientInteraction/${item._id}&&${id}`)
//                   .then((res) => {
//                     Swal.fire({
//                       icon: "success",
//                       text: "Client Task Deleted Successfully",
//                     });
//                     setLoader(true);
//                   })
//                   .catch((err) => {
//                     console.log(err);
//                     Swal.fire({
//                       icon: "error",
//                       text: "Something went wrong with the deleting interaction",
//                     });
//                   });
//               }
//             })
    
    
//   }

//   const handleOpenModal = (item) => {
//     setEmpId(item._id);
//     setOpenModal(true);
//   };

//   const customStyles = {
//     control: (provided) => ({
//       ...provided,
//       backgroundColor: "#191526", 
//       color: "white", 
//       borderRadius: "12px",       
//       padding: "5px",            
//       borderColor: "#452C95",
//       "&:hover": {
//         borderColor: "darkviolet",
//       },
//     }),
//     menu: (provided) => ({
//       ...provided,
//       backgroundColor: "#191526",
//       borderRadius: "12px",       
//       padding: "5px", 
//     }),
//     option: (provided, state) => ({
//       ...provided,
//       backgroundColor: state.isSelected ? "darkviolet" : "#191526", 
//       color: "white",
//       "&:hover": {
//         backgroundColor: "darkviolet",
//       },
//       borderRadius: "12px",       
//       padding: "5px",
//     }),
//     singleValue: (provided) => ({
//       ...provided,
//       color: "white", 
//     }),
//   };

//   return (
//         <>
//       <form
//             onSubmit={handleUpload}
//             className="flex flex-col flex-wrap gap-5 items-center scroll-my-2 mt-8 mb-8"
//              >

//             <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
//               <div className="flex flex-col gap-2 w-1/2">
//                 <label className="font-satoshi text-md">Interaction Catagory</label>
//                 <Select
//                     options={interactionCategoryOpt}
//                     value={interactionCategory}
//                     onInputChange={handleInputInteractionCatagory}
//                     inputValue={inputInteractionCategory}
//                     onChange={(e) => setInteractionCategory(e)}
//                     styles={customStyles}
//                     placeholder="Select Interaction Catagory"
//                     id="role-select-cus"
//                     name="Interaction Catagory"
//                   />
//               </div>
//               <div className="flex flex-col gap-2 w-1/2">
//                 <label className="font-satoshi text-md">Created By</label>
//                 <Select
//                     options={createdByOpt}
//                     value={createdBy}
//                     onInputChange={handleInputCreatedBy}
//                     inputValue={inputCreatedBy}
//                     onChange={(e) => setCreatedBy(e)}
//                     styles={customStyles}
//                     placeholder="Select created by"
//                     id="role-select-cus"
//                     name="Created By"
//                   />
//               </div>
//             </div>          
            
//             <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
//               <div className="flex flex-col gap-2 w-1/2">
//                 <label className="font-satoshi text-md">Date</label>
//                 <input
//                   type="date"
//                   value={date}
//                   className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
//                   onChange={(e)=> setDate(e.target.value)}
//                   name="Date"
//                 />
//               </div>
//               <div className="flex flex-col gap-2 w-1/2">
//                 <label className="font-satoshi text-md">Interactions Description</label>
//                 <input
//                   type='text'
//                   value={interactionDescription}
//                   className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] h-[42px]"
//                   onChange={(e) => setInteractionDescription(e.target.value)}
//                   name="Interaction Description"
//                 />
//               </div>
//             </div>
            
            
            
//           <div className="flex flex-col items-end gap-2 w-full">
//               <input
//                 type="submit"
//                 className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
//                 value={editInteraction?`Edit`:`Add Interactions`}
//               />
//             </div>
      
//           </form>
//           {
            
//       <Table className="bg-[#231C46] rounded-[12px] font-satoshi">
//         <TableCaption>A list of all Client Interactions</TableCaption>
//         <TableHeader>
//           <TableRow className="w-fit, h-[58px] font-satoshi text-lg text-[#E1C9FF]">
//             <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Interaction Category</TableHead>
//             <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Interaction Description</TableHead>
//             <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>date</TableHead>
//             <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Created By</TableHead>
//             <TableHead className="text-[#E1C9FF]" >Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           { clientItem.interactions !== undefined && clientItem.interactions.map((i) => 
//              <TableRow className="w-fit, h-[72px] bg-[#2D245B] border-[1px] border-[#452C95]" key={i._id}>
//               <TableCell className="font-satoshi font-medium text-#fff">
//                 {i.interactionCategory}
//               </TableCell>
//               <TableCell className="font-satoshi font-medium text-#fff">
//                 {i.interactionDescription}
//               </TableCell>
//               <TableCell className="font-satoshi font-medium text-#fff">
//                 {i.date}
//               </TableCell>
//               <TableCell className="font-satoshi font-medium text-#fff">
//                 {i.createdBy}
//               </TableCell>
//               <TableCell className="font-satoshi font-medium text-#fff">
//                 <DropdownMenu className="">
//                   <DropdownMenuTrigger>
//                     <MoreVertIcon />
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent className="z-[9999]">
//                     <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                     <DropdownMenuSeparator />
//                     <DropdownMenuItem onClick={() => handleOpenModal(i)}>
//                       Open
//                     </DropdownMenuItem>
//                     <DropdownMenuItem onClick={() => {
//                       setEditInteraction(true);
//                       setInteractionId(i._id);
//                       setInteractionCategory({label: i.interactionCategory, value:i.interactionCategory});
//                       setInteractionDescription(i.interactionDescription);
//                       setDate(i.date);
//                       setCreatedBy({label: i.createdBy, value:i.createdBy});
//                     }}>
//                       Edit
//                     </DropdownMenuItem>
//                     <DropdownMenuItem onClick={() => handleDelete(i._id)}>
//                       Delete
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </TableCell>
//               {openModal && empId == i._id ? (
//                     <ClientInteractionDetails
//                       open={openModal}
//                       handleClose={() => setOpenModal(false)}
//                       item={i}
//                     />
//                   ) : null}
//             </TableRow>
//           ) }
//         </TableBody>
//       </Table>
//           }
//     </>
//   )
// }

// export default Interactions


"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  Video,
  MessageSquare,
  FileText,
  CheckSquare,
  User,
  RefreshCw,
  AlertCircle,
  Loader2,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import moment from "moment";
import axios from "axios";
import { apiPath } from "@/utils/routes";
import Select from "react-select";
import Swal from "sweetalert2";

// ─── icon + color helpers ────────────────────────────────────────────────────

const ICON_MAP = {
  note: FileText,
  call: Phone,
  email: Mail,
  meeting: Video,
  task: CheckSquare,
  linkedin_message: MessageSquare,
  sms: MessageSquare,
  whatsapp: MessageSquare,
  // manual interaction types fall through to FileText
};

const COLOR_MAP = {
  note: "bg-blue-500",
  call: "bg-green-500",
  email: "bg-purple-500",
  meeting: "bg-orange-500",
  task: "bg-yellow-500",
  linkedin_message: "bg-blue-600",
  sms: "bg-pink-500",
  whatsapp: "bg-green-600",
};

function getIcon(type) {
  const Icon = ICON_MAP[type?.toLowerCase()] || FileText;
  return <Icon className="h-4 w-4" />;
}

function getColor(type) {
  return COLOR_MAP[type?.toLowerCase()] || "bg-[#7C3AED]";
}

// ─── select styles ────────────────────────────────────────────────────────────

const selectStyles = {
  control: (p) => ({
    ...p,
    backgroundColor: "#0F0A1F",
    color: "white",
    borderRadius: "8px",
    padding: "2px",
    borderColor: "#452C95",
    "&:hover": { borderColor: "darkviolet" },
  }),
  menu: (p) => ({
    ...p,
    backgroundColor: "#191526",
    borderRadius: "8px",
    zIndex: 9999,
  }),
  option: (p, s) => ({
    ...p,
    backgroundColor: s.isSelected ? "darkviolet" : "#191526",
    color: "white",
    "&:hover": { backgroundColor: "darkviolet" },
    borderRadius: "6px",
  }),
  singleValue: (p) => ({ ...p, color: "white" }),
  placeholder: (p) => ({ ...p, color: "#6b7280" }),
  input: (p) => ({ ...p, color: "white" }),
};

// ─── add / edit form ──────────────────────────────────────────────────────────

function InteractionForm({
  clientId,
  categoryOptions,
  userOptions,
  editingItem,
  onSuccess,
  onCancel,
}) {
  const [category, setCategory] = useState(
    editingItem
      ? { label: editingItem.interactionCategory, value: editingItem.interactionCategory }
      : null
  );
  const [description, setDescription] = useState(editingItem?.interactionDescription || "");
  const [date, setDate] = useState(editingItem?.date || "");
  const [createdBy, setCreatedBy] = useState(
    editingItem
      ? { label: editingItem.createdBy, value: editingItem.createdBy }
      : null
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !createdBy) {
      Swal.fire({ icon: "warning", text: "Please fill all required fields." });
      return;
    }
    setSaving(true);
    const fd = new FormData();
    fd.append("interactionCategory", category.value);
    fd.append("interactionDescription", description);
    fd.append("date", date);
    fd.append("createdBy", createdBy.value);

    try {
      if (editingItem) {
        await axios.patch(
          `${apiPath.prodPath}/api/clients/editClientInteractions/${clientId}&&${editingItem._id}`,
          fd
        );
        Swal.fire({ icon: "success", text: "Interaction updated." });
      } else {
        await axios.patch(
          `${apiPath.prodPath}/api/clients/addClientInteractions/${clientId}`,
          fd
        );
        Swal.fire({ icon: "success", text: "Interaction added." });
      }
      onSuccess();
    } catch (err) {
      Swal.fire({ icon: "error", text: "Something went wrong." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#0F0A1F] border border-[#2D2640] rounded-lg p-4 mb-5 space-y-4"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-white">
          {editingItem ? "Edit Interaction" : "Add Interaction"}
        </span>
        <button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-300">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Category *</label>
          <Select
            options={categoryOptions}
            value={category}
            onChange={setCategory}
            styles={selectStyles}
            placeholder="Select category"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Created By *</label>
          <Select
            options={userOptions}
            value={createdBy}
            onChange={setCreatedBy}
            styles={selectStyles}
            placeholder="Select user"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2 border border-[#452C95] rounded-lg bg-[#191526] text-white text-sm focus:outline-none focus:border-violet-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description..."
            className="p-2 border border-[#452C95] rounded-lg bg-[#191526] text-white text-sm focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-1.5 text-xs rounded-lg border border-[#2D2640] text-gray-400 hover:bg-[#2D2640]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-1.5 text-xs rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center gap-2"
        >
          {saving && <Loader2 className="h-3 w-3 animate-spin" />}
          {editingItem ? "Save Changes" : "Add Interaction"}
        </button>
      </div>
    </form>
  );
}

// ─── single activity card ─────────────────────────────────────────────────────

function ActivityCard({ item, isManual, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  // Normalise fields between manual interactions and contact activities
  const type = isManual ? item.interactionCategory : item.type;
  const subject = isManual ? item.interactionCategory : item.subject;
  const body = isManual ? item.interactionDescription : item.body;
  const timestamp = isManual ? item.date : item.createdAt;
  const authorName = isManual
    ? item.createdBy
    : item.createdBy
    ? `${item.createdBy.firstName} ${item.createdBy.lastName}`
    : null;
  const contactChip = !isManual && item.contact
    ? `${item.contact.firstName} ${item.contact.lastName}`
    : null;

  const formattedTime = timestamp
    ? (() => {
        try {
          return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
        } catch {
          return timestamp;
        }
      })()
    : null;

  return (
    <Card className="bg-[#0F0A1F] border-[#2D2640] p-4 transition-colors hover:border-[#452C95]">
      <div className="flex gap-3">
        {/* Icon bubble */}
        <div
          className={[
            "h-9 w-9 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-0.5",
            getColor(type),
          ].join(" ")}
        >
          {getIcon(type)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Top row: badges + source tag + actions */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className="text-gray-300 border-gray-600 text-[10px] capitalize"
              >
                {type || "interaction"}
              </Badge>

              {/* Source badge */}
              <Badge
                variant="outline"
                className={
                  isManual
                    ? "text-violet-300 border-violet-700 text-[10px]"
                    : "text-teal-300 border-teal-700 text-[10px]"
                }
              >
                {isManual ? "manual" : "contact activity"}
              </Badge>

              {!isManual && item.direction && (
                <Badge
                  variant="outline"
                  className={
                    item.direction === "inbound"
                      ? "text-green-400 border-green-600 text-[10px]"
                      : "text-blue-400 border-blue-600 text-[10px]"
                  }
                >
                  {item.direction}
                </Badge>
              )}
              {!isManual && item.status && (
                <Badge
                  variant="outline"
                  className="text-gray-400 border-gray-600 text-[10px]"
                >
                  {item.status}
                </Badge>
              )}
            </div>

            {/* Edit / Delete only for manual entries */}
            {isManual && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => onEdit(item)}
                  className="p-1 rounded hover:bg-[#2D2640] text-gray-500 hover:text-gray-200 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onDelete(item._id)}
                  className="p-1 rounded hover:bg-[#2D2640] text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Subject */}
          {subject && (
            <h4 className="text-white font-medium text-sm mt-1.5 mb-1">{subject}</h4>
          )}

          {/* Body with expand/collapse */}
          {body && (
            <div>
              <p
                className={[
                  "text-gray-400 text-sm whitespace-pre-wrap",
                  !expanded ? "line-clamp-2" : "",
                ].join(" ")}
              >
                {body}
              </p>
              {body.length > 120 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-0.5 text-[10px] text-violet-400 hover:text-violet-300 mt-1"
                >
                  {expanded ? (
                    <><ChevronUp className="h-3 w-3" /> Show less</>
                  ) : (
                    <><ChevronDown className="h-3 w-3" /> Show more</>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Type-specific meta */}
          {!isManual && item.type === "call" && item.callDuration && (
            <p className="text-gray-500 text-xs mt-1.5">
              {`Duration: ${Math.floor(item.callDuration / 60)}m ${item.callDuration % 60}s`}
              {item.callOutcome && ` • Outcome: ${item.callOutcome}`}
            </p>
          )}
          {!isManual && item.type === "meeting" && item.meetingLocation && (
            <p className="text-gray-500 text-xs mt-1.5">Location: {item.meetingLocation}</p>
          )}
          {!isManual && item.type === "task" && item.taskDueDate && (
            <p className="text-gray-500 text-xs mt-1.5">
              Due: {moment(item.taskDueDate).format("MMM D, YYYY")}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#2D2640]">
            <span className="text-xs text-gray-500">
              {formattedTime}
              {authorName && (
                <span className="ml-2 text-gray-600">• {authorName}</span>
              )}
            </span>

            {contactChip && (
              <div className="flex items-center gap-1.5 bg-[#2D2640] rounded-full px-2.5 py-1 max-w-[180px]">
                <User className="h-3 w-3 text-[#7C3AED] flex-shrink-0" />
                <span className="text-xs text-gray-300 truncate">{contactChip}</span>
              </div>
            )}
          </div>

          {/* Attachments */}
          {!isManual && item.attachments?.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-[#2D2640]">
              <p className="text-xs text-gray-400 mb-2">
                Attachments ({item.attachments.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {item.attachments.map((file, idx) => (
                  <a
                    key={idx}
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-[#2D2640] text-gray-300 px-2 py-1 rounded hover:bg-[#3D3350] transition-colors"
                  >
                    {file.fileName}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── main export ──────────────────────────────────────────────────────────────

export default function CombinedInteractionsTab({ item, open }) {
  // ── contact activities ──
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState(null);
  const [totalContacts, setTotalContacts] = useState(0);

  // ── manual interactions ──
  const [clientItem, setClientItem] = useState(item);
  const [manualLoading, setManualLoading] = useState(false);

  // ── shared UI ──
  const [filterType, setFilterType] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // ── options for form ──
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);

  // ── fetchers ─────────────────────────────────────────────────────────────

  const fetchActivities = useCallback(async () => {
    if (!item?._id) return;
    setActivitiesLoading(true);
    setActivitiesError(null);
    try {
      const res = await axios.get(
        `${apiPath.prodPath}/api/clients/${item._id}/activities`
      );
      if (res.status === 200) {
        setActivities(res.data.activities || []);
        setTotalContacts(res.data.totalContacts || 0);
      }
    } catch (err) {
      setActivitiesError(
        err.response?.data?.message || err.message || "Failed to fetch activities"
      );
    } finally {
      setActivitiesLoading(false);
    }
  }, [item?._id]);

  const fetchClientItem = useCallback(async () => {
    if (!item?._id) return;
    setManualLoading(true);
    try {
      const res = await axios.get(`${apiPath.prodPath}/api/clients/client/${item._id}`);
      setClientItem(res.data);
    } catch (err) {
      console.error("Failed to fetch client item:", err);
    } finally {
      setManualLoading(false);
    }
  }, [item?._id]);

  const fetchOptions = useCallback(async () => {
    try {
      const [catRes, usersRes] = await Promise.all([
        axios.get(
          `${apiPath.prodPath}/api/picklist/interactionType/getAllInteractionCategory`
        ),
        axios.get(`${apiPath.prodPath}/api/users/allusers`),
      ]);
      setCategoryOptions(
        (catRes.data.interactionCategory || []).map((c) => ({
          label: c.categoryName,
          value: c.categoryName,
        }))
      );
      setUserOptions(
        (usersRes.data || []).map((u) => {
          const name = `${u.firstName} ${u.secondName}`;
          return { label: name, value: name };
        })
      );
    } catch (err) {
      console.error("Failed to fetch options:", err);
    }
  }, []);

  const refreshAll = useCallback(() => {
    fetchActivities();
    fetchClientItem();
  }, [fetchActivities, fetchClientItem]);

  useEffect(() => {
    refreshAll();
    fetchOptions();
  }, [open, refreshAll, fetchOptions]);

  // ── manual interaction actions ────────────────────────────────────────────

  const handleDelete = (id) => {
    Swal.fire({
      icon: "warning",
      text: "Are you sure you want to delete this interaction?",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.patch(
            `${apiPath.prodPath}/api/clients/deleteClientInteraction/${item._id}&&${id}`
          );
          Swal.fire({ icon: "success", text: "Interaction deleted." });
          fetchClientItem();
        } catch {
          Swal.fire({ icon: "error", text: "Failed to delete." });
        }
      }
    });
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingItem(null);
    fetchClientItem();
  };

  // ── merge + sort all items ────────────────────────────────────────────────

  const manualInteractions = (clientItem?.interactions || []).map((i) => ({
    ...i,
    _source: "manual",
    _sortDate: i.date ? new Date(i.date) : new Date(0),
  }));

  const contactActivities = activities.map((a) => ({
    ...a,
    _source: "activity",
    _sortDate: a.createdAt ? new Date(a.createdAt) : new Date(0),
  }));

  const allItems = [...manualInteractions, ...contactActivities].sort(
    (a, b) => b._sortDate - a._sortDate
  );

  // ── filter ────────────────────────────────────────────────────────────────

  const allTypes = [
    "all",
    ...new Set(
      allItems.map((i) =>
        i._source === "manual" ? i.interactionCategory : i.type
      )
    ),
  ].filter(Boolean);

  const filtered =
    filterType === "all"
      ? allItems
      : allItems.filter((i) => {
          const t = i._source === "manual" ? i.interactionCategory : i.type;
          return t === filterType;
        });

  const getCount = (type) => {
    if (type === "all") return allItems.length;
    return allItems.filter((i) => {
      const t = i._source === "manual" ? i.interactionCategory : i.type;
      return t === type;
    }).length;
  };

  const loading = activitiesLoading || manualLoading;

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-[#231C46] rounded-lg border border-[#2D2640] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Activity & interactions</h2>
          {allItems.length > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">
              {`${manualInteractions.length} manual · ${activities.length} from contacts`}
              {totalContacts > 0 && ` across ${totalContacts} contact${totalContacts !== 1 ? "s" : ""}`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setEditingItem(null);
              setShowForm((v) => !v);
            }}
            size="sm"
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add
          </Button>
          <Button
            onClick={refreshAll}
            size="sm"
            variant="outline"
            className="border-[#2D2640] text-gray-400 hover:bg-[#2D2640] hover:text-white bg-transparent"
          >
            <RefreshCw className={["h-3.5 w-3.5", loading ? "animate-spin" : ""].join(" ")} />
          </Button>
        </div>
      </div>

      {/* Inline Add / Edit Form */}
      {(showForm || editingItem) && (
        <InteractionForm
          clientId={item._id}
          categoryOptions={categoryOptions}
          userOptions={userOptions}
          editingItem={editingItem}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* Error banner for activities */}
      {activitiesError && (
        <div className="flex items-center gap-2 bg-red-900/20 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{activitiesError}</span>
          <button onClick={fetchActivities} className="ml-auto text-red-400 hover:text-red-200">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Filter pills */}
      {allItems.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {allTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={[
                "px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize",
                filterType === type
                  ? "bg-[#7C3AED] text-white"
                  : "bg-[#0F0A1F] text-gray-400 border border-[#2D2640] hover:border-[#7C3AED] hover:text-gray-200",
              ].join(" ")}
            >
              {type === "all" ? "All" : type} ({getCount(type)})
            </button>
          ))}
        </div>
      )}

      {/* Activity cards */}
      <div className="space-y-3">
        {loading && allItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-8 w-8 text-[#7C3AED] animate-spin" />
            <p className="text-gray-400 text-sm">Loading activities...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-1">
              {allItems.length === 0
                ? "No activities yet"
                : `No ${filterType} activities found`}
            </p>
            {allItems.length === 0 && (
              <p className="text-gray-600 text-sm">
                Add a manual interaction above or link contacts to this client.
              </p>
            )}
          </div>
        ) : (
          filtered.map((activityItem, index) => (
            <ActivityCard
              key={activityItem._id || index}
              item={activityItem}
              isManual={activityItem._source === "manual"}
              onEdit={(i) => {
                setEditingItem(i);
                setShowForm(false);
              }}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}