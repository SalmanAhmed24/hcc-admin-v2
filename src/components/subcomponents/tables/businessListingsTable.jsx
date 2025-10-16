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
// import moment from "moment";
// import AddPicklist from "../drawers/picklist";
// import { apiPath } from "@/utils/routes";
// import axios from "axios";
// import Swal from "sweetalert2";
// import { color } from "@mui/system";
// import AddSalelist from "../drawers/salelist";
// import SaleDetails from "../drawers/saleListOpen";
import BusinessListingsDetails from "../drawers/businessListingOpen";

function BusinessListingsTable({ picklistData, picklistName, refreshData, currentPage, totalPages, onPageChange, }) {
  const [addModal, setAddModal] = useState(false);
  const [id, setId] = useState("");
  const [item, setItem] = useState("");
  const [empModal, setEmpModal] = useState(false);
  const [empId, setEmpId] = useState("");
  const [openModal, setOpenModal] = useState(false);
  // const [currentPage, setCurrentPage] = useState(1);
  // const itemsPerPage = 8;
  console.log(picklistData);
  // const handlePageChange = (event, page) => {
  //   setCurrentPage(page);
  // };

  const handleEdit = (item) => {
    setAddModal(true);
    setId(item._id);
    setItem(item);
  };

  

  

//   const handleEditPicklist = async (data) => {
//     let url = "";
//     if (picklistName === "Web Requests") {
//       url = `${apiPath.prodPath}/api/webSaleLeads/modifyWebSaleLead/${id}`;
//     }
//     if (picklistName === "Contact Leads") {
//       url = `${apiPath.prodPath}/api/webContactLeads/modifyWebContactLead/${id}`;
//     }
//     if (picklistName == "Direct Mail"){
//           url = `${apiPath.prodPath}/api/directMail/modifyDirectMail/${id}`
//     }
    
//     await axios
//       .patch(url, data)
//       .then( () => {
//         setAddModal(false);
//         Swal.fire({
//           icon: "success",
//           text: "Edited Successfully",
//         });
//         refreshData();
//       })
//       .catch(async() => {
//         setAddModal(false);
//         Swal.fire({
//           icon: "error",
//           text: "Cannot Edit",
//         });
//          refreshData();
//       });
//   };

//   const handleDelete = async (item) => {
//     let url = "";
//     if (picklistName === "Web Requests") {
//       url = `${apiPath.prodPath}/api/webSaleLeads/deleteWebSaleLead/${item._id}`;
//     }
//     if (picklistName === "Contact Leads") {
//       url = `${apiPath.prodPath}/api/webContactLeads/deleteWebContactLead/${item._id}`;
//     }
//     if (picklistName == "Direct Mail"){
//           url = `${apiPath.prodPath}/api/directMail/deleteDirectMail/${item._id}`;
//     }

//     Swal.fire({
//       icon: "warning",
//       text: `Are you sure you want to delete ${picklistName}`,
//       showCancelButton: true,
//       cancelButtonText: "No",
//       showConfirmButton: true,
//       confirmButtonText: "Yes",
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         await axios
//           .delete(url)
//           .then( () => {
//              refreshData();
//           })
//           .catch((err) => console.log(err));
//       }
//     });
//   };

   const handleOpenModal = (item) => {
    setEmpId(item._id);
    setOpenModal(true);
  };

  return (
    <div>
      {picklistData.length ? (
        <>
          <Table className="bg-[#231C46] rounded-[12px] font-satoshi">
            <TableCaption>A list of all {picklistName}.</TableCaption>
            <TableHeader>
              <TableRow className="w-fit, h-[58px] font-satoshi text-lg text-[#E1C9FF]">
                <TableHead className="text-[#E1C9FF]">Actions</TableHead>
                {picklistName === "Business Listings" && (
                  <>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Name</TableHead>
                    {/* <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>google URL</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Place ID</TableHead> */}
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Phone</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Stars</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Number of Reviews</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Business Website</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Category</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Address</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>City</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>State</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Zipcode</TableHead>
                  </>
                )}
  
              </TableRow>
            </TableHeader>
            <TableBody>
              {picklistData.map((i) => (
                <TableRow className="w-fit, h-[72px] bg-[#2D245B] border-[1px] border-[#452C95]" key={i._id}>
                  <TableCell className="font-satoshi font-medium text-[#E1C9FF]">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertIcon />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(i)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(i)}>
                          Delete
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleOpenModal(i)}>
                          Open
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  {picklistName === "Business Listings" && (
                    <>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {`${i.storeName}`}
                      </TableCell>
                      {/* <TableCell className="font-satoshi font-medium text-#fff">
                        {i.googleUrl}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.placeId}
                      </TableCell> */}
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.phone}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.stars}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.numberOfReviews}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.bizWebsite}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.category}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.address}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.location.city}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.location.state}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.location.zipcode}
                      </TableCell>
                    </>
                  )}
                  {openModal && empId === i._id && (
                    <BusinessListingsDetails
                      open={openModal}
                      handleClose={() => setOpenModal(false)}
                      item={i}
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

export default BusinessListingsTable;

