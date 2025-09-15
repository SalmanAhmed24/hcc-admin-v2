
import Drawer from "@mui/material/Drawer";
import "./style.scss";
import React, { useState, useEffect } from "react";
// import Select from "react-select";
// import axios from "axios";
// import { apiPath } from "@/utils/routes";
import CloseIcon from "@mui/icons-material/Close";
import { Button } from "@/components/ui/button";
// import Swal from "sweetalert2";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowBack } from "@mui/icons-material";
import EmployeeDetails from "../employeeTabs/employeeOpen";
import EmployeeFile from "../list/EmployeeFile";
import EmployeeHumanResources from "../employeeTabs/employeesHR";




function Employees({ open, handleClose, item }) {

  const [userItem, setUserItem] = useState(item);


  
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
          <div className="flex flex-row items-center justify-start gap-6 mb-8">
              <ArrowBack
                className="text-3xl hover:cursor-pointer"
                onClick={() => handleClose()}
              />
              <h1 className="font-satoshi font-bold text-2xl ">Open User</h1>
            </div>
          <div className="flex flex-wrap flex-row gap-10 justify-start ml-14">
            
            <div className=" w-full h-2/4">
                <Tabs defaultValue="Basic Info" className="w-full">
                <TabsList className="cus-tab-wrap">
                  <TabsTrigger value="Basic Info">User Info</TabsTrigger>
                  <TabsTrigger value="HR">HR</TabsTrigger>
                  <TabsTrigger value="pics">Pics/Files</TabsTrigger>
                  
                </TabsList>
                <TabsContent value="Basic Info">
                  <div className="w-full h-full">
                    <EmployeeDetails item={userItem} open={open} />
                  </div>
                </TabsContent>
                <TabsContent value="HR">
                  <EmployeeHumanResources item = {userItem} open ={open} />
                </TabsContent>
                <TabsContent value="pics">
                <EmployeeFile item = {item} open={open}/>
                </TabsContent>
              </Tabs>
                  
              </div>
          </div>
        </div>
      </Drawer>
    </>
  );
}

export default Employees;
