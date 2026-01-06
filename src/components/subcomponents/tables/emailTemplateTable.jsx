import React, { useState } from "react";
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
import Pagination from "@mui/material/Pagination";
import moment from "moment";
import MailDetails from "../drawers/mailOpen";
import { Button } from "@/components/ui/button";
import EmailTemplateDetails from "../drawers/emailTemplateOpen";
import useAuthStore from "@/store/store";
import AddEmailTemplate from "../drawers/emailTemplateDrawer";
import axios from "axios";
import { apiPath } from "@/utils/routes";
import Swal from "sweetalert2";

function EmailTemplateTable({ picklistData, refreshData, picklistName }) {
  console.log("picklistData", picklistData);
  const [empId, setEmpId] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const user = useAuthStore((state) => state.user);
  const [emailTemplateModal, setEmailTemplateModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  

  const currentUsername = user?.user?._id;
  console.log("currentUsername", currentUsername);

  // Filter data to show only current user's templates
  const filteredData = picklistData.filter(
    item => item.createdBy?.username === currentUsername
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.length > 8 ? filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) : filteredData;

  const onPageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleOpenModal = (item) => {
    setEmpId(item.id);
    setOpenModal(true);
  };

  const handleEmailTemplateModal = (item) => {
    setEmailTemplateModal(true);
    setEditMode(true);
    setEditData(item);
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${apiPath.prodPath}/api/emailTemplate/deleteEmailTemplate/${id}`);
      console.log("response", response);
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Email Template deleted successfully",
        });
        refreshData();
      }
    } catch (error) {
      console.log("error", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong",
      });
    }
  };

  return (
    <div>
      <div className="flex flex-row items-center gap-2 mb-4">
        <Button
          className="bg-[#452C95] w-1/3 text-white hover:bg-[#452C95] hover:opacity-80"
          onClick={() => refreshData()}
        >
          Refresh
        </Button>
      </div>

      {currentItems.length > 0 ? (
        <>
          <Table className="bg-[#231C46] rounded-[12px] font-satoshi">
            <TableCaption>A list of all {picklistName}.</TableCaption>

            <TableHeader>
              <TableRow className="w-fit h-[58px] font-satoshi text-lg text-[#E1C9FF]">
                <TableHead className="text-[#E1C9FF]">Actions</TableHead>
                {picklistName === "Email Templates" && (
                  <>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Template Name</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Subject</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Created by</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Snippet</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentItems.map((i) => (
                <TableRow
                  className="w-fit h-[72px] bg-[#2D245B] border-[1px] border-[#452C95]"
                  key={i._id}
                >
                  <TableCell className="font-satoshi font-medium text-[#E1C9FF]">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertIcon />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleOpenModal(i)}>
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEmailTemplateModal(i)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(i._id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>

                  {picklistName === "Email Templates" && (
                    <React.Fragment key={`${i._id}-cells`}>
                      <TableCell className="font-satoshi font-medium text-white">
                        {i.templateName}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-white">
                        {i.subject}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-white">
                        {i.createdBy.fullname}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-white">
                        {i.body.slice(0, 20)}
                      </TableCell>
                    </React.Fragment>
                  )}

                  {openModal && empId === i.id && (
                    <EmailTemplateDetails
                      open={openModal}
                      handleClose={() => setOpenModal(false)}
                      item={i}
                    />
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <AddEmailTemplate 
          refreshData={refreshData}
          open={emailTemplateModal}
          handleClose={() => setEmailTemplateModal(false)}
          editMode={editMode}
          editData={editData}
           />

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
              ".MuiPaginationItem-root": {
                color: "white",
              },
              ".MuiPaginationItem-root.Mui-selected": {
                backgroundColor: "#555",
                color: "white",
              },
              ".MuiPaginationItem-root:hover": {
                backgroundColor: "#444",
              },
            }}
          />
        </>
      ) : (
        <p className="text-xl">No {picklistName} Data found</p>
      )}
    </div>
  );
}
export default EmailTemplateTable;