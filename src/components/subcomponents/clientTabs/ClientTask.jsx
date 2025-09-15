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
import { Button } from "@mui/material";
import { Edit2Icon, Trash, View } from "lucide-react";
import Swal from "sweetalert2";
import Select from "react-select";
import ClientTaskDetails from './clientTabsOpen/clientTaskOpen';
import "./style.scss"

const ClientTask = ({item, open}) => {
  
  const [clientItem, setClientItem] = useState(item);
  const[loader, setLoader] = useState(false);
  
  const [taskCategory, setTaskCategory] = useState("");
  const [taskCategoryOpt, setTaskCategoryOpt] = useState([]);
  const [inputTaskCategory, setInputTaskCategory] = useState("");
  
  const [taskStatus, setTaskStatus] = useState("");
  const [taskStatusOpt, setTaskStatusOpt] = useState([]);
  const [inputTaskStatus, setInputTaskStatus] = useState("");

  const [taskPriority, setTaskPriority] = useState("");
  const [taskPriorityOpt, setTaskPriorityOpt] = useState([]);
  const [inputTaskPriority, setInputTaskPriority] = useState("");

  const [taskDescription, setTaskDescription] = useState("");
  const [date, setDate] = useState("");

  const[createdBy, setCreatedBy] = useState("");
  const[createdByOpt, setCreatedByOpt] = useState([]);
  const[inputCreatedBy, setInputCreatedBy] = useState("");
  const[editClientTask, setEditClientTask] = useState(false);

  const[taskId, setTaskId] = useState("");
  const[openModal, setOpenModal] = useState(false);
  const[empId, setEmpId] = useState("");

   useEffect(()=>{
    taskCategoryOptions();
    taskStatusOptions();
    taskPriorityOptions();
    axios
    .get(`${apiPath.prodPath}/api/users/allusers`)
    .then((res) => {
      const name = res.data.map((item) => {
        const fullname = item.firstName + " " + item.secondName;
        console.log(fullname);
        return fullname;
      });
      const options = name.map((item)=>{
        const statusOption = {
          label : item,
          value : item,
        }
        return statusOption;
      });
      setCreatedByOpt(options);
    })
    .catch((err) => {
      console.log(err);
      Swal.fire({
        icon: "error",
        text: "Something went wrong with the data fetching",
      });
    });
    axios.get(`${apiPath.prodPath}/api/clients/client/${item._id}`)
      .then((res) => {
        setClientItem(res.data);
      });

      setLoader(false);
   
  }, [open, loader]);

  async function taskCategoryOptions() {
    const taskCategories = await axios.get(`${apiPath.prodPath}/api/picklist/taskCategory/getAllTaskCategory`)
    .then((res) => {
      const categoryArr = res.data.taskCategory;
      console.log(categoryArr)
      return categoryArr;
    });
    
    const options = taskCategories.map((item)=>{
      const statusOption = {
        label : item.categoryName,
        value : item.categoryName,
      }
      return statusOption;
    });
    setTaskCategoryOpt(options);
  }
  async function taskStatusOptions() {
    const taskStatus = await axios.get(`${apiPath.prodPath}/api/picklist/taskStatus/getAlltaskStatus`)
    .then((res) => {
      const statusArr = res.data.taskStatus;
      console.log(statusArr)
      return statusArr;
    });
    ;
    const options = taskStatus.map((item)=>{
      const statusOption = {
        label : item.status,
        value : item.status,
      }
      return statusOption;
    });
    setTaskStatusOpt(options);
  }

  async function taskPriorityOptions() {
    const taskPriority = await axios.get(`${apiPath.prodPath}/api/picklist/taskPriority/getAlltaskPriority`)
    .then((res) => {
      const priorityArr = res.data.taskPriority;
      console.log(priorityArr)
      return priorityArr;
    });
    // const sorts = [
    //   'High',
    //   'Medium',
    //   'Low',
    // ];
    const options = taskPriority.map((item)=>{
      const priorityOption = {
        label : item.priority,
        value : item.priority,
      }
      return priorityOption;
    });
    setTaskPriorityOpt(options);
  }

  const handleInputCreatedBy = (e) => {
    setInputCreatedBy(e);
  }

  const handleInputTaskPriority = (e) => {
    setInputTaskPriority(e);
  }

  const handleInputTaskStatus = (e) => {
    setInputTaskStatus(e);
  }
  
  const handleInputTaskCatagory = (e) => {
    setInputTaskCategory(e);
  }

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (editClientTask) {
      const formData = new FormData();
      console.log(taskCategory, " ", taskDescription, " ", taskPriority, " ", date, " ", createdBy, " ", taskStatus);
      formData.append("taskCategory", taskCategory.value);
      formData.append("taskDescription", taskDescription);
      formData.append("taskPriority", taskPriority.value);
      formData.append("date", date);
      formData.append("createdBy", createdBy.value);
      formData.append("taskStatus", taskStatus.value);
      
      await axios
        .patch(`${apiPath.prodPath}/api/clients/editClientTask/${item._id}&&${taskId}`, formData)
        .then((res) => {
          Swal.fire({
            icon: "success",
            text: "Client Task Updated Successfully",
          });
          setTaskCategory("");
          setInputCreatedBy("");
          setInputTaskCategory("");
          setInputTaskPriority("");
          setInputTaskStatus("");
          setTaskDescription("");
          setTaskPriority("");
          setDate("");
          setCreatedBy("");
          setTaskStatus("");
          setEditClientTask(false);
        })
        .catch((err) => {
          console.log(err);
          Swal.fire({
            icon: "error",
            text: "Something went wrong with the editing task",
          });
          setEditClientTask(false);
        });

    }else{
      const formData = new FormData();
      console.log(taskCategory, " ", taskDescription, " ", taskPriority, " ", date, " ", createdBy, " ", taskStatus);
      formData.append("taskCategory", taskCategory.value);
      formData.append("taskDescription", taskDescription);
      formData.append("taskPriority", taskPriority.value);
      formData.append("date", date);
      formData.append("createdBy", createdBy.value);
      formData.append("taskStatus", taskStatus.value);
      
      await axios
        .patch(`${apiPath.prodPath}/api/clients/addClientTask/${item._id}`, formData)
        .then((res) => {
          Swal.fire({
            icon: "success",
            text: "Client Task added Successfully",
          });
          setTaskCategory("");
          setTaskDescription("");
          setTaskPriority("");
          setDate("");
          setCreatedBy("");
          setTaskStatus("");
          setEditClientTask(false);
        })
        .catch((err) => {
          console.log(err);
          Swal.fire({
            icon: "error",
            text: "Something went wrong with the adding task",
          });
        });
      
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

  return (
        <>
      <form
            onSubmit={handleUpload}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2 mt-8 mb-8"
             >
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Task Catagory</label>
                <Select
                    options={taskCategoryOpt}
                    value={taskCategory}
                    onInputChange={handleInputTaskCatagory}
                    inputValue={inputTaskCategory}
                    onChange={(e) => setTaskCategory(e)}
                    placeholder="Select Task Catagory"
                    styles={customStyles}
                    id="role-select-taskC"
                    name="Task Catagory"
                  />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Date</label>
                <input
                  type="date"
                  value={date}
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  onChange={(e)=> setDate(e.target.value)}
                  name="Date"
                />
              </div>
            </div>
            
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Task Priority</label>
                <Select
                    options={taskPriorityOpt}
                    value={taskPriority}
                    onInputChange={handleInputTaskPriority}
                    inputValue={inputTaskPriority}
                    onChange={(e) => setTaskPriority(e)}
                    placeholder="Select Task Priority"
                    styles={customStyles}
                    id="role-select-cusTaskPriorty"
                    name="Task Priority"
                  />
              </div>
                <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Created By</label>
                <Select
                    options={createdByOpt}
                    value={createdBy}
                    onInputChange={handleInputCreatedBy}
                    inputValue={inputCreatedBy}
                    onChange={(e) => setCreatedBy(e)}
                    placeholder="Select created by"
                    styles={customStyles}
                    id="role-select-cus"
                    name="Created By"
                  />
              </div>

            </div>
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
                <div className="flex flex-col gap-2 w-1/2">
                  <label className="font-satoshi text-md">Task Status</label>
                  <Select
                      options={taskStatusOpt}
                      value={taskStatus}
                      onInputChange={handleInputTaskStatus}
                      inputValue={inputTaskStatus}
                      onChange={(e) => setTaskStatus(e)}
                      placeholder="Select task Status"
                      styles={customStyles}
                      id="role-select-cus"
                      name="Task Status"
                    />
                </div>
                <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Task Description</label>
                <input
                  type='text'
                  value={taskDescription}
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] h-[42px]"
                  onChange={(e) => setTaskDescription(e.target.value)}
                  name="Note Description"
                  // maxLength={1000}
                />
                {/* <p className="text-sm text-gray-400">{taskDescription.length}/1000</p> */}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={editClientTask?`Edit`:`Add Task`}
              />
            
            </div>
          
      
          </form>
          {
            
      <Table className="bg-[#231C46] rounded-[12px] font-satoshi">
        <TableCaption>A list of all Client Task</TableCaption>
        <TableHeader>
          <TableRow className="w-fit, h-[58px] font-satoshi text-lg text-[#E1C9FF]">
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Task Category</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Task Status</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Task Description</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Task Priority</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>date</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Created By</TableHead>
            <TableHead className="text-[#E1C9FF]" >Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          { clientItem.clientTasks !== undefined && clientItem.clientTasks.map((i) => 
             <TableRow className="w-fit, h-[72px] bg-[#2D245B] border-[1px] border-[#452C95]" key={i._id}>
              <TableCell className="font-satoshi font-medium text-#fff">
                {i.taskCategory}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {i.taskStatus}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {i.taskDescription}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {i.taskPriority}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {i.date}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {i.createdBy}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                <DropdownMenu className="">
                  <DropdownMenuTrigger>
                    <MoreVertIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="z-[9999]">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleOpenModal(i)}>
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setEditClientTask(true); 
                      setTaskCategory({label: i.taskCategory, value: i.taskCategory});
                      setTaskDescription(i.taskDescription); 
                      setTaskPriority({label: i.taskPriority, value: i.taskPriority}); 
                      setDate(i.date); 
                      setCreatedBy({label: i.createdBy, value: i.createdBy}); 
                      setTaskStatus({label: i.taskStatus, value: i.taskStatus});
                      setTaskId(i._id);
                      }}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(i._id)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              {openModal && empId == i._id ? (
                    <ClientTaskDetails
                      open={openModal}
                      handleClose={() => setOpenModal(false)}
                      item={i}
                    />
                  ) : null}
            </TableRow>
          ) }
        </TableBody>
      </Table>
          }
    </>
  )
}

export default ClientTask
