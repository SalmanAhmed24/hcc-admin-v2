import Drawer from "@mui/material/Drawer";
import "./style.scss";
import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import moment from "moment";





function TaskLinkDetails({ open, handleClose, item }) {


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
              <label className="font-semibold text-xl">Link Category</label>
              <p className="text-md">{item.linkCategory}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Date</label>
              <p className="text-md">{item.date ? moment(item.date).format("MM-DD-YYYY") : "N/A"}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Created By</label>
              <p className="text-md">{item.createdBy==""?"N/A":item.createdBy}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Link Description</label>
              <p className="text-md">{item.description == "" ? "N/A" : item.description}</p>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
}

export default TaskLinkDetails;
