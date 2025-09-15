
import Drawer from "@mui/material/Drawer";
import "./style.scss";
import React, { useState, useEffect } from "react";
// import Select from "react-select";
// import axios from "axios";
// import { apiPath } from "@/utils/routes";
import CloseIcon from "@mui/icons-material/Close";
import { Button } from "@/components/ui/button";
import ClientFile from "../list/ClientFile";
import Swal from "sweetalert2";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowBack } from "@mui/icons-material";
import ClientResearchInfo from "../clientResearchTabs/clientResearchInfo";
import SocialMediaInfo from "../clientResearchTabs/socialMediaInfo";
import ClientNotes from "../clientTabs/ClientNotes";




function AddNotesAndFiles({ open, handleClose, item }) {

  const [clientItem, setClientItem] = useState(item);


  
  return (
    <>
        <div className="p-10">
          <div className="flex flex-wrap flex-row gap-10 justify-start ml-14">
            
            <div className=" w-full h-2/4">
                <Tabs defaultValue="Notes" className="w-full">
                <TabsList className="cus-tab-wrap">
                  <TabsTrigger value="Notes">Notes</TabsTrigger>
                  <TabsTrigger value="Files">Files</TabsTrigger>

                </TabsList>
                <TabsContent value="Notes">
                <ClientNotes item={item} open={open} />
                </TabsContent>
                <TabsContent value="Files">
                <ClientFile item={item} open={open} />
                </TabsContent>
                </Tabs>
                  
              </div>
          </div>
        </div>
    </>
  );
}

export default AddNotesAndFiles;
