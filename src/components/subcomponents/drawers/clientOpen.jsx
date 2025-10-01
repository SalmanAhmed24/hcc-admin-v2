
import Drawer from "@mui/material/Drawer";
import "./style.scss";
import React, { useState, useEffect } from "react";
// import Select from "react-select";
// import axios from "axios";
// import { apiPath } from "@/utils/routes";
// import CloseIcon from "@mui/icons-material/Close";
// import { Button } from "@/components/ui/button";
import ClientFile from "../list/ClientFile";
// import Swal from "sweetalert2";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientTask from "../clientTabs/ClientTask";
import Interactions from "../clientTabs/Interactions";
import ClientNotes from "../clientTabs/ClientNotes";
import { ArrowBack } from "@mui/icons-material";
import ClientBasicInfo from "../clientTabs/ClientBasicInfo";




function ClientDetails({ open, handleClose, item }) {

  const [clientItem, setClientItem] = useState(item);


  
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
              <h1 className="font-satoshi font-bold text-2xl ">Open Lead/Client</h1>
            </div>
          <div className="flex flex-wrap flex-row gap-10 justify-start ml-14">
            
            <div className=" w-full h-2/4">
                <Tabs defaultValue="Basic Info" className="w-full">
                <TabsList className="cus-tab-wrap">
                  <TabsTrigger value="Basic Info">Client Info</TabsTrigger>
                  <TabsTrigger value="Task">Task</TabsTrigger>
                  <TabsTrigger value="pics">Pics/Files</TabsTrigger>
                  <TabsTrigger value="Interactions">Interactions</TabsTrigger>
                  <TabsTrigger value="Notes">Notes</TabsTrigger>
                </TabsList>
                <TabsContent value="Basic Info">
                  <div className="w-full h-full">
                    <ClientBasicInfo item={clientItem} open={open} />
                  </div>
                </TabsContent>
                <TabsContent value="Task">
                  <ClientTask item = {clientItem} open ={open} />
                </TabsContent>
                <TabsContent value="pics">
                <ClientFile item = {clientItem} open={open}/>
                </TabsContent>
                <TabsContent value="Interactions">
                <Interactions item={clientItem} open={open} />
                </TabsContent>
                <TabsContent value="Notes">
                <ClientNotes item={clientItem} open={open} />
                </TabsContent>
              </Tabs>
                  
              </div>
          </div>
        </div>
      </Drawer>
    </>
  );
}

export default ClientDetails;
