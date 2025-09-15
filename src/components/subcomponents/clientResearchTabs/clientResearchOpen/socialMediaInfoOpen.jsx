import Drawer from "@mui/material/Drawer";
import "./style.scss";
import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";




function ResearchSocialMediaOpen({ open, handleClose, item }) {


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
              <label className="font-semibold text-xl">Company Name</label>
              <p className="text-md">{item.companyName}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">BlueSky</label>
              <p className="text-md">
                {item.socialMedia.blueSky == "" ? "N/A" : item.socialMedia.blueSky}
              </p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Twitter</label>
              <p className="text-md">{item.socialMedia.twitter == "" ? "N/A" : item.socialMedia.twitter}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Instagram</label>
              <p className="text-md">{item.socialMedia.instagram == "" ? "N/A" : item.socialMedia.instagram}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Facebook</label>
              <p className="text-md">{item.socialMedia.facebook == "" ? "N/A" : item.socialMedia.facebook}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Pinterest</label>
              <p className="text-md">{item.socialMedia.pinterest == "" ? "N/A" : item.socialMedia.pinterest}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Youtube</label>
              <p className="text-md">{item.socialMedia.youtube == "" ? "N/A" : item.socialMedia.youtube}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">LinkedIn</label>
              <p className="text-md">{item.socialMedia.linkedin == "" ? "N/A" : item.socialMedia.linkedin}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Tiktok</label>
              <p className="text-md">{item.socialMedia.tiktok == "" ? "N/A" : item.socialMedia.tiktok}</p>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
}

export default ResearchSocialMediaOpen;
