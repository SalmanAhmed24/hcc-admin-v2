import Drawer from "@mui/material/Drawer";
import "./style.scss";
import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import moment from "moment";

const SubTaskInfo = ({item, open, handleClose}) => {

  return (
  <>
    <Drawer
            className="bg-all-modals"
            anchor={"bottom"}
            open={open}
            onClose={handleClose}
          />

     <div className="p-10">
        <div className="flex flex-row justify-end">
            <CloseIcon
              className="text-2xl hover:cursor-pointer"
              onClick={() => handleClose()}
            />
          </div>
         
         <div className="flex flex-wrap flex-row gap-10 justify-start ml-14">
                
        <div className="space-y-4 mt-4">
            <div>
                <label className="text-[#E1C9FF]">Task Description</label>
                <p className="mt-1 text-white">{item.taskDescription}</p>
            </div>
            
            <div>
                <label className="text-[#E1C9FF]">Task Category</label>
                <p className="mt-1 text-white">{item.subTaskCategory}</p>
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
                <p className="mt-1 text-white">{item.createdBy}</p>
            </div>
            
            
            
            <div>
                <label className="text-[#E1C9FF]">Due Date</label>
                <p className="mt-1 text-white">
                {item.date ? moment(item.dueDate).format("MM-DD-YYYY") : "N/A"}
                </p>
            </div>

            <div>
                <label className="text-[#E1C9FF]">Task Priority</label>
                <p className="mt-1 text-white">{item.taskPriority}</p>
            </div>

            </div>
        </div>
     </div>
    

    </>
  );
};

export default SubTaskInfo;