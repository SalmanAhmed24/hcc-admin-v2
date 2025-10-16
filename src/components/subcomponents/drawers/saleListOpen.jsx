import Drawer from "@mui/material/Drawer";
import "./style.scss";
import React, { useState, useEffect } from "react";
// import Select from "react-select";
// import axios from "axios";
// import { apiPath } from "@/utils/routes";
// import CloseIcon from "@mui/icons-material/Close";
import { ArrowBack } from "@mui/icons-material";

function SaleDetails({ open, handleClose, item }) {
  console.log("this is item", item);
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
            height: "800px", 
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
            <h1 className="font-satoshi font-bold text-2xl ">Open Direct Mail</h1>
          </div>
          <div className="flex flex-wrap flex-row gap-10 justify-start ml-14">
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Carrier Route</label>
              <p className="font-satoshi text-md">{item.carrierRoute}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">City</label>
              <p className="font-satoshi text-md">
                {item.city == "" ? "N/A" : item.city}
              </p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">DM State</label>
              <p className="font-satoshi text-md">{item.DMstate}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Zip Code</label>
              <p className="font-satoshi text-md">{item.zipCode}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">cost</label>
              <p className="font-satoshi text-md">{item.cost == "" ? "N/A" : item.cost}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Income</label>
              <p className="font-satoshi text-md">{item.income == "" ? "N/A" : item.income}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Age Range</label>
              <p className="font-satoshi text-md">{item.ageRange == "" ? "N/A" : item.ageRange}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Size</label>
              <p className="font-satoshi text-md">
                {item.size == "" ? "N/A" : item.size}
              </p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Residential</label>
              <p className="font-satoshi text-md">
                {item.residential == "" ? "N/A" : item.residential}
              </p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Business</label>
              <p className="font-satoshi text-md">
                {item.business == "" ? "N/A" : item.business}
              </p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Total</label>
              <p className="font-satoshi text-md">{item.total == "" ? "N/A" : item.total}</p>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
}

export default SaleDetails;
