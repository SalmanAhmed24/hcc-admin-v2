"use client";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import React, { useState, useEffect } from "react";
import PicklistComp from "@/components/picklistComp";
import useStore from "@/store/store";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/store";
import EmployeeComp from "@/components/mainComponents/employeesComp";



function SettingsPage() {
  const [value, setValue] = useState("User Type");
  const isUserLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const user = useAuthStore((state)=> state.user);
  const router = useRouter();

useEffect(() => {
  if (!hasHydrated) return; 

  if (!isUserLoggedIn) {
    router.push("/login");
  }
}, [isUserLoggedIn, hasHydrated]);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

let isPrivilegedUser;
if (
  user?.user?.role === "Admin" ||
  user?.user?.role === "SuperUser" ||
  user?.user?.role === "Administrator"
) {
  isPrivilegedUser = true;
} else {
  isPrivilegedUser = false;
}

  return (
    <main>
      <div className="flex flex-row flex-wrap justify-start items-start w-full h-full">
         {/* <Box sx={{ width: "100%", typography: "body1" }}> */}
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", color: "#fff"}}>
          <TabList
            orientation="vertical"
            onChange={handleChange}
            aria-label="Vertical tabs example"
            className="flex flex-col mt-6"
          >
            <Tab label="User Type" value="User Type" />
            {isPrivilegedUser ? <Tab label="Employees" value="Employees" />:null}
            <Tab label="Zip Code" value="Zip Code" />
            <Tab label="Territory" value="Territory" />
            <Tab label="Managers" value="Managers" />
            <Tab label="File Category" value="File Category" />
            <Tab label="Task Category" value="Task Category" />
            <Tab label="Notes Category" value="Notes Category" />
            <Tab label="Interaction Category" value="Interaction Category" />
            <Tab label="Client Status" value="Client Status" />
            <Tab label="Task Status" value="Task Status" />
            <Tab label="Task Priority" value="Task Priority" />
            <Tab label="Client Category" value="Need Category" />
            <Tab label="Client Sub-Category" value="Need Sub-Category" />
            <Tab label="Status" value="Status" />
            <Tab label="Carrier Route" value="Carrier Route"/>
            <Tab label="DM State" value="DM State"/>
            <Tab label = "Product List" value="Product List"/>
            <Tab label = "Service List" value="Service List"/>
            <Tab label = "Department" value="Department"/>


          </TabList>

          </Box>
          <div className="flex flex-col justify-start items-start w-2/3 h-full">
          <TabPanel value="User Type">
            <PicklistComp picklistName={"User Type"} />
          </TabPanel>
          {isPrivilegedUser ? <TabPanel value="Employees">
            <EmployeeComp />
          </TabPanel> : null}
          <TabPanel value="Zip Code">
            <PicklistComp picklistName={"Zip Code"} />
          </TabPanel>
          <TabPanel value="Territory">
            <PicklistComp picklistName={"Territory"} />
          </TabPanel>
          <TabPanel value="Managers">
            <PicklistComp picklistName={"Managers"} />
          </TabPanel>
          <TabPanel value="File Category">
            <PicklistComp picklistName={"File Category"} />
          </TabPanel>
          <TabPanel value="Task Category">
            <PicklistComp picklistName={"Task Category"} />
          </TabPanel>
          <TabPanel value="Notes Category">
            <PicklistComp picklistName={"Notes Category"} />
          </TabPanel>
          <TabPanel value="Interaction Category">
            <PicklistComp picklistName={"Interaction Category"} />
          </TabPanel>
          <TabPanel value="Client Status">
            <PicklistComp picklistName={"Client Status"} />
          </TabPanel>
          <TabPanel value="Task Status">
            <PicklistComp picklistName={"Task Status"} />
          </TabPanel>
          <TabPanel value="Task Priority">
            <PicklistComp picklistName={"Task Priority"} />
          </TabPanel>
          <TabPanel value="Need Category">
            <PicklistComp picklistName={"Need Category"} />
          </TabPanel>
          <TabPanel value="Need Sub-Category">
            <PicklistComp picklistName={"Need Sub-Category"} />
          </TabPanel>
          <TabPanel value="Status">
            <PicklistComp picklistName={"Status"} />
          </TabPanel>
          <TabPanel value="Carrier Route">
            <PicklistComp picklistName={"Carrier Route"}/>
          </TabPanel>
          <TabPanel value="DM State">
             <PicklistComp picklistName={"DM State"}/>
          </TabPanel>
          <TabPanel value="Product List">
            <PicklistComp picklistName={"Product List"}/>
          </TabPanel>
          <TabPanel value="Service List">
            <PicklistComp picklistName={"Service List"}/>
          </TabPanel>
          <TabPanel value="Department">
            <PicklistComp picklistName={"Department"}/>
          </TabPanel>
          </div>
          
        </TabContext>
      {/* </Box> */}
      </div>
      
    </main>
  );
}

export default SettingsPage;
