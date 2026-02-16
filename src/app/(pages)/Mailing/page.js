"use client";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import React, { useState, useEffect } from "react";
// import useStore from "@/store/store";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/store";
import MailingComp from "@/components/mailingComp";
// import SendBulkEmailViaGmail from "@/components/subcomponents/drawers/bulkEmialDrawer";

function MailingPage() {
  const [value, setValue] = useState("Inbox");
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
              
              <Tab label="Inbox" value="Inbox" />
              <Tab label="Gmail" value="Gmail" />
              <Tab label="Email Templates" value="Email Templates"/>
            </TabList>
          </Box>
          <TabPanel value="Inbox">
            <MailingComp picklistName={"Inbox"} />
          </TabPanel>
          <TabPanel value="Gmail">
            <MailingComp picklistName={"Gmail"} />
          </TabPanel>
          <TabPanel  value="Email Templates">
            <MailingComp picklistName={"Email Templates"}/>
          </TabPanel>
        </TabContext>
      </Box>
    </main>
  );
}

export default  MailingPage;
