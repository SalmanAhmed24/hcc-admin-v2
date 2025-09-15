import Drawer from "@mui/material/Drawer";
import "./style.scss";
import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import MoreVertIcon from "@mui/icons-material/MoreVert";




function ResearchInfoOpen({ open, handleClose, item }) {


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
              <label className="font-semibold text-xl">Industry</label>
              <p className="text-md">
                {item.industry == "" ? "N/A" : item.industry}
              </p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Email</label>
              <p className="text-md">{item.email}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Phone</label>
              <p className="text-md">{item.phone}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Website Address</label>
              <p className="text-md">{item.websiteAddress==""?"N/A":item.websiteAddress}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Address</label>
              <p className="text-md">{item.address1 == "" ? "N/A" : item.address1}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Current DM Team/Company</label>
              <p className="text-md">{item.currentDM == "" ? "N/A" : item.currentDM}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Lead Qualification</label>
              <p className="text-md">{item.leadQualification == "" ? "N/A" : item.leadQualification}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">City</label>
              <p className="text-md">{item.city == "" ? "N/A" : item.city}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">Zip Code</label>
              <p className="text-md">{item.zipCode == "" ? "N/A" : item.zipCode}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-semibold text-xl">State</label>
              <p className="text-md">{item.state == "" ? "N/A" : item.state}</p>
            </div>
            <div className="w-full flex flex-col gap-2">
              <label className="font-semibold text-xl">Company Size</label>
              {
            
                <Table className="bg-[#231C46] rounded-[12px] font-satoshi">
                  <TableCaption>Comapny Size</TableCaption>
                  <TableHeader>
                    <TableRow className="w-fit, h-[58px] font-satoshi text-lg text-[#E1C9FF]">
                      <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Annual Revenue</TableHead>
                      <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Market Capitalization</TableHead>
                      <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Number of Employees</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    
                      <TableRow className="w-fit, h-[72px] bg-[#2D245B] border-[1px] border-[#452C95]" key={item._id}>
                        <TableCell className="font-satoshi font-medium text-#fff">
                          {item.companySize.annualRevenue}
                        </TableCell>
                        <TableCell className="font-satoshi font-medium text-#fff">
                          {item.companySize.marketCapitalization}
                        </TableCell>
                        <TableCell className="font-satoshi font-medium text-#fff">
                          {item.companySize.numberOfEmployees}
                        </TableCell>
                      </TableRow>
                  
                  </TableBody>
                </Table>
                    }
            </div>
            <div className="w-full flex flex-col gap-2">
              <label className="font-semibold text-xl">Key Decision Makers</label>
              {
            
                <Table className="bg-[#231C46] rounded-[12px] font-satoshi">
                  <TableCaption>A list of all Key Decision Makers</TableCaption>
                  <TableHeader>
                    <TableRow className="w-fit, h-[58px] font-satoshi text-lg text-[#E1C9FF]">
                      <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Name</TableHead>
                      <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Email</TableHead>
                      <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Phone</TableHead>
                      <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Designation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {item === undefined ? "N/A" : item.keyDecisionMakers.map((item)=> 
                       <TableRow className="w-fit, h-[72px] bg-[#2D245B] border-[1px] border-[#452C95]" key={item._id}>
                        <TableCell className="font-satoshi font-medium text-#fff">
                          {item.name}
                        </TableCell>
                        <TableCell className="font-satoshi font-medium text-#fff">
                          {item.email}
                        </TableCell>
                        <TableCell className="font-satoshi font-medium text-#fff">
                          {item.phone}
                        </TableCell>
                        <TableCell className="font-satoshi font-medium text-#fff">
                          {item.designation}
                        </TableCell>
                      </TableRow>
                    )}
                         
                  </TableBody>
                </Table>
                    }
            </div>
            <div className="w-full flex flex-col gap-2">
              <label className="font-semibold text-xl">Services Offered</label>
              {
            
                <Table className="bg-[#231C46] rounded-[12px] font-satoshi">
                  <TableCaption>A list of all Services Offered</TableCaption>
                  <TableHeader>
                    <TableRow className="w-fit, h-[58px] font-satoshi text-lg text-[#E1C9FF]">
                      <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Service Name</TableHead>
                      <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Service Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {item === undefined ? "N/A" : item.servicesOffered.map((item)=> 
                       <TableRow className="w-fit, h-[72px] bg-[#2D245B] border-[1px] border-[#452C95]" key={item._id}>
                        <TableCell className="font-satoshi font-medium text-#fff">
                          {item.serviceName}
                        </TableCell>
                        <TableCell className="font-satoshi font-medium text-#fff">
                          {item.serviceType}
                        </TableCell>
                      </TableRow>
                    )}
                         
                  </TableBody>
                </Table>
                    }
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
}

export default ResearchInfoOpen;
