import Drawer from "@mui/material/Drawer";
import "./style.scss";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import { apiPath } from "@/utils/routes";
import CloseIcon from "@mui/icons-material/Close";
import { ArrowBack } from "@mui/icons-material";

function EmployeeDetails({ open, handleClose, item }) {
  console.log("this is item", item);
  return (
    <>
      {/* <Drawer
        className="bg-all-modals"
        anchor="left" 
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: "1142px",  
            height: "dvh", 
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
        > */}
        <div className="p-10">
          <div className="flex flex-row items-center justify-start gap-6 mb-8">
            <ArrowBack
              className="text-3xl hover:cursor-pointer"
              onClick={() => handleClose()}
            />
            <h1 className="font-satoshi font-bold text-2xl ">Open Employee</h1>
          </div>
          <div className="flex flex-wrap flex-row gap-10 justify-start ml-14">
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">First Name</label>
              <p className="font-satoshi text-md">{item.firstName}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Second Name</label>
              <p className="font-satoshi text-md">
                {item.secondName == "" ? "N/A" : item.secondName}
              </p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Email</label>
              <p className="font-satoshi text-md">{item.email}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">User Type</label>
              <p className="font-satoshi text-md">{item.role}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Title</label>
              <p className="font-satoshi text-md">{item.title == "" ? "N/A" : item.title}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Phone</label>
              <p className="font-satoshi text-md">{item.phone == "" ? "N/A" : item.phone}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Cell</label>
              <p className="font-satoshi text-md">{item.cell == "" ? "N/A" : item.cell}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Address 1</label>
              <p className="font-satoshi text-md">
                {item.address1 == "" ? "N/A" : item.address1}
              </p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Address 2</label>
              <p className="font-satoshi text-md">
                {item.address2 == "" ? "N/A" : item.address2}
              </p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Zip Code</label>
              <p className="font-satoshi text-md">
                {item.zipCode == "" ? "N/A" : item.zipCode}
              </p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">City</label>
              <p className="font-satoshi text-md">{item.city == "" ? "N/A" : item.city}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">State</label>
              <p className="font-satoshi text-md">{item.state == "" ? "N/A" : item.state}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Username</label>
              <p className="font-satoshi text-md">{item.username}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Avatar</label>
              {item.avatar == "" ? (
                <p>N/A</p>
              ) : (
                <img
                  src={item.avatar}
                  className="w-1/3 h-auto"
                  alt={"avatar"}
                />
              )}
            </div>
          </div>
        </div>
      {/* </Drawer> */}
    </>
  );
}

export default EmployeeDetails;
