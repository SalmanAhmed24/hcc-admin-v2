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
import AddPicklist from "../drawers/picklist";
import { apiPath } from "@/utils/routes";
import axios from "axios";
import Swal from "sweetalert2";
import { color } from "@mui/system";

function PicklistTable({ picklistData, picklistName, refreshData, currentPage, totalPages, onPageChange, }) {
  const [addModal, setAddModal] = useState(false);
  const [id, setId] = useState("");
  const [item, setItem] = useState("");
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

  const handleEditPicklist = async (data) => {
    let url = "";
    if (picklistName === "Zip Code") {
      url = `${apiPath.prodPath}/api/picklist/zipcodes/modifyzipcode/${id}`;
    }
    if (picklistName === "User Type") {
      url = `${apiPath.prodPath}/api/picklist/userTypes/modifyusertype/${id}`;
    }
    if (picklistName === "Territory") {
      url = `${apiPath.prodPath}/api/picklist/territory/modifyterritory/${id}`;
    }
    if (picklistName === "Managers") {
      url = `${apiPath.prodPath}/api/picklist/managers/modifyManager/${id}`;
    }
    if (picklistName === "File Category") {
      url = `${apiPath.prodPath}/api/picklist/fileCategory/modifyFileCategory/${id}`;
    }
    if (picklistName === "Task Category") {
      url = `${apiPath.prodPath}/api/picklist/taskCategory/modifyTaskCategory/${id}`;
    }
    if (picklistName === "Notes Category") {
      url = `${apiPath.prodPath}/api/picklist/noteCategory/modifyNoteCategory/${id}`;
    }
    if (picklistName === "Interaction Category") {
      url = `${apiPath.prodPath}/api/picklist/interactionType/modifyInteractionCategory/${id}`;
    }
    if (picklistName === "Client Status") {
      url = `${apiPath.prodPath}/api/picklist/clientStatus/modifyClientStatus/${id}`;
    }
    if (picklistName === "Task Status") {
      url = `${apiPath.prodPath}/api/picklist/taskStatus/modifyTaskStatus/${id}`;
    }
    if (picklistName === "Task Priority") {
      url = `${apiPath.prodPath}/api/picklist/taskPriority/modifyTaskPriority/${id}`;
    }
    if (picklistName === "Need Category") {
      url = `${apiPath.prodPath}/api/picklist/needCategory/modifyNeedCategory/${id}`;
    }
    if (picklistName === "Need Sub-Category") {
      url = `${apiPath.prodPath}/api/picklist/needSubCategory/modifyNeedSubCategory/${id}`;
    }
    if (picklistName === "Status") {
      url = `${apiPath.prodPath}/api/picklist/status/modifyStatus/${id}`;
    }
    if (picklistName == "Carrier Route"){
      url = `${apiPath.prodPath}/api/picklist/carrierRoute/modifyCarrierRoute/${id}`;
    }
    if (picklistName == "DM State"){
      url = `${apiPath.prodPath}/api/picklist/DMstate/modifyDMstate/${id}`;
    }
    if (picklistName == "Product List"){
      url = `${apiPath.prodPath}/api/picklist/productList/modifyProduct/${id}`;
    }
    if (picklistName == "Service List"){
      url = `${apiPath.prodPath}/api/picklist/serviceList/modifyService/${id}`;
    }
    if (picklistName == "Department"){
      url = `${apiPath.prodPath}/api/picklist/departments/modifyDepartment/${id}`;
    }
    await axios
      .patch(url, data)
      .then( () => {
        setAddModal(false);
        Swal.fire({
          icon: "success",
          text: "Edited Successfully",
        });
        refreshData();
      })
      .catch(async() => {
        setAddModal(false);
        Swal.fire({
          icon: "error",
          text: "Cannot Edit",
        });
         refreshData();
      });
  };

  const handleDelete = async (item) => {
    let url = "";
    if (picklistName === "Zip Code") {
      url = `${apiPath.prodPath}/api/picklist/zipcodes/deletezipcode/${item._id}`;
    }
    if (picklistName === "User Type") {
      url = `${apiPath.prodPath}/api/picklist/userTypes/deleteusertype/${item._id}`;
    }
    if (picklistName === "Territory") {
      url = `${apiPath.prodPath}/api/picklist/territory/deleteterritory/${item._id}`;
    }
    if (picklistName === "Managers") {
      url = `${apiPath.prodPath}/api/picklist/managers/deleteManager/${item._id}`;
    }
    if (picklistName === "File Category") {
      url = `${apiPath.prodPath}/api/picklist/fileCategory/deleteFileCategory/${item._id}`;
    }
    if (picklistName === "Task Category") {
      url = `${apiPath.prodPath}/api/picklist/taskCategory/deleteTaskCategory/${item._id}`;
    }
    if (picklistName === "Notes Category") {
      url = `${apiPath.prodPath}/api/picklist/noteCategory/deleteNoteCategory/${item._id}`;
    }
    if (picklistName === "Interaction Category") {
      url = `${apiPath.prodPath}/api/picklist/interactionType/deleteInteractionCategory/${item._id}`;
    }
    if (picklistName === "Client Status") {
      url = `${apiPath.prodPath}/api/picklist/clientStatus/deleteClientStatus/${item._id}`;
    }
    if (picklistName === "Task Status") {
      url = `${apiPath.prodPath}/api/picklist/taskStatus/deleteTaskStatus/${item._id}`;
    }
    if (picklistName === "Task Priority") {
      url = `${apiPath.prodPath}/api/picklist/taskPriority/deleteTaskPriority/${item._id}`;
    }
    if (picklistName === "Need Category") {
      url = `${apiPath.prodPath}/api/picklist/needCategory/deleteNeedCategory/${item._id}`;
    }
    if (picklistName === "Need Sub-Category") {
      url = `${apiPath.prodPath}/api/picklist/needSubCategory/deleteNeedSubCategory/${item._id}`;
    }
    if (picklistName === "Status") {
      url = `${apiPath.prodPath}/api/picklist/status/deleteStatus/${item._id}`;
    }
    
    if (picklistName == "Carrier Route"){
      url = `${apiPath.prodPath}/api/picklist/carrierRoute/deleteCarrierRoute/${item._id}`;
    }
    if (picklistName == "DM State"){
      url = `${apiPath.prodPath}/api/picklist/DMstate/deleteDMstate/${item._id}`;
    }
    if (picklistName == "Product List"){
      url = `${apiPath.prodPath}/api/picklist/productList/deleteProduct/${item._id}`;
    }
    if (picklistName == "Service List"){
      url = `${apiPath.prodPath}/api/picklist/serviceList/deleteService/${item._id}`;
    }
    if (picklistName == "Department"){
          url = `${apiPath.prodPath}/api/picklist/departments/deleteDepartment/${item._id}`;
    }

    Swal.fire({
      icon: "warning",
      text: `Are you sure you want to delete ${picklistName}`,
      showCancelButton: true,
      cancelButtonText: "No",
      showConfirmButton: true,
      confirmButtonText: "Yes",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await axios
          .delete(url)
          .then( () => {
             refreshData();
          })
          .catch((err) => console.log(err));
      }
    });
  };

  // const indexOfLastItem = currentPage * itemsPerPage;
  // const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const currentItems = picklistData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div>
      {picklistData.length ? (
        <>
          <Table className="bg-[#231C46] rounded-[12px] font-satoshi">
            {/* <TableCaption>A list of all {picklistName}.</TableCaption> */}
            <TableHeader>
              <TableRow className="w-fit, h-[58px] font-satoshi text-lg text-[#E1C9FF]">
                <TableHead className="text-[#E1C9FF]">Actions</TableHead>
                {picklistName === "Zip Code" && (
                  <>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Zip Code</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>City</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>State</TableHead>
                  </>
                )}
                {picklistName === "User Type" && (
                  <>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Name</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Short Code</TableHead>
                  </>
                )}
                {picklistName === "Territory" && (
                  <>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Territory Name</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Zipcodes</TableHead>
                  </>
                )}
                {picklistName === "Task Category" && (
                  <>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Category Name</TableHead>
                  </>
                )}
                {picklistName === "Notes Category" && (
                  <>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Category Name</TableHead>
                  </>
                )}
                {picklistName === "Interaction Category" && (
                  <>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Category Name</TableHead>
                  </>
                )}
                {picklistName === "Managers" && (
                  <>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Manager Name</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Manager Role</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Manager Territory</TableHead>
                  </>
                )}
                {picklistName === "File Category" && (
                  <>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Category Name</TableHead>
                  </>
                )}
                {picklistName === "Client Status" && (
                  <>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Status Name</TableHead>
                  </>
                )}
                {picklistName === "Task Status" && (
                  <>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Status Name</TableHead>
                  </>
                )}
                {picklistName === "Task Priority" && (
                  <>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Priority Name</TableHead>
                  </>
                )}
                {picklistName === "Need Category" && (
                  <>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Category</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Category Code</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Sub-Category</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Sub-Category Code</TableHead>
                  </>
                )}
                {picklistName === "Need Sub-Category" && (
                  <>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Sub-Category</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Sub-Category Code</TableHead>
                  </>
                )}
                {picklistName === "Status" && (
                  <>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Status</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Status Code</TableHead>
                  </>
                )}
                {picklistName === "Carrier Route" && (
                  <>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Carrier Route</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Route Description</TableHead>
                  </>
                )}
                {picklistName === "DM State" && (
                  <>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>State Name</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>State Code</TableHead>
                  </>
                )}
                {picklistName === "Product List" && (
                  <>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Product Name</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Tools</TableHead>
                  </>
                )}
                {picklistName === "Service List" && (
                  <>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Service Name</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Tools</TableHead>
                  </>
                )}
                {picklistName === "Department" && (
                  <>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Department Name</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Department ShortCode</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Department Description</TableHead>
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  {picklistName === "Zip Code" && (
                    <>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.zipCode}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.city.map((item) => item + ", ")}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.state}
                      </TableCell>
                    </>
                  )}
                  {picklistName === "User Type" && (
                    <>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.userTypeCategory}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.userTypeFlag}
                      </TableCell>
                    </>
                  )}
                  {picklistName === "Territory" && (
                    <>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.territoryName}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.territoryState.map((item) => item + ", ")}
                      </TableCell>
                    </>
                  )}
                  {picklistName === "Task Category" && (
                    <>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.categoryName}
                      </TableCell>
                    </>
                  )}
                  {picklistName === "Notes Category" && (
                    <>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.categoryName}
                      </TableCell>
                    </>
                  )}
                  {picklistName === "Interaction Category" && (
                    <>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.categoryName}
                      </TableCell>
                    </>
                  )}
                  {picklistName === "Managers" && (
                    <>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.managerName}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.managerRole}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.managerTerritory}
                      </TableCell>
                    </>
                  )}
                  {picklistName === "File Category" && (
                    <>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.categoryName}
                      </TableCell>
                    </>
                  )}
                  {picklistName === "Client Status" && (
                    <>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.status}
                      </TableCell>
                    </>
                  )}
                  {picklistName === "Task Status" && (
                    <>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.status}
                      </TableCell>
                    </>
                  )}
                  {picklistName === "Task Priority" && (
                    <>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.priority}
                      </TableCell>
                    </>
                  )}
                  {picklistName === "Need Category" && (
                    <>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.categoryName}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.categoryCode}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.subCategory.map((item) => item.subCategoryName + ", ")}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.subCategory.map((item) => item.subCategoryCode + ", ")}
                      </TableCell>
                    </>
                  )}
                  {picklistName === "Need Sub-Category" && (
                    <>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.subCategoryName}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.subCategoryCode}
                      </TableCell>
                    </>
                  )}
                  {picklistName === "Status" && (
                    <>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.statusName}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.statusCode}
                      </TableCell>
                    </>
                  )}
                  {picklistName === "Carrier Route" && (
                    <>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.carrierRoute}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.routeDescription}
                      </TableCell>
                    </>
                  )}
                  {picklistName === "DM State" && (
                    <>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.stateName}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.stateCode}
                      </TableCell>
                    </>
                  )}
                  
                  {picklistName === "Product List" && (
                    <>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.productName}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.tools.map((item) => item + ", ")}
                      </TableCell>
                    </>
                  )}
                  {picklistName === "Service List" && (
                    <>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.serviceName}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.tools.map((item) => item + ", ")}
                      </TableCell>
                    </>
                  )}
                  {picklistName === "Department" && (
                    <>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.departmentName}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.departmentShortCode}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-#fff">
                        {i.departmentDescription}
                      </TableCell>
                    </>
                  )}
                  
                  {id === i._id && addModal && (
                    <AddPicklist  
                      edit={true}
                      editData={i}
                      picklistName={picklistName}
                      open= {addModal}
                      handleClose={() => setAddModal(false)}
                      editPicklist={handleEditPicklist}
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

export default PicklistTable;

