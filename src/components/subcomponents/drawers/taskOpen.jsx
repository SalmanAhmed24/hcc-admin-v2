import React from "react";

// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetHeader,
//   SheetTitle,
// } from "@/components/ui/sheet";
// // import { Label } from "@/components/ui/label";
import moment from "moment";
import { Drawer } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";


const TaskDetails = ({ open, handleClose, item }) => {
  if (!item) return null;

  return (<>
    <Drawer
                  className="bg-client-modals"
                  anchor="left" 
                  open={open}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      width: "1142px",  
                      height: "70%", 
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      borderRadius: "16px", 
                      boxShadow: 3,
                      marginTop : "30px",
                      marginBottom: "30px", 
                    },
                  }}
                  >
            <div className="p-10">
              <div className="flex flex-row items-center justify-start gap-6 mb-8">
                  <ArrowBack
                    className="text-3xl hover:cursor-pointer"
                    onClick={() => handleClose()}
                  />
                  <h1 className="font-satoshi font-bold text-2xl ">Open Lead/Client</h1>
                </div>
              <div className="flex flex-wrap flex-row gap-10 justify-start ml-14">
                
                <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-[#E1C9FF]">Task Description</label>
                      <p className="mt-1 text-white">{item.taskDescription}</p>
                    </div>
                    
                    <div>
                      <label className="text-[#E1C9FF]">Task Category</label>
                      <p className="mt-1 text-white">{item.taskCategory}</p>
                    </div>
                    
                    <div>
                      <label className="text-[#E1C9FF]">Task Status</label>
                      <p className="mt-1 text-white">{item.taskStatus}</p>
                    </div>
                    
                    <div>
                      <label className="text-[#E1C9FF]">Assigned To</label>
                      <p className="mt-1 text-white">{item.assignedTo.map(user => user.fullname + " (" + user.username + ")").join(`, \n `)}</p>
                    </div>
                    
                    <div>
                      <label className="text-[#E1C9FF]">Created By</label>
                      <p className="mt-1 text-white">{item.createdBy.fullname + " (" + item.createdBy.username + ")"}</p>
                    </div>
                    
                    <div>
                      <label className="text-[#E1C9FF]">Date Created</label>
                      <p className="mt-1 text-white">{moment(item.dateCreated).format("MM-DD-YYYY HH:mm")}</p>
                    </div>
                    
                    <div>
                      <label className="text-[#E1C9FF]">Due Date</label>
                      <p className="mt-1 text-white">
                        {item.dueDate ? moment(item.dueDate).format("MM-DD-YYYY") : "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-[#E1C9FF]">Task Priority</label>
                      <p className="mt-1 text-white">{item.taskPriority}</p>
                    </div>
                    
                    <div>
                      <label className="text-[#E1C9FF]">Completed Date</label>
                      <p className="mt-1 text-white">
                        {item.completedDate ? moment(item.completedDate).format("MM-DD-YYYY HH:mm") : "N/A"}
                      </p>
                    </div>

                  </div>
              </div>
            </div>
          </Drawer>
        </>
  );
};

export default TaskDetails;

