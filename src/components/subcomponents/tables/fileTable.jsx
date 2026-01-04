import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@mui/material/Pagination";
import { Button } from "@/components/ui/button";
import { apiPath } from "@/utils/routes";
import { Edit2Icon, Share2Icon, Trash2Icon, Eye } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import AddUserFiles from "../drawers/addUserFiles"; // Make sure to import this
// import FilePreviewDrawer from "@/components/Viewer/FilePreviewer"; // Make sure to import this or create it
import NewFilePreviewDrawer from "@/components/Viewer/NewFilePreviewer";
import ShareFile from "../drawers/shareWithDrawer";

function FileTable({ picklistData, refreshData, picklistName }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [fileModal, setFileModal] = useState(false);
  const [editAttachments, setEditAttachments] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [shareDrawerOpen, setShareDrawerOpen] = useState(false);
  const [shareItem, setShareItem] = useState(null);
  const itemsPerPage = 8;

  // Safely check for user data
  useEffect(() => {
    if (picklistData && picklistData.length > 0) {
      console.log("Data received:", picklistData.map(i => i.user?.fullname || "No user"));
    }
  }, [picklistData]);

  // Pagination logic - only if picklistData exists
  const totalPages = Math.ceil((picklistData?.length || 0) / itemsPerPage);
  const currentItems = picklistData?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) || [];

  const onPageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleDelete = (item) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${apiPath.prodPath}/api/files/deleteFile/${item._id}`)
          .then((res) => {
            if (res.status === 200 || res.status === 201) {
              Swal.fire({
                title: "Deleted!",
                text: "Your file has been deleted.",
                icon: "success",
              });
              refreshData();
            }
          })
          .catch((err) => {
            console.log(err);
            Swal.fire({
              icon: "error",
              text: "Failed to delete file",
            });
          });
      }
    });
  };

  const handleShareClick = (item) => {
    setShareItem(item);
    setShareDrawerOpen(true);
  };

  const handlePreviewClick = (item) => {
    setSelectedItem(item);
    setPreviewFile(item);
    setPreviewOpen(true);
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setEditAttachments(true);
    setFileModal(true);
  };

  // If no data, show message
  if (!picklistData || picklistData.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="flex flex-row items-center gap-2 mb-4">
          <Button
            className="bg-[#452C95] w-1/3 text-white hover:bg-[#452C95] hover:opacity-80"
            onClick={() => refreshData()}
          >
            Refresh
          </Button>
        </div>
        <p className="text-white">No files found for {picklistName}</p>
      </div>
    );
  }

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

      {/* User Files Table */}
      {picklistName === "User Files" && (
        <>
          <Table className="bg-[#231C46] rounded-[12px] font-satoshi">
            <TableCaption>A list of all {picklistName}.</TableCaption>
            <TableHeader>
              <TableRow className="w-fit h-[58px] font-satoshi text-lg text-[#E1C9FF]">
                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>File Name</TableHead>
                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>File Category</TableHead>
                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Date</TableHead>
                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Uploaded By</TableHead>
                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Note</TableHead>
                {/* <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Shared File with</TableHead> */}
                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Tags</TableHead>
                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Share</TableHead>
                <TableHead className="text-[#E1C9FF]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((item) => (
                <TableRow className="w-fit h-[72px] bg-[#2D245B] border-[1px] border-[#452C95]" key={item._id}>
                  <TableCell className="font-satoshi font-medium text-white">{item.filename}</TableCell>
                  <TableCell className="font-satoshi font-medium text-white">{item.attachmentCategories}</TableCell>
                  <TableCell className="font-satoshi font-medium text-white">{item.date}</TableCell>
                  <TableCell className="font-satoshi font-medium text-white">{item.user?.fullname || "N/A"}</TableCell>
                  <TableCell className="font-satoshi font-medium text-white">{item.note || "N/A"}</TableCell>
                  {/* <TableCell className="font-satoshi font-medium text-white">
                    {item.sharedWith?.length > 0 
                      ? item.sharedWith.map((obj) => obj.username).join(', ') 
                      : 'None'}
                  </TableCell> */}
                  <TableCell className="font-satoshi font-medium text-white">
                    {item.tag?.length > 0 
                      ? item.tag.join(', ') 
                      : 'None'}
                  </TableCell>
                  <TableCell className="font-satoshi font-medium text-white">
                    <Button 
                      onClick={() => handleShareClick(item)} 
                      className="hover:bg-green-700 text-white p-2"
                    >
                      <Share2Icon size={16} />
                    </Button>
                  </TableCell>
                  <TableCell className="font-satoshi font-medium text-white">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDelete(item)}
                        className="hover:bg-red-700 text-white p-2"
                      >
                        <Trash2Icon size={16} />
                      </Button>
                      <Button 
                        onClick={() => handleEditClick(item)} 
                        className="hover:bg-green-700 text-white p-2"
                      >
                        <Edit2Icon size={16} />
                      </Button>
                      <Button 
                        onClick={() => handlePreviewClick(item)} 
                        className="hover:bg-blue-700 text-white p-2"
                      >
                        <Eye size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
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
          )}
        </>
      )}

      {/* Shared Files Table */}
      {picklistName === "Shared Files" && (
        <>
          <Table className="bg-[#231C46] rounded-[12px] font-satoshi">
            <TableCaption>A list of all {picklistName}.</TableCaption>
            <TableHeader>
              <TableRow className="w-fit h-[58px] font-satoshi text-lg text-[#E1C9FF]">
                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>File Name</TableHead>
                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>File Category</TableHead>
                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Date</TableHead>
                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Uploaded By</TableHead>
                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Note</TableHead>
                {/* <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Shared File with</TableHead> */}
                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Tags</TableHead>
                <TableHead className="text-[#E1C9FF]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((item) => (
                <TableRow className="w-fit h-[72px] bg-[#2D245B] border-[1px] border-[#452C95]" key={item._id}>
                  <TableCell className="font-satoshi font-medium text-white">{item.filename}</TableCell>
                  <TableCell className="font-satoshi font-medium text-white">{item.attachmentCategories}</TableCell>
                  <TableCell className="font-satoshi font-medium text-white">{item.date}</TableCell>
                  <TableCell className="font-satoshi font-medium text-white">{item.user?.fullname || "N/A"}</TableCell>
                  <TableCell className="font-satoshi font-medium text-white">{item.note || "N/A"}</TableCell>
                  {/* <TableCell className="font-satoshi font-medium text-white">
                    {item.sharedWith?.length > 0 
                      ? item.sharedWith.map((obj) => obj.username).join(', ') 
                      : 'None'}
                  </TableCell> */}
                  <TableCell className="font-satoshi font-medium text-white">
                    {item.tag?.length > 0 
                      ? item.tag.join(', ') 
                      : 'None'}
                  </TableCell>
                  <TableCell className="font-satoshi font-medium text-white">
                    <div className="flex gap-2">
                      {/* <Button
                        onClick={() => handleDelete(item)}
                        className="hover:bg-red-700 text-white p-2"
                      >
                        <Trash2Icon size={16} />
                      </Button>
                      <Button 
                        onClick={() => handleEditClick(item)} 
                        className="hover:bg-green-700 text-white p-2"
                      >
                        <Edit2Icon size={16} />
                      </Button> */}
                      <Button 
                        onClick={() => handlePreviewClick(item)} 
                        className="hover:bg-blue-700 text-white p-2"
                      >
                        <Eye size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
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
          )}
        </>
      )}

      {/* Common Files Table */}
      {picklistName === "Common Files" && (
        <>
          <Table className="bg-[#231C46] rounded-[12px] font-satoshi">
            <TableCaption>A list of all {picklistName}.</TableCaption>
            <TableHeader>
              <TableRow className="w-fit h-[58px] font-satoshi text-lg text-[#E1C9FF]">
                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>File Name</TableHead>
                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>File Category</TableHead>
                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Date</TableHead>
                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Uploaded By</TableHead>
                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Note</TableHead>
                {/* <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Shared File with</TableHead> */}
                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Tags</TableHead>
                <TableHead className="text-[#E1C9FF]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems
                .filter(item => item.tag?.includes("common"))
                .map((item) => (
                  <TableRow className="w-fit h-[72px] bg-[#2D245B] border-[1px] border-[#452C95]" key={item._id}>
                    <TableCell className="font-satoshi font-medium text-white">{item.filename}</TableCell>
                    <TableCell className="font-satoshi font-medium text-white">{item.attachmentCategories}</TableCell>
                    <TableCell className="font-satoshi font-medium text-white">{item.date}</TableCell>
                    <TableCell className="font-satoshi font-medium text-white">{item.user?.fullname || "N/A"}</TableCell>
                    <TableCell className="font-satoshi font-medium text-white">{item.note || "N/A"}</TableCell>
                    {/* <TableCell className="font-satoshi font-medium text-white">
                      {item.sharedWith?.length > 0 
                        ? item.sharedWith.map((obj) => obj.username).join(', ') 
                        : 'None'}
                    </TableCell> */}
                    <TableCell className="font-satoshi font-medium text-white">
                      {item.tag?.length > 0 
                        ? item.tag.join(', ') 
                        : 'None'}
                    </TableCell>
                    <TableCell className="font-satoshi font-medium text-white">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDelete(item)}
                          className="hover:bg-red-700 text-white p-2"
                        >
                          <Trash2Icon size={16} />
                        </Button>
                        <Button 
                          onClick={() => handleEditClick(item)} 
                          className="hover:bg-green-700 text-white p-2"
                        >
                          <Edit2Icon size={16} />
                        </Button>
                        <Button 
                          onClick={() => handlePreviewClick(item)} 
                          className="hover:bg-blue-700 text-white p-2"
                        >
                          <Eye size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
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
          )}
        </>
      )}

      {/* Modals */}
      {fileModal && editAttachments && selectedItem && (
        <AddUserFiles
          open={fileModal}
          handleClose={() => {
            setFileModal(false);
            setEditAttachments(false);
            setSelectedItem(null);
          }}
          refreshData={refreshData}
          editAttachments={editAttachments}
          item={selectedItem}
        />
      )}

      {previewOpen && previewFile && (
        <NewFilePreviewDrawer
          open={previewOpen}
          handleClose={() => {
            setPreviewOpen(false);
            setPreviewFile(null);
          }}
          item={previewFile}
          previewOpen={previewOpen}
        />
      )}
      
      {shareDrawerOpen && shareItem && (
        <ShareFile
          open={shareDrawerOpen}
          handleClose={() => {
            setShareDrawerOpen(false);
            setShareItem(null);
          }}
          item={shareItem}
        />
      )}
    </div>
  );
}

export default FileTable;