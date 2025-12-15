
import Drawer from "@mui/material/Drawer";
import "./style.scss";
import React, { useState, useEffect } from "react";
// import Select from "react-select";
// import axios from "axios";
// import { apiPath } from "@/utils/routes";
// import CloseIcon from "@mui/icons-material/Close";
import { ArrowBack } from "@mui/icons-material";
import moment from "moment";


function MailDetails({ open, handleClose, item }) {
  console.log("this is item", item);
  return (
    <>
      <Drawer
        className="bg-client-modals"
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
            <h1 className="font-satoshi font-bold text-2xl ">Open Mail</h1>
          </div>
          <div className="flex flex-wrap flex-row gap-10 justify-start ml-14">
            <div className="w-1/2 flex flex-col gap-2 border-b-2 border-b-[#E1C9FF] pb-2">
              <label className="font-satoshi font-semibold text-xl pb-2">From</label>
              <p className="font-satoshi text-md">{item.from}</p>
            </div>
            <div className="w-1/2 flex flex-col gap-2 border-b-2 border-b-[#E1C9FF] pb-2">
              <label className="font-satoshi font-semibold text-xl pb-2">Subject</label>
              <p className="font-satoshi text-md">
                {item.subject == "" ? "N/A" : item.subject}
              </p>
            </div>
            <div className="w-1/2 flex flex-col gap-2 border-b-2 border-b-[#E1C9FF] pb-2">
              <label className="font-satoshi font-semibold text-xl pb-2">Body</label>
              <p className="font-satoshi text-md">{item.body}</p>
            </div>
            <div className="w-1/2 flex flex-col gap-2 border-b-2 border-b-[#E1C9FF] pb-2">
              <label className="font-satoshi font-semibold text-xl pb-2">Date</label>
              <p className="font-satoshi text-md">{moment(item.date).format("DD-MM-YYYY")}</p>
            </div>
            <div className="w-1/2 flex flex-col gap-2 border-b-2 border-b-[#E1C9FF] pb-2">
              <label className="font-satoshi font-semibold text-xl pb-2">MSG ID</label>
              <p className="font-satoshi text-md">{item.msgId == "" ? "N/A" : item.msgId}</p>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
}

export default MailDetails;

