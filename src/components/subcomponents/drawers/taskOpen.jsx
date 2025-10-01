import React from "react";
import { Drawer } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskInfo from "../taskTabs/taskInfo";
import TaskNotes from "../taskTabs/taskNotes";
import TaskLinks from "../taskTabs/taskLinks";
import TaskFile from "../list/taskFile";
import SubTask from "../taskTabs/subTasks";


const TaskDetails = ({ open, handleClose, item }) => {
  if (!item) return null;

  return (<>
         <Drawer
                  className="bg-client-modals"
                  anchor="left" 
                  open={open}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      width: "1142px",  
                      height: "70%", 
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      borderRadius: "16px", 
                      boxShadow: 3,
                      marginTop : "30px",
                      marginBottom: "30px", 
                      backgroundColor: "#1E1B38",
                    },
                  }}
                  >
            <div className="p-10">
              <div className="flex flex-row items-center justify-start gap-6 mb-8">
                  <ArrowBack
                    className="text-3xl hover:cursor-pointer"
                    onClick={() => handleClose()}
                  />
                  <h1 className="font-satoshi font-bold text-2xl text-white ">Open Lead/Client</h1>

                </div>
                <div className="flex flex-wrap flex-row gap-10 justify-start ml-14">
            
            <div className=" w-full h-2/4">
                <Tabs defaultValue="Task Info" className="w-full">
                <TabsList className="cus-tab-wrap">
                  <TabsTrigger value="Task Info">Task Info</TabsTrigger>
                  <TabsTrigger value="Sub Task">Sub Task</TabsTrigger>
                  <TabsTrigger value="pics">Pics/Files</TabsTrigger>
                  <TabsTrigger value="Links">Links</TabsTrigger>
                  <TabsTrigger value="Notes">Notes</TabsTrigger>
                </TabsList>
                <TabsContent value="Task Info">
                  <div className="w-full h-full">
                    <TaskInfo item={item} open={open} />
                  </div>
                </TabsContent>
                <TabsContent value="Sub Task">
                  <SubTask item={item} open={open} />
                </TabsContent>
                <TabsContent value="pics">
                <TaskFile item={item} open={open}/>
                </TabsContent>
                <TabsContent value="Links">
                <TaskLinks item={item} open={open} />
                </TabsContent>
                <TabsContent value="Notes">
                <TaskNotes item={item} open={open} />
                </TabsContent>
              </Tabs>
                  
              </div>
          </div>
            </div>
          </Drawer>
        </>
  );
};

export default TaskDetails;

