import Drawer from "@mui/material/Drawer";
import "./style.scss";
import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";




function ClientTaskDetails({ open, handleClose, item }) {


  return (
    <>
      <Drawer
        className="bg-all-modals"
        anchor={"bottom"}
        open={open}
        onClose={handleClose}
      >
        <div className="p-10">
          <div className="flex flex-row justify-end">
            <CloseIcon
              className="text-2xl hover:cursor-pointer"
              onClick={() => handleClose()}
            />
          </div>
          <div className="flex flex-wrap flex-row gap-4">
          
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Task Category</label>
              <p className="text-md">{item.taskCategory}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Task Priority</label>
              <p className="text-md">
                {item.taskPriority == "" ? "N/A" : item.taskPriority}
              </p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Task Status</label>
              <p className="text-md">{item.taskStatus}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Task Date</label>
              <p className="text-md">{item.date}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Created By</label>
              <p className="text-md">{item.createdBy==""?"N/A":item.createdBy}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Task Description</label>
              <p className="text-md">{item.taskDescription == "" ? "N/A" : item.taskDescription}</p>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
}

export default ClientTaskDetails;
