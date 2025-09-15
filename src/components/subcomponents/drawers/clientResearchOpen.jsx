
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
import AddNotesAndFiles from "../clientResearchTabs/clientNotesFiles";
import SubmitResearch from "../clientResearchTabs/submitResearch";




function AddClientResearch({ open, handleClose, item }) {

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
              <h1 className="font-satoshi font-bold text-2xl ">Add Research</h1>
            </div>
          <div className="flex flex-wrap flex-row gap-10 justify-start ml-14">
            
            <div className=" w-full h-2/4">
                <Tabs defaultValue="Basic Info" className="w-full">
                <TabsList className="cus-tab-wrap">
                  <TabsTrigger value="Basic Info">Basic Info</TabsTrigger>
                  <TabsTrigger value="SEO">SEO</TabsTrigger>
                  <TabsTrigger value="Social Media Presence">Social Media Presence</TabsTrigger>
                  <TabsTrigger value="Website Analysis">Website Analysis</TabsTrigger>
                  <TabsTrigger value="Competitor Analysis">Competitor Analysis</TabsTrigger>
                  <TabsTrigger value="Target Audience">Target Audience</TabsTrigger>
                  <TabsTrigger value="Goals and Pain">Goals and Pain</TabsTrigger>
                  <TabsTrigger value="Basic Demographics">Basic Demographics</TabsTrigger>
                  <TabsTrigger value="Notes and Files">Notes and Files</TabsTrigger>
                  <TabsTrigger value="Submit Research">Submit Research</TabsTrigger>


                </TabsList>
                <TabsContent value="Basic Info">
                  <div className="w-full h-full">
                    <ClientResearchInfo item={clientItem} open={open} />
                  </div>
                </TabsContent>
                {/* <TabsContent value="SEO">
                  <ClientSeo item={clientItem} open={open} />
                </TabsContent> */}
                <TabsContent value="Social Media Presence">
                <SocialMediaInfo item={clientItem} open={open} />
                </TabsContent>
                {/* <TabsContent value="Website Analysis">
                <ClientWebsiteAnalysis item={clientItem} open={open} />
                </TabsContent> */}
                {/* <TabsContent value="Competitor Analysis">
                <ClientCompetitorAnalysis item={clientItem} open={open} />
                </TabsContent>
                <TabsContent value="Target Audience">
                <ClientTargetAudience item={clientItem} open={open} />
                </TabsContent> */}
                {/* <TabsContent value="Goals and Pain">
                <ClientGoalsAndPain item={clientItem} open={open} />
                </TabsContent>
                <TabsContent value="Basic Demographics">
                <ClientBasicDemographics item={clientItem} open={open} />
                </TabsContent> */}
                <TabsContent value="Notes and Files">
                <AddNotesAndFiles item={clientItem} open={open} />
                </TabsContent>
                <TabsContent value="Submit Research">
                <SubmitResearch item={clientItem} open={open} />
                </TabsContent>
                
              </Tabs>
                  
              </div>
          </div>
        </div>
      </Drawer>
    </>
  );
}

export default AddClientResearch;
