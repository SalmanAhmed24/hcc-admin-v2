import Drawer from "@mui/material/Drawer";
import "./style.scss";
import React, { useState, useEffect } from "react";
// import Select from "react-select";
// import axios from "axios";
// import { apiPath } from "@/utils/routes";
// import CloseIcon from "@mui/icons-material/Close";
import { ArrowBack } from "@mui/icons-material";

function BusinessListingsDetails({ open, handleClose, item }) {
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
            <h1 className="font-satoshi font-bold text-2xl ">Open Business Listing</h1>
          </div>
          <div className="flex flex-wrap flex-row gap-10 justify-start ml-14">
            <div className="w-1/2 flex flex-col gap-2 border-b-2 border-b-[#E1C9FF] pb-2">
              <label className="font-satoshi font-semibold text-xl pb-2">Name</label>
              <p className="font-satoshi text-md">{item.storeName}</p>
            </div>
            <div className="w-1/2 flex flex-col gap-2 border-b-2 border-b-[#E1C9FF] pb-2">
              <label className="font-satoshi font-semibold text-xl pb-2">google URL</label>
              <p className="font-satoshi text-md">
                {item.googleUrl == "" ? "N/A" : item.googleUrl}
              </p>
            </div>
            <div className="w-1/2 flex flex-col gap-2 border-b-2 border-b-[#E1C9FF] pb-2">
              <label className="font-satoshi font-semibold text-xl pb-2">Place ID</label>
              <p className="font-satoshi text-md">{item.placeId}</p>
            </div>
            <div className="w-1/2 flex flex-col gap-2 border-b-2 border-b-[#E1C9FF] pb-2">
              <label className="font-satoshi font-semibold text-xl pb-2">Phone</label>
              <p className="font-satoshi text-md">{item.phone}</p>
            </div>
            <div className="w-1/2 flex flex-col gap-2 border-b-2 border-b-[#E1C9FF] pb-2">
              <label className="font-satoshi font-semibold text-xl pb-2">Stars</label>
              <p className="font-satoshi text-md">{item.stars == "" ? "N/A" : item.stars}</p>
            </div>
            <div className="w-1/2 flex flex-col gap-2 border-b-2 border-b-[#E1C9FF] pb-2">
              <label className="font-satoshi font-semibold text-xl pb-2">Number of Reviews</label>
              <p className="font-satoshi text-md">{item.numberOfReviews == "" ? "N/A" : item.numberOfReviews}</p>
            </div>
            <div className="w-1/2 flex flex-col gap-2 border-b-2 border-b-[#E1C9FF] pb-2">
              <label className="font-satoshi font-semibold text-xl pb-2">Business Website</label>
              <p className="font-satoshi text-md">{item.bizWebsite == "" ? "N/A" : item.bizWebsite}</p>
            </div>
            <div className="w-1/2 flex flex-col gap-2 border-b-2 border-b-[#E1C9FF] pb-2">
              <label className="font-satoshi font-semibold text-xl pb-2">Category</label>
              <p className="font-satoshi text-md">
                {item.category == "" ? "N/A" : item.category}
              </p>
            </div>
            <div className="w-1/2 flex flex-col gap-2 border-b-2 border-b-[#E1C9FF] pb-2">
              <label className="font-satoshi font-semibold text-xl pb-2">Address</label>
              <p className="font-satoshi text-md">
                {item.address == "" ? "N/A" : item.address}
              </p>
            </div>
            <div className="w-1/2 flex flex-col gap-2 border-b-2 border-b-[#E1C9FF] pb-2">
              <label className="font-satoshi font-semibold text-xl pb-2">City</label>
              <p className="font-satoshi text-md">
                {item.location.city == "" ? "N/A" : item.location.city}
              </p>
            </div>
            <div className="w-1/2 flex flex-col gap-2 border-b-2 border-b-[#E1C9FF] pb-2">
              <label className="font-satoshi font-semibold text-xl pb-2">State</label>
              <p className="font-satoshi text-md">{item.location.state == "" ? "N/A" : item.location.state}</p>
            </div>
            <div className="w-1/2 flex flex-col gap-2 border-b-2 border-b-[#E1C9FF] pb-2">
              <label className="font-satoshi font-semibold text-xl pb-2">Zip Code</label>
              <p className="font-satoshi text-md">{item.location.zipcode == "" ? "N/A" : item.location.zipcode}</p>
            </div>
            <div className="w-1/2 flex flex-col gap-2 border-b-2 border-b-[#E1C9FF] pb-2">
              <label className="font-satoshi font-semibold text-xl pb-2">query</label>
              <p className="font-satoshi text-md">{item.query == "" ? "N/A" : item.query}</p>
            </div>
            <div className="w-1/2 flex flex-col gap-2 border-b-2 border-b-[#E1C9FF] pb-2">
              <label className="font-satoshi font-semibold text-xl pb-2">Raw Body</label>
              <p className="font-satoshi text-md">{item.rawBody == "" ? "N/A" : item.rawBody}</p>
            </div>
            <div className="w-1/2 flex flex-col gap-2 border-b-2 border-b-[#E1C9FF] pb-2">
              <label className="font-satoshi font-semibold text-xl pb-2">Scraped At</label>
              <p className="font-satoshi text-md">{item.scrapedAt == "" ? "N/A" : item.scrapedAt}</p>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
}

export default BusinessListingsDetails;
