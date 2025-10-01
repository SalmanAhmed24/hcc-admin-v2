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
import Swal from "sweetalert2";
import Select from "react-select";
import "./style.scss"
import useAuthStore from "@/store/store";
import SubTaskInfo from './TaskModalOpen/subTaskOpen';


const SubTask = ({item, open}) => {
  
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

//   const[createdBy, setCreatedBy] = useState("");
//   const[createdByOpt, setCreatedByOpt] = useState([]);
//   const[inputCreatedBy, setInputCreatedBy] = useState("");
  const[editClientTask, setEditClientTask] = useState(false);

  const[taskId, setTaskId] = useState("");
  const[openModal, setOpenModal] = useState(false);
  const[empId, setEmpId] = useState("");
  const user = useAuthStore((state) => state.user);


  const [assignToOpt, setAssignToOpt] = useState([]);
  const [inputAssignTo, setInputAssignTo] = useState("");
  const [assignedToUsername, setAssignedToUsername] = useState("");

  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState("");


   useEffect(()=>{
    taskCategoryOptions();
    taskStatusOptions();
    taskPriorityOptions();
    axios.get(`${apiPath.prodPath}/api/tasks/${item._id}`)
      .then((res) => {
        setClientItem(res.data);
      });

      setLoader(false);

    axios
    .get(`${apiPath.prodPath}/api/users/allusers`)
    .then((res) => {
      
      const options = res.data.map((item)=>{
        const statusOption = {
          label : item.firstName + " " + item.secondName,
          value : item.firstName + " " + item.secondName,
          username : item.username,
        }
        return statusOption;
      });
      setAssignToOpt(options);
    })
    .catch((err) => {
      console.log(err);
      Swal.fire({
        icon: "error",
        text: "Something went wrong with the data fetching",
      });
    });
   
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

//   const handleInputCreatedBy = (e) => {
//     setInputCreatedBy(e);
//   }

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
        const username = user?.user?.username
      const formData = new FormData();
      
      const assignedTo = assignedToUsername.map(user => {
        return {
          fullname: user.value,
          username: user.username
        };
      });

      console.log(taskCategory, " ", taskDescription, " ", taskPriority, " ", date, " ", createdBy, " ", taskStatus, " ", assignedTo, " ", tags);
      formData.append("subTaskCategory", taskCategory.value);
      formData.append("taskDescription", taskDescription);
      formData.append("taskPriority", taskPriority.value);
      formData.append("date", date);
      formData.append("createdBy", username);
      formData.append("taskStatus", taskStatus.value);
      formData.append("assignedTo", JSON.stringify(assignedTo));
      formData.append("tags", JSON.stringify(tags));
      
      await axios
        .patch(`${apiPath.prodPath}/api/tasks/editSubTask/${item._id}&&${taskId}`, formData)
        .then((res) => {
          Swal.fire({
            icon: "success",
            text: "SubTask Updated Successfully",
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
          setAssignedToUsername("");
          setTags([]);
            
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
      const username = user?.user?.username

      const assignedTo = assignedToUsername.map(user => {
        return {
          fullname: user.value,
          username: user.username
        };
      });

      console.log(taskCategory, " ", taskDescription, " ", taskPriority, " ", date, " ", username, " ", taskStatus, " ", assignedTo, " ", tags);
      formData.append("subTaskCategory", taskCategory.value);
      formData.append("taskDescription", taskDescription);
      formData.append("taskPriority", taskPriority.value);
      formData.append("date", date);
      formData.append("createdBy", username);
      formData.append("taskStatus", taskStatus.value);
      formData.append("assignedTo", JSON.stringify(assignedTo));
      formData.append("tags", JSON.stringify(tags));
      
      await axios
        .patch(`${apiPath.prodPath}/api/tasks/addSubTask/${item._id}`, formData)
        .then((res) => {
          if(res.status == 200){
          Swal.fire({
            icon: "success",
            text: "SubTask added Successfully",
          });
        }
          setTaskCategory("");
          setTaskDescription("");
          setTaskPriority("");
          setDate("");
          setCreatedBy("");
          setTaskStatus("");
          setEditClientTask(false);
          setAssignedToUsername("");
          setTags([]);
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
                    .patch(`${apiPath.prodPath}/api/tasks/deleteSubTask/${item._id}&&${id}`)
                    .then((res) => {
                      Swal.fire({
                        icon: "success",
                        text: "SubTask Deleted Successfully",
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

  const handleInputChange = (newInputValue) => {
    setInputAssignTo(newInputValue);
  };
  const handleSelectionChange = (selectedOptions) => {
    setAssignedToUsername(selectedOptions);
  };

  const handleKeyDown = (e) => {
  if ((e.key === "Enter" || e.key === ",") && inputValue.trim() !== "") {
    e.preventDefault();
    if (!tags.includes(inputValue.trim())) {
      setTags([...tags, inputValue.trim()]);
    }
    setInputValue("");
  }
};

const removeTag = (index) => {
  setTags(tags.filter((_, i) => i !== index));
};

  return (
        <>
      <form
            onSubmit={handleUpload}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2 mt-8 mb-8"
             >
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Sub-Task Catagory</label>
                <Select
                    options={taskCategoryOpt}
                    value={taskCategory}
                    onInputChange={handleInputTaskCatagory}
                    inputValue={inputTaskCategory}
                    onChange={(e) => setTaskCategory(e)}
                    placeholder="Select Sub-Task Catagory"
                    styles={customStyles}
                    id="role-select-taskC"
                    name="Sub-Task Catagory"
                  />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Due Date</label>
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
                {/* <div className="flex flex-col gap-2 w-1/2">
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
              </div> */}
              <div className="flex flex-col gap-2 w-1/2">
                    <label>Assign To</label>
                    <Select
                    options={assignToOpt}
                    isMulti
                    value={assignedToUsername}
                    inputValue={inputAssignTo}
                    onInputChange={handleInputChange}
                    onChange={handleSelectionChange}
                    styles={customStyles}
                    placeholder="Search Users"
                    name="assignedTo"
                    id="role-select-cus"
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
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
                <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Tags</label>
                <div className="w-full border border-gray-300 rounded-md p-2 flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-md"
                    >
                        <span>{tag}</span>
                        <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="text-red-500 hover:text-red-700 font-bold"
                        >
                        ×
                        </button>
                    </div>
                    ))}

                    <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 min-w-[120px] border-none outline-none bg-transparent text-white"
                    placeholder="Type and press Enter"
                    />
                </div>
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
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Sub Task Category</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Task Status</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Task Description</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Task Priority</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Due Date</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Created By</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Assigned To</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Tags</TableHead>
            <TableHead className="text-[#E1C9FF]" >Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          { clientItem.subTasks !== undefined && clientItem.subTasks.map((i) => 
             <TableRow className="w-fit, h-[72px] bg-[#2D245B] border-[1px] border-[#452C95]" key={i._id}>
              <TableCell className="font-satoshi font-medium text-#fff">
                {i.subTaskCategory}
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
                {i.assignedTo.map(user => user.fullname + " (" + user.username + ")").join(`, \n `)}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {i.tags.join(`, \n `)}
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
                      setTaskCategory({label: i.subTaskCategory, value: i.subTaskCategory});
                      setTaskDescription(i.taskDescription); 
                      setTaskPriority({label: i.taskPriority, value: i.taskPriority}); 
                      setDate(i.date); 
                      setCreatedBy({label: i.createdBy, value: i.createdBy}); 
                      setTaskStatus({label: i.taskStatus, value: i.taskStatus});
                      setTaskId(i._id);
                      setAssignedToUsername(editData.assignedTo.map(user => {
                            return { label: user.fullname, value: user.fullname, username: user.username };
                        }) || []);
                      setTags(i.tags);
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
                    <SubTaskInfo
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

export default SubTask
