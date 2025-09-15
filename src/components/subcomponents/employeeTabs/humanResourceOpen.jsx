import Drawer from "@mui/material/Drawer";
import "./style.scss";
import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import moment from "moment";

function HumanResourceOpen ({ open, handleClose, item }) {

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
              <label className="font-semibold text-xl">Name</label>
              <p className="text-md">{`${item.firstName} ${item.secondName}`}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Role</label>
              <p className="text-md">
                {item.role == "" ? "N/A" : item.role}
              </p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Department</label>
              <p className="text-md">{item.humanResources.department == "" ? "N/A" : item.humanResources.department}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Pay Rate</label>
              <p className="text-md">{item.humanResources.payRate == "" ? "N/A" : item.humanResources.payRate}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Pay Currency</label>
              <p className="text-md">{item.humanResources.payCurrency == "" ? "N/A" : item.humanResources.payCurrency}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Pinterest</label>
              <p className="text-md">{item.humanResources.manager == "" ? "N/A" : item.humanResources.manager}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Hire Date</label>
              <p className="text-md">{item.humanResources.HireDate ? moment(item.humanResources.HireDate).format('YYYY-MM-DD') : ""}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Review Date</label>
              <p className="text-md">{item.humanResources.ReviewDate ? moment(item.humanResources.ReviewDate).format('YYYY-MM-DD') : ""}</p>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
}

export default HumanResourceOpen;
