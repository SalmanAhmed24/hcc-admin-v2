
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
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
import React, { useEffect, useState } from "react";
import AddTask from "../drawers/addTask";
import TaskDetails from "../drawers/taskOpen";
import Pagination from "@mui/material/Pagination";
import useAuthStore from "@/store/store";
import { Drawer } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


function TaskTable({ open, handleClose, filterBy, searchTerm }) {
  const [taskModal, setTaskModal] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const user = useAuthStore((state) => state.user);
  const [taskCreatedBy, setTaskCreatedBy] = useState([]);
  const [pagesCB, setPagesCB] = useState(1);
  const [totalCB, setTotalCB] = useState(0);
  const [pageCB, setPageCB] = useState(1);
  const [taskAssignedTo, setTaskAssignedTo] = useState([]);
  const [pagesAT, setPagesAT] = useState(1);
  const [totalAT, setTotalAT] = useState(0);
  const [pageAT, setPageAT] = useState(1);
  const [taskStatusOpt, setTaskStatusOpt] = useState([]);
  
  const [taskPriorityOpt, setTaskPriorityOpt] = useState([]);

  const username = user?.user?.username;



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

  const getUserCreatedByTasks = async (page=1) => {
    if(!filterBy || !searchTerm.trim()){
      const res = await axios.get(`${apiPath.prodPath}/api/tasks/user/createdBy/${username}/?page=${page}&limit=8`);
      setTaskCreatedBy(res.data.tasks);
      setPagesCB(res.data.pages);
      setTotalCB(res.data.total);
    } else {
      const res = await axios.get(`${apiPath.prodPath}/api/tasks/user/createdBy/${username}/?filterBy=${filterBy}&searchTerm=${searchTerm}&page=${page}&limit=8`);
      setTaskCreatedBy(res.data.tasks);
      setPagesCB(res.data.pages);
      setTotalCB(res.data.total);
    }
  }

  const getUserAssignedToTasks = async (page=1) => {
    if(!filterBy || !searchTerm.trim()){
      const res = await axios.get(`${apiPath.prodPath}/api/tasks/user/assignedTo/${username}/?page=${page}&limit=8`);
      setTaskAssignedTo(res.data.tasks);
      setPagesAT(res.data.pages);
      setTotalAT(res.data.total);
    } else {
      const res = await axios.get(`${apiPath.prodPath}/api/tasks/user/assignedTo/${username}/?filterBy=${filterBy}&searchTerm=${searchTerm}&page=${page}&limit=8`);
      setTaskAssignedTo(res.data.tasks);
      setPagesAT(res.data.pages);
      setTotalAT(res.data.total);
    }
  }

  useEffect(()=>{
    taskPriorityOptions();
    taskStatusOptions();
    getUserCreatedByTasks();
    getUserAssignedToTasks();

    // axios.get(`${apiPath.prodPath}/api/tasks/user/createdBy/${username}`)
    //   .then((res) => {
    //     setTaskCreatedBy(res.data.tasks);
    //     setPagesCB(res.data.pages);
    //     setTotalCB(res.data.total);
    //   })
    //   .catch((err) => {
    //     console.error("Error fetching task details:", err);
    //   });
    // axios.get(`${apiPath.prodPath}/api/tasks/user/assignedTo/${username}`)
    //   .then((res) => {
    //     setTaskAssignedTo(res.data.tasks);
    //     setPagesAT(res.data.pages);
    //     setTotalAT(res.data.total);
    //   })
    //   .catch((err) => {
    //     console.error("Error fetching task details:", err);
    //   }); 
  }, [open, filterBy, searchTerm]);

  async function refreshData(page=1) {
    getUserCreatedByTasks(page);
    getUserAssignedToTasks(page);
  

    // await axios.get(`${apiPath.prodPath}/api/tasks/user/createdBy/${username}/?page=${page}&limit=8`)
    //   .then((res) => {
    //     setTaskCreatedBy(res.data.tasks);
    //     setPagesCB(res.data.pages);
    //     setTotalCB(res.data.total);
    //   })
    //   .catch((err) => {
    //     console.error("Error fetching task details:", err);
    //   });

    // await axios.get(`${apiPath.prodPath}/api/tasks/user/assignedTo/${username}/?page=${page}&limit=8`)
    //   .then((res) => {
    //     setTaskAssignedTo(res.data.tasks);
    //     setPagesAT(res.data.pages);
    //     setTotalAT(res.data.total);
    //   })
    //   .catch((err) => {
    //     console.error("Error fetching task details:", err);
    //   });
  }

  async function onChangePageAT(e, value){
    setPageAT(value);
    await refreshData(value);
  };

  async function onChangePageCB(e, value){
    setPageCB(value);
    await refreshData(value);
  };

  const handleEdit = (item) => {
    setTaskId(item._id);
    setTaskModal(true);
  };
  
  const handleOpenModal = (item) => {
    setTaskId(item._id);
    setOpenModal(true);
  };
  
  const handleDelete = (id) => {
    Swal.fire({
      icon: "warning",
      text: "Are you sure you want to delete this task?",
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${apiPath.prodPath}/api/tasks/${id}`)
          .then((res) => {
            refreshData();
          })
          .catch((err) => console.log(err));
      }
    });
  };
  
  const editTask = (data) => {
    axios
      .patch(`${apiPath.prodPath}/api/tasks/modify/${taskId}`, data)
      .then((res) => {
        console.log(res);
        refreshData();
        Swal.fire({
          icon: "success",
          text: "Task updated successfully",
        });
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          icon: "error",
          text: "Failed to update task",
        });
      });
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const updateData = {
        taskStatus: newStatus
      };
      if (newStatus === "Completed") {
        updateData.completedDate = new Date();
      } else if (newStatus !== "Completed") {
        updateData.completedDate = null;
      }

      const res = await axios.patch(`${apiPath.prodPath}/api/tasks/${taskId}/status`, updateData);

      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          text: "Task status updated successfully",
        });
        refreshData();
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
      Swal.fire({
        icon: "error",
        text: "Error updating task status",
      });
    }
  };

  const handlePriorityChange = async (taskId, newPriority) => {
    try {
      const updateData = {
        taskPriority: newPriority
      };

      const res = await axios.patch(`${apiPath.prodPath}/api/tasks/${taskId}/priority`, updateData);

      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          text: "Task priority updated successfully",
        });
        refreshData();
      }
    } catch (error) {
      console.error("Failed to update task priority:", error);
      Swal.fire({
        icon: "error",
        text: "Error updating task priority",
      });
    }
  };
  

  const priorityColors = {
  critical: "bg-red-600",
  Urgent: "bg-orange-500",
  High: "bg-yellow-500",
  medium: "bg-blue-500",
  Low: "bg-green-500",
};



  return (
    <>
          <div className="flex flex-wrap flex-row gap-10 justify-start ml-14">
            
            <div className=" w-full h-2/4">
                <Tabs defaultValue="Assigned To" className="w-full">
                <TabsList className="cus-tab-wrap">
                  <TabsTrigger value="Assigned To">User Tasks</TabsTrigger>
                  <TabsTrigger value="Created By">Assigned Tasks</TabsTrigger>
                </TabsList>
                <TabsContent value="Assigned To">
                  <div className="w-full h-full">
                    <div>
                        {taskAssignedTo?.length ? (
                            <>
                            <Table className="bg-[#231C46] rounded-[12px] font-satoshi">
                            <TableCaption>A list of all Tasks</TableCaption>
                            <TableHeader>
                                <TableRow className="w-fit, h-[58px] font-satoshi text-lg text-[#E1C9FF]">
                                <TableHead className="text-[#E1C9FF]">Actions</TableHead>
                                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 200 }}>Task Description</TableHead>
                                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Status</TableHead>
                                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Category</TableHead>
                                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Assigned To</TableHead>
                                {/* <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Created By</TableHead> */}
                                {/* <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Date Created</TableHead> */}
                                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Due Date</TableHead>
                                <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Priority</TableHead>
                                {/* <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Completed Date</TableHead> */}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {taskAssignedTo.length > 0 ? (taskAssignedTo.map((task) => {
                                return (
                                    <TableRow className="w-fit, h-[72px] bg-[#2D245B] border-[1px] border-[#452C95]" key={task._id}>
                                    <TableCell className="font-satoshi font-medium text-[#E1C9FF]">
                                        <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <MoreVertIcon />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleOpenModal(task)}>
                                            Open
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleEdit(task)}>
                                            Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(task._id)}>
                                            Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                    <TableCell className="font-satoshi font-medium text-white">
                                        {task.taskDescription}
                                    </TableCell>
                                    <TableCell className="font-satoshi font-medium text-white">
                                        <select
                                        className="bg-[#1b071b] text-white px-2 py-1 rounded"
                                        value={task.taskStatus}
                                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                        >
                                        {taskStatusOpt.map((option) => (
                                          <option key={option.value} value={option.value}>
                                            {option.label}
                                          </option>
                                        ))}
                                        </select>
                                    </TableCell>
                                    <TableCell className="font-satoshi font-medium text-white">
                                        {task.taskCategory}
                                    </TableCell>
                                    <TableCell className="font-satoshi font-medium text-white">
                                        {task.assignedTo.map(user => user.fullname + " (" + user.username + ")").join(`, \n `)}
                                    </TableCell>
                                    {/* <TableCell className="font-satoshi font-medium text-white">
                                        {task.createdBy.fullname + " (" + task.createdBy.username + ")"}
                                    </TableCell> */}
                                    {/* <TableCell className="font-satoshi font-medium text-white">
                                        {moment(task.dateCreated).format("MM-DD-YYYY")}
                                    </TableCell> */}
                                    <TableCell className="font-satoshi font-medium text-white">
                                        {task.dueDate ? moment(task.dueDate).format("MM-DD-YYYY") : "N/A"}
                                    </TableCell>
                                    <TableCell className="font-satoshi font-medium text-white">
                                        <div className="relative inline-block">
                                          <select
                                            className="appearance-none bg-[#1b071b] text-white px-2 py-1 rounded pr-6"
                                            value={task.taskPriority}
                                            onChange={(e) => handlePriorityChange(task._id, e.target.value)}
                                          >
                                            {taskPriorityOpt.map((option) => (
                                              <option key={option.value} value={option.value}>
                                                {option.label}
                                              </option>
                                            ))}
                                          </select>
                                          <span
                                            className={`absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${priorityColors[task.taskPriority]}`}
                                          ></span>
                                        </div>
                                    </TableCell>
                                    {/* <TableCell className="font-satoshi font-medium text-white">
                                        {task.completedDate ? moment(task.completedDate).format("MM-DD-YYYY") : "N/A"}
                                    </TableCell> */}
                                    
                                    {taskModal && taskId == task._id ? (
                                        <AddTask
                                        open={taskModal}
                                        handleClose={() => setTaskModal(false)}
                                        // addTask={(data) => addTask(data)}
                                        edit={true}
                                        editData={task}
                                        editTask={editTask}
                                        />
                                    ) : null}
                                    {openModal && taskId == task._id ? (
                                        <TaskDetails
                                        open={openModal}
                                        handleClose={() => setOpenModal(false)}
                                        item={task}
                                        refreshData={refreshData}
                                        />
                                    ) : null}
                                    </TableRow>
                                );
                                })) : null}
                            </TableBody>
                            </Table>
                            <Pagination
                            count={pagesAT}
                            page={pageAT}
                            onChange={onChangePageAT}
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
                            <p className="text-xl">No Task Data found</p>
                        )}
                        </div>
                  </div>
                </TabsContent>
                <TabsContent value="Created By">
                  <div>
                    {taskCreatedBy?.length ? (
                        <>
                        <Table className="bg-[#231C46] rounded-[12px] font-satoshi">
                        <TableCaption>A list of all Tasks</TableCaption>
                        <TableHeader>
                            <TableRow className="w-fit, h-[58px] font-satoshi text-lg text-[#E1C9FF]">
                            <TableHead className="text-[#E1C9FF]">Actions</TableHead>
                            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 200 }}>Task Description</TableHead>
                            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Status</TableHead>
                            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Category</TableHead>
                            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Assigned To</TableHead>
                            {/* <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Created By</TableHead> */}
                            {/* <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Date Created</TableHead> */}
                            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Due Date</TableHead>
                            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Priority</TableHead>
                            {/* <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Completed Date</TableHead> */}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {taskCreatedBy.length > 0 ? (taskCreatedBy.map((task) => {
                            return (
                                <TableRow className="w-fit, h-[72px] bg-[#2D245B] border-[1px] border-[#452C95]" key={task._id}>
                                <TableCell className="font-satoshi font-medium text-[#E1C9FF]">
                                    <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <MoreVertIcon />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleOpenModal(task)}>
                                        Open
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleEdit(task)}>
                                        Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDelete(task._id)}>
                                        Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                                <TableCell className="font-satoshi font-medium text-white">
                                    {task.taskDescription}
                                </TableCell>
                                <TableCell className="font-satoshi font-medium text-white">
                                    <select
                                      className="bg-[#1b071b] text-white px-2 py-1 rounded"
                                      value={task.taskStatus}
                                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                      >
                                      {taskStatusOpt.map((option) => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                      </select>
                                </TableCell>
                                <TableCell className="font-satoshi font-medium text-white">
                                    {task.taskCategory}
                                </TableCell>
                                <TableCell className="font-satoshi font-medium text-white">
                                    {task.assignedTo.map(user => user.fullname + " (" + user.username + ")").join(`, \n `)}
                                </TableCell>
                                {/* <TableCell className="font-satoshi font-medium text-white">
                                    {task.createdBy.fullname + " (" + task.createdBy.username + ")"}
                                </TableCell> */}
                                {/* <TableCell className="font-satoshi font-medium text-white">
                                    {moment(task.dateCreated).format("MM-DD-YYYY")}
                                </TableCell> */}
                                <TableCell className="font-satoshi font-medium text-white">
                                    {task.dueDate ? moment(task.dueDate).format("MM-DD-YYYY") : "N/A"}
                                </TableCell>
                                <TableCell className="font-satoshi font-medium text-white">
                                    <div className="relative inline-block">
                                      <select
                                        className="appearance-none bg-[#1b071b] text-white px-2 py-1 rounded pr-6"
                                        value={task.taskPriority}
                                        onChange={(e) => handlePriorityChange(task._id, e.target.value)}
                                      >
                                        {taskPriorityOpt.map((option) => (
                                          <option key={option.value} value={option.value}>
                                            {option.label}
                                          </option>
                                        ))}
                                      </select>
                                      <span
                                        className={`absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${priorityColors[task.taskPriority]}`}
                                      ></span>
                                    </div>
                                </TableCell>
                                {/* <TableCell className="font-satoshi font-medium text-white">
                                    {task.completedDate ? moment(task.completedDate).format("MM-DD-YYYY") : "N/A"}
                                </TableCell> */}
                                
                                {taskModal && taskId == task._id ? (
                                    <AddTask
                                    open={taskModal}
                                    handleClose={() => setTaskModal(false)}
                                    // addTask={(data) => addTask(data)}
                                    edit={true}
                                    editData={task}
                                    editTask={editTask}
                                    />
                                ) : null}
                                {openModal && taskId == task._id ? (
                                    <TaskDetails
                                    open={openModal}
                                    handleClose={() => setOpenModal(false)}
                                    item={task}
                                    refreshData={refreshData}
                                    />
                                ) : null}
                                </TableRow>
                            );
                            })) : null}
                        </TableBody>
                        </Table>
                        <Pagination
                        count={pagesCB}
                        page={pageCB}
                        onChange={onChangePageCB}
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
                        <p className="text-xl">No Task Data found</p>
                    )}
                    </div>
                </TabsContent>
              </Tabs>
                  
              </div>
          </div>
    </>
    
  );
}

export default TaskTable;