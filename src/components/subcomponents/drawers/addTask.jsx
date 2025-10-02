import React, { useState, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { apiPath } from "@/utils/routes";
import Swal from "sweetalert2";
import useAuthStore from "@/store/store";
import { Label } from "@mui/icons-material";
import { Drawer } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Select from "react-select";
import { Item } from "@radix-ui/react-dropdown-menu";

const AddTask = ({ open, handleClose, addTask, edit, editData, editTask }) => {
  // const [formData, setFormData] = useState({
  //   taskDescription: "",
  //   taskCategory: "",
  //   taskStatus: "Not Started",
  //   assignedTo: [],
  //   dueDate: "",
  // });
  
  // const [allCategories, setAllCategories] = useState([]);
  // const [allStatuses, setAllStatuses] = useState([]);
  // const [allUsers, setAllUsers] = useState([]);
  const user = useAuthStore((state) => state.user);
  const [taskDescription, setTaskDescription] = useState("");

  const [taskCategory, setTaskCategory] = useState("");
  const [taskCategoryOpt, setTaskCategoryOpt] = useState([]);
  const [inputTaskCategory, setInputTaskCategory] = useState("");
  
  const [taskStatus, setTaskStatus] = useState("");
  const [taskStatusOpt, setTaskStatusOpt] = useState([]);
  const [inputTaskStatus, setInputTaskStatus] = useState("");

  // const [assignedTo, setAssignedTo] = useState([]);
  const [assignToOpt, setAssignToOpt] = useState([]);
  const [inputAssignTo, setInputAssignTo] = useState("");
  const [assignedToUsername, setAssignedToUsername] = useState("");

  const [dueDate, setDueDate] = useState("");

  const [taskPriority, setTaskPriority] = useState("");
  const [inputPriority, setInputPriority] = useState("");
  const [taskPriorityOpt, setTaskPriorityOpt] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");

  useEffect(() => {
   if(edit && editData) {
      setTaskDescription(editData.taskDescription || "");
      setTaskCategory({ label: editData.taskCategory || "", value: editData.taskCategory || "" });
      setTaskStatus({ label: editData.taskStatus || "Not Started", value: editData.taskStatus || "Not Started" });
      setTaskPriority({ label: editData.taskPriority || "medium", value: editData.taskPriority || "medium" });
      setAssignedToUsername(editData.assignedTo.map(user => {
        return { label: user.fullname, value: user.fullname, username: user.username };
      }) || []);
      setDueDate(editData.dueDate ? new Date(editData.dueDate).toISOString().split('T')[0] : "");
    }
    
  }, [edit, editData]);

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
    ;
    const options = taskPriority.map((item)=>{
      const statusOption = {
        label : item.priority,
        value : item.priority,
      }
      return statusOption;
    });
    setTaskPriorityOpt(options);
  }

  useEffect(() => {
    taskCategoryOptions();
    taskStatusOptions();
    taskPriorityOptions();
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
  }, []);
  
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (edit && editData) {
      const formData = new FormData();
      const createdBy = {fullname: user?.user?.firstName + " " + user?.user?.secondName,
                         username: user?.user?.username
                        };

      const assignedTo = assignedToUsername.map(user => {
        return {
          fullname: user.value,
          username: user.username
        };
      });

      console.log(taskCategory, " ", taskDescription, " ", " ", dueDate, " ", assignedTo, " ", taskStatus, " ", createdBy);
      formData.append("taskCategory", taskCategory.value);
      formData.append("taskDescription", taskDescription);
      formData.append("createdBy", JSON.stringify(createdBy));
      formData.append("dueDate", dueDate);

      
      formData.append("assignedTo", JSON.stringify(assignedTo));

      formData.append("taskStatus", taskStatus.value);
      formData.append("taskPriority", taskPriority.value);

      editTask(formData);

      setTaskCategory("");
      setInputTaskCategory("");
      setInputTaskStatus("");
      setTaskDescription("");
      setDueDate("");
      setTaskStatus("");
      setTaskPriority("");
      setInputPriority("");
        
    }else{
      const formData = new FormData();
      const createdBy = {fullname: user?.user?.firstName + " " + user?.user?.secondName,
                         username: user?.user?.username
                        };

      const assignedTo = assignedToUsername.map(user => {
        return {
          fullname: user.value,
          username: user.username
        };
      });

      console.log(taskCategory, " ", taskDescription, " ", " ", dueDate, " ", assignedTo, " ", taskStatus, " ", createdBy);
      formData.append("taskCategory", taskCategory.value);
      formData.append("taskDescription", taskDescription);
      formData.append("createdBy", JSON.stringify(createdBy));
      formData.append("dueDate", dueDate);

      
      formData.append("assignedTo", JSON.stringify(assignedTo));

      formData.append("taskStatus", taskStatus.value);
      formData.append("taskPriority", taskPriority.value);

      addTask(formData);

      setTaskCategory("");
      setTaskDescription("");
      setDueDate("");
      setTaskStatus("");
      setTaskPriority("");
      setInputPriority("");
    }
  handleClose();   
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

  const handleInputTaskCatagory = (e) => {
    setInputTaskCategory(e);
  }

  const handleInputTaskStatus = (e) => {
    setInputTaskStatus(e);
  }

  const handleInputTaskPriority = (e) => {
    setInputPriority(e);
  }

  const handleInputChange = (newInputValue) => {
    setInputAssignTo(newInputValue);
  };
  const handleSelectionChange = (selectedOptions) => {
    setAssignedToUsername(selectedOptions);
  };

  return (
    <>
      <Drawer
        className="bg-all-modals"
        anchor="left" 
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: "1142px",  
            height: "60%", 
            position: "absolute",
            left: "20%",
            top: "5%",
            transform: "translate(-50%, -50%)",
            borderRadius: "16px", 
            boxShadow: 3, 
            marginTop : "30px",
            marginBottom: "30px",
          },
        }}
        >
        <div className="p-10 flex flex-col bg-[#2D245B] flex-wrap">
          <div className="flex flex-row justify-end">
            <CloseIcon
              className="text-2xl hover:cursor-pointer"
              onClick={() => handleClose()}
            />
          </div>
          <h1 className="text-white font-satoshi text-2xl font-bold mb-5">Add Task</h1>
           <form onSubmit={handleUpload} className="space-y-4 mt-4">
          <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="taskDescription">Task Description</label>
              <textarea
                id="taskDescription"
                name="taskDescription"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                required
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
              />
            </div>
            
          </div>

        <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
          <div className="flex flex-col gap-2 w-1/3">
              <label htmlFor="taskTitle">Task Title</label>
              <input
                id="taskTitle"
                name="taskTitle"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
                className="p-3 border-[#452C95] rounded-[12px] focus-within:outline-none border-[1px] bg-[#191526]"
              />
            </div>
             <div className="flex flex-col gap-2 w-1/3">
            <label htmlFor="taskCategory">Task Category</label>
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
          <div className="flex flex-col gap-2 w-1/3">
            <label htmlFor="taskStatus">Task Priority</label>
            <Select
              options={taskPriorityOpt}
              value={taskPriority}
              onInputChange={handleInputTaskPriority}
              inputValue={inputPriority}
              onChange={(e) => setTaskPriority(e)}
              placeholder="Select task Priority"
              styles={customStyles}
              id="role-select-cus"
              name="Task Priority"
            />
          </div>
        </div>
        
        <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
          <div className="flex flex-col gap-2 w-1/2">
            <label htmlFor="taskStatus">Task Status</label>
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
          <div className="flex flex-col gap-2 w-1/3">
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
          <div className="flex flex-col gap-2 w-1/2">
            <label htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
            />
          </div>
        </div>

        <Button type="submit" className="w-full bg-[#B797FF]">
          {edit ? "Update Task" : "Add Task"}
        </Button>
        </form>
        </div>
      </Drawer>
    </>
  );
};

export default AddTask;

