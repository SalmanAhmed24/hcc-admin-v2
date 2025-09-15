"use client";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import React, { useState, useEffect } from "react";
import useStore from "@/store/store";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/store";
import SaleslistComp from "@/components/SalesComp";
import ClientResearchComp from "@/components/mainComponents/clientResearchComp";

function SalesPage() {
  const [value, setValue] = useState("Web Requests");
  const isUserLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
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
  return (
    <main>
      <Box sx={{ width: "100%", typography: "body1" }}>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", color: "#fff" }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab label="Web Requests" value="Web Requests" />
              <Tab label="Contact Leads" value="Contact Leads" />
              <Tab label="Direct Mail" value="Direct Mail"/>
              {/* <Tab label="Leads/Clients" value="Leads/Clients"/> */}
              <Tab label="Clients Research" value="Clients Research"/>


            </TabList>
          </Box>
          <TabPanel value="Web Requests">
            <SaleslistComp picklistName={"Web Requests"} />
          </TabPanel>
          <TabPanel value="Contact Leads">
            <SaleslistComp picklistName={"Contact Leads"} />
          </TabPanel>
          <TabPanel  value="Direct Mail">
            <SaleslistComp picklistName={"Direct Mail"}/>
          </TabPanel>
          {/* <TabPanel  value="Leads/Clients">
            <ClientComp/>
          </TabPanel> */}
          <TabPanel  value="Clients Research">
            <ClientResearchComp/>
          </TabPanel>
        </TabContext>
      </Box>
    </main>
  );
}

export default  SalesPage;
