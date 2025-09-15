import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import axios from "axios";
import { apiPath } from "@/utils/routes";
// import { Button } from "@mui/material";
// import { Edit2Icon, Trash, View } from "lucide-react";
import Swal from "sweetalert2";
import Select from "react-select";
import HumanResourceOpen from './humanResourceOpen';
// import "./style.scss"
// import Drawer from "@mui/material/Drawer";
// import "./style.scss";
// import Checkbox from "@mui/material/Checkbox";
// import { FormControlLabel } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
// import debounce from "lodash.debounce";
import moment from "moment";
import { Value } from 'sass';
// import ResearchSocialMediaOpen from './clientResearchOpen/socialMediaInfoOpen';

const EmployeeHumanResources = ({item, open}) => {
  
  const [clientItem, setClientItem] = useState(item);
  const[loader, setLoader] = useState(false);
  const[openModal, setOpenModal] = useState(false);
  const[empId, setEmpId] = useState("");
  const [manager, setManager] = useState("");
  const [department, setDepartment] = useState("");
  const [departmentOpt, setDepartmentOpt] = useState([]);
  const [inputValueDepartment, setInputValueDepartment] = useState("");
  const [payRate, setPayRate] = useState(0);
  const [payCurrency, setPayCurrency] = useState("$");
  const [HireDate, setHireDate] = useState("");
  const [ReviewDate, setReviewDate] = useState("");
  const [editHR, setEditHR] = useState(false);
  const [managerOpt, setManagerOpt] = useState([]);
  const [inputValueManager, setInputValueManager] = useState("");

   useEffect(()=>{

    axios
        .get(`${apiPath.prodPath}/api/picklist/managers/getAllManagers`)
        .then((res) => {
          const name = res.data.managers.map((item) => {
            const fullname = item.managerName;
            return fullname;
          });
          const options = name.map((item)=>{
            const statusOption = {
              label : item,
              value : item,
            }
            return statusOption;
          });
          setManagerOpt(options);
        })
        .catch((err) => {
          console.log(err);
          Swal.fire({
            icon: "error",
            text: "Something went wrong with the data fetching",
          });
        });
    
    axios
        .get(`${apiPath.prodPath}/api/picklist/departments/getAllDepartments`)
        .then((res) => {
          const name = res.data.departments.map((item) => {
            const fullname = item.departmentName;
            return fullname;
          });
          const options = name.map((item)=>{
            const statusOption = {
              label : item,
              value : item,
            }
            return statusOption;
          });
          setDepartmentOpt(options);
        })
        .catch((err) => {
          console.log(err);
          Swal.fire({
            icon: "error",
            text: "Something went wrong with the data fetching",
          });
        });

    
   }, [open, loader]);


  

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (editHR) {
      const formData = new FormData();
      formData.append("manager", manager.value);
      formData.append("department", department.value);
      formData.append("payRate", payRate);
      formData.append("payCurrency", payCurrency);
      formData.append("HireDate", HireDate);
      formData.append("ReviewDate", ReviewDate);
      
      await axios
        .patch(`${apiPath.prodPath}/api/users/addHumanResource/${item._id}`, formData)
        .then((res) => {
          Swal.fire({
            icon: "success",
            text: "User HR details Updated Successfully",
          });
          setManager("");
          setDepartment("");
          setHireDate("");
          setReviewDate("");
          setPayCurrency("$");
          setPayRate(0);
          setEditHR(false);

        })
        .catch((err) => {
          console.log(err);
          Swal.fire({
            icon: "error",
            text: "Something went wrong with the editing User HR details",
          });
          setEditClientTask(false);
        });

    }else{
      const formData = new FormData();
      
      formData.append("manager", manager.value);
      formData.append("department", department.value);
      formData.append("payRate", payRate);
      formData.append("payCurrency", payCurrency);
      formData.append("HireDate", HireDate.toString());
      formData.append("ReviewDate", ReviewDate.toString());
      
      await axios
        .patch(`${apiPath.prodPath}/api/users/addHumanResource/${item._id}`, formData)
        .then((res) => {
          Swal.fire({
            icon: "success",
            text: "User HR details added Successfully",
          });
          setManager("");
          setDepartment("");
          setHireDate("");
          setReviewDate("");
          setPayCurrency("$");
          setPayRate(0);
          setEditHR(false);
          
        })
        .catch((err) => {
          console.log(err);
          Swal.fire({
            icon: "error",
            text: "Something went wrong with the adding User HR details",
          });
        });
      
    }
   try {
      const res = await axios.get(
        `${apiPath.prodPath}/api/users/user/${item._id}`
      );
      setClientItem(res.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  
  setLoader(true);    
  };

  const handleDelete = async (id) => {

    Swal.fire({
                  icon: "warning",
                  text: `Are you sure you want to delete the note`,
                  showCancelButton: true,
                  cancelButtonText: "No",
                  showConfirmButton: true,
                  confirmButtonText: "Yes",
                }).then(async (result)=>{
                  if(result.isConfirmed){
                    await axios
                    .patch(`${apiPath.prodPath}/api/clients/deleteClientTask/${item._id}&&${id}`)
                    .then((res) => {
                      Swal.fire({
                        icon: "success",
                        text: "Client Task Deleted Successfully",
                      });
                    })
                    .catch((err) => {
                      console.log(err);
                      Swal.fire({
                        icon: "error",
                        text: "Something went wrong with the deleting task",
                      });
                    });
                  setLoader(true);
                  }
                })
  }
  
  const handleOpenModal = (item) => {
    setEmpId(item._id);
    setOpenModal(true);
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

  const handleInputManagerChange = (newInputValue) => {
    setInputValueManager(newInputValue);
  };

  const handleInputDepartmentChange = (newInputValue) => {
    setInputValueDepartment(newInputValue);
  };



  return (
        <>
      <form
            onSubmit={handleUpload}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2 mt-8 mb-8"
             >
            <p>Human Resource Form</p>
            
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Manager</label>
               <Select
                    options={managerOpt}
                    value={manager}
                    onInputChange={handleInputManagerChange}
                    inputValue={inputValueManager}
                    onChange={(e) => setManager(e)}
                    placeholder="Select Manager"
                    styles={customStyles}
                    id="role-select-cus"
                    name="Manager"
                    required
                  />
              </div>
                <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Department</label>
                <Select
                    options={departmentOpt}
                    value={department}
                    onInputChange={handleInputDepartmentChange}
                    inputValue={inputValueDepartment}
                    onChange={(e) => setDepartment(e)}
                    placeholder="Select Department"
                    styles={customStyles}
                    id="role-select-cus"
                    name="Department"
                    required
                  />
              </div>
            </div>

            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
                <div className="flex flex-col gap-2 w-1/2">
                  <label className="font-satoshi text-md">Pay Rate</label>
                  <input
                    type="number"
                    value={payRate}
                    className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                    onChange={(e) => setPayRate(e.target.value)}
                    name="Pay Rate"
                  />
                </div>
                <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Pay Currency</label>
                <select
                  className="bg-[#1b071b] text-white px-2 py-1 rounded"
                  value={payCurrency || "USD"}
                  onChange={(e) => setPayCurrency(e.target.value)}
                  style={customStyles}
                  // id="role-select-cus"
                >
                  <option value="">Select Pay Currency</option>
                  <option value="USD">USD</option>
                  <option value="PKR">PKR</option>
                </select>
              </div>
            </div>
            

            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Hiring Date</label>
                <input
                  type="date"
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  value={HireDate}
                  onChange={(e) => setHireDate(e.target.value)}
                  placeholder="Enter Hiring Date"
                  name="Hiring Date"
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Review Date</label>
                <input
                  type="date"
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  value={ReviewDate}
                  onChange={(e) => setReviewDate(e.target.value)}
                  placeholder="Enter Review Date"
                  name="Review Date"
                />
                </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={editHR ? `Edit` : `Save`}
              />
            
            </div>
          
      
          </form>
          {
            
      <Table className="bg-[#231C46] rounded-[12px] font-satoshi">
        <TableCaption>Social Media Research</TableCaption>
        <TableHeader>
          <TableRow className="w-fit, h-[58px] font-satoshi text-lg text-[#E1C9FF]">
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Name</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Department</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Role</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Pay Rate</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Pay Currency</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Hire Date</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Review Date</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Manager</TableHead>
            <TableHead className="text-[#E1C9FF]" >Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
           {clientItem.humanResources ? ( <TableRow className="w-fit, h-[72px] bg-[#2D245B] border-[1px] border-[#452C95]" key={clientItem._id}>
              <TableCell className="font-satoshi font-medium text-#fff">
                {`${clientItem.firstName} ${clientItem.secondName}`}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {clientItem.humanResources.department ? clientItem.humanResources.department : " " }
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {clientItem.role ? clientItem.role : " "}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {clientItem.humanResources.payRate ? clientItem.humanResources.payRate : " "}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {clientItem.humanResources.payCurrency ? clientItem.humanResources.payCurrency : " "}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {clientItem.humanResources.HireDate ? moment(clientItem.humanResources.HireDate).format('YYYY-MM-DD') : ""}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {clientItem.humanResources.ReviewDate ? moment(clientItem.humanResources.ReviewDate).format('YYYY-MM-DD') : ""}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {clientItem.humanResources.manager ? clientItem.humanResources.manager : " "}
              </TableCell>
              <TableCell>
                <DropdownMenu className="">
                  <DropdownMenuTrigger>
                    <MoreVertIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="z-[9999]">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleOpenModal(clientItem)}>
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setEmpId(clientItem._id);
                      setEditHR(true);
                      setManager({label : clientItem.humanResources.manager, value : clientItem.humanResources.manager});
                      setDepartment({label : clientItem.humanResources.department, value : clientItem.humanResources.department});
                      setHireDate(clientItem.humanResources.HireDate);
                      setReviewDate(clientItem.humanResources.ReviewDate);
                      setPayRate(clientItem.humanResources.payRate);
                      setPayCurrency(clientItem.humanResources.payCurrency);
                      }}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(clientItem._id)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              {openModal && empId == clientItem._id ? (
                    <HumanResourceOpen
                      open={openModal}
                      handleClose={() => setOpenModal(false)}
                      item={clientItem}
                    />
                  ) : null}
            </TableRow> ) : null}
             
         
        </TableBody>
      </Table>
          }
    </>
  )
}

export default EmployeeHumanResources;
