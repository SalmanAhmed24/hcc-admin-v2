import Drawer from "@mui/material/Drawer";
import "./style.scss";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import { apiPath } from "@/utils/routes";
import CloseIcon from "@mui/icons-material/Close";
import { ArrowBack } from "@mui/icons-material";

function PurchaseSaleDetails({ open, handleClose, item }) {
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
            height: "300px", 
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
            <h1 className="font-satoshi font-bold text-2xl ">Open Purchase Sale</h1>
          </div>
          <div className="flex flex-wrap flex-row gap-10 justify-start ml-14">
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Category</label>
              <p className="font-satoshi text-md">{item.purchaseCategory}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Sub Category</label>
              <p className="font-satoshi text-md">
                {item.purchaseName == "" ? "N/A" : item.purchaseName}
              </p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Tools</label>
              <p className="font-satoshi text-md">{item.purchaseTools}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Selling Price</label>
              <p className="font-satoshi text-md">{item.sellingPrice + "$"}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Cost</label>
              <p className="font-satoshi text-md">{item.cost == "" ? "N/A" : item.cost + "$"}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Purchase Description</label>
              <p className="font-satoshi text-md">{item.purchaseDescription == "" ? "N/A" : item.purchaseDescription}</p>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
}

export default PurchaseSaleDetails;
