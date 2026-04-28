import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import moment from "moment";
import axios from "axios";
import { apiPath } from "@/utils/routes";
import Swal from "sweetalert2";
import React, { useState } from "react";
import AddCLient from "../drawers/addClient";
import ClientDetails from "../drawers/clientOpen";
import Pagination from "@mui/material/Pagination";

function EmployeeTable({ allEmp, refreshData, currentPage, totalPages, onPageChange }) {
  const [empModal,  setEmpModal]  = useState(false);
  const [empId,     setEmpId]     = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedPriorities, setSelectedPriorities] = useState({});

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handlePriorityChange = (clientId, value) => {
    setSelectedPriorities((prev) => ({ ...prev, [clientId]: value }));
  };

  const handleAddToResearch = async (clientId) => {
    const priority = selectedPriorities[clientId];
    if (!priority) {
      alert("Please select a priority level before adding to research.");
      return;
    }
    try {
      const res = await axios.patch(
        `${apiPath.prodPath}/api/clients/changeResearchTag/${clientId}`,
        { researchTag: true, researchPriority: priority }
      );
      if (res.status === 200) {
        alert("Client added to research successfully");
        refreshData();
      }
    } catch (error) {
      console.error("Failed to update research tag:", error);
      alert("Error updating client research tag");
    }
  };

  const handleEdit = (item) => {
    setEmpId(item._id);
    setEmpModal(true);
  };

  const handleOpenModal = (item) => {
    setEmpId(item._id);
    setOpenModal(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      icon: "warning",
      text: "Are you sure you want to delete the Client",
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${apiPath.prodPath}/api/clients/delete/${id}`)
          .then(() => refreshData())
          .catch((err) => console.error(err));
      }
    });
  };

  const editEmp = (data) => {
    axios
      .put(`${apiPath.prodPath}/api/clients/edit/${empId}`, data)
      .then(() => refreshData())
      .catch((err) => console.error(err));
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!allEmp.length) {
    return <p className="text-xl">No Client Data found</p>;
  }

  return (
    <div>
      <Table className="bg-[#231C46] rounded-[12px] font-satoshi">
        <TableCaption>A list of all Clients</TableCaption>

        <TableHeader>
          <TableRow className="w-fit h-[58px] font-satoshi text-lg text-[#E1C9FF]">
            <TableHead className="text-[#E1C9FF]">Actions</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 250 }}>Company/Client Name</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 250 }}>Primary Contact Name</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 250 }}>Email</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 250 }}>Created At</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 250 }}>Phone</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 250 }}>Cell</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 250 }}>Research Priority</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 250 }}>Add to Research</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 250 }}>Address 1</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 250 }}>Address 2</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 250 }}>City</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 250 }}>State</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 250 }}>ZipCode</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 250 }}>Website</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 250 }}>Status</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 250 }}>Client Need Category</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 250 }}>Client Need Sub-Category</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 250 }}>Lead Status</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 250 }}>Bus Registration Date</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 250 }}>Territory</TableHead>
            {/*
              CHANGED headers: labels unchanged, but the data they display
              now comes from UserRef .name instead of a raw string.
            */}
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 250 }}>Territory Manager</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 250 }}>Assigned To</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 250 }}>Assigned By</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {allEmp.map((i) => (
            <TableRow
              key={i._id}
              className="w-fit h-[72px] bg-[#2D245B] border-[1px] border-[#452C95]"
            >
              {/* Actions */}
              <TableCell className="font-satoshi font-medium text-[#E1C9FF]">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleOpenModal(i)}>Open</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(i)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(i._id)}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>

              {/* Plain string fields — unchanged */}
              <TableCell className="font-satoshi font-medium">{i.clientName}</TableCell>
              <TableCell className="font-satoshi font-medium">{i.primaryContact}</TableCell>
              <TableCell className="font-satoshi font-medium">{i.email}</TableCell>
              <TableCell className="font-satoshi font-medium">
                {moment(i.createdAt).format("MM-DD-YYYY")}
              </TableCell>
              <TableCell className="font-satoshi font-medium">{i.phone || ""}</TableCell>
              <TableCell className="font-satoshi font-medium">{i.cell  || ""}</TableCell>

              {/* Research priority selector */}
              <TableCell>
                <select
                  className="bg-[#1b071b] text-white px-2 py-1 rounded"
                  value={selectedPriorities[i._id] || ""}
                  onChange={(e) => handlePriorityChange(i._id, e.target.value)}
                >
                  <option value="">Select Priority</option>
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Low">Low</option>
                </select>
              </TableCell>

              {/* Add to research button */}
              <TableCell>
                <button
                  className={`px-3 py-1 rounded text-white ${
                    i.researchTag
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                  onClick={() => handleAddToResearch(i._id)}
                  disabled={i.researchTag}
                >
                  {i.researchTag ? "Under Research" : "Add to Research"}
                </button>
              </TableCell>

              {/* Address fields — unchanged */}
              <TableCell className="font-satoshi font-medium">{i.address1}</TableCell>
              <TableCell className="font-satoshi font-medium">{i.address2}</TableCell>
              <TableCell className="font-satoshi font-medium">{i.city}</TableCell>
              <TableCell className="font-satoshi font-medium">{i.state}</TableCell>
              <TableCell className="font-satoshi font-medium">{i.zipCode}</TableCell>
              <TableCell className="font-satoshi font-medium">{i.websiteAddress}</TableCell>
              <TableCell className="font-satoshi font-medium">{i.status}</TableCell>

              {/* Need category — unchanged */}
              <TableCell className="font-satoshi font-medium">
                {i.needCategory.categoryName + " - " + i.needCategory.categoryCode}
              </TableCell>
              <TableCell className="font-satoshi font-medium">
                {i.needCategory.subCategory.subCategoryName + " - " + i.needCategory.subCategory.subCategoryCode}
              </TableCell>

              <TableCell className="font-satoshi font-medium">{i.leadStatus}</TableCell>
              <TableCell className="font-satoshi font-medium">
                {i.busRegDate ? moment(i.busRegDate).format("MM-DD-YYYY") : "N/A"}
              </TableCell>

              {/* territory — plain string, unchanged */}
              <TableCell className="font-satoshi font-medium">{i.territory}</TableCell>

              {/*
                CHANGED: these three fields are now UserRef objects { id, name }.
                Read .name for display. Optional chaining handles unassigned
                records where the value is { id: null, name: null }.

                Old: {i.territoryManager}   → rendered "[object Object]"
                New: {i.territoryManager?.name}  → "Jane Doe" or blank

                Old: {i.assignedTo}         → rendered "[object Object]"
                New: {i.assignedTo?.name}   → "John Smith" or blank

                Old: {i.assignedBy}         → was reading wrong field entirely
                New: {i.assignee?.name}     → correct field, .name snapshot
              */}
              <TableCell className="font-satoshi font-medium">
                {i.territoryManager?.name || "—"}
              </TableCell>
              <TableCell className="font-satoshi font-medium">
                {i.assignedTo?.name || "—"}
              </TableCell>
              <TableCell className="font-satoshi font-medium">
                {i.assignee?.name || "—"}
              </TableCell>

              {/* Modals — rendered inside the row, unchanged pattern */}
              {empModal && empId === i._id && (
                <AddCLient
                  open={empModal}
                  handleClose={() => setEmpModal(false)}
                  edit={true}
                  editData={i}
                  editEmp={editEmp}
                />
              )}
              {openModal && empId === i._id && (
                <ClientDetails
                  open={openModal}
                  handleClose={() => setOpenModal(false)}
                  item={i}
                  refreshData={refreshData}
                />
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={onPageChange}
        sx={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "center",
          borderRadius: "20px",
          backgroundColor: "#333",
          ".MuiPaginationItem-root": { color: "white" },
          ".MuiPaginationItem-root.Mui-selected": { backgroundColor: "#555", color: "white" },
          ".MuiPaginationItem-root:hover": { backgroundColor: "#444" },
        }}
      />
    </div>
  );
}

export default EmployeeTable;