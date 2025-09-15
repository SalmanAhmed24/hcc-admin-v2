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
import PurchaseComp from "@/components/purchaseSaleComp";



function PurchaseSalesPage() {
  const [value, setValue] = useState("Products & Services");
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
              <Tab label="Products & Services" value="Products & Services" />
            </TabList>
          </Box>
          <TabPanel value="Products & Services">
            <PurchaseComp picklistName={"Products & Services"} />
          </TabPanel>
          
        </TabContext>
      </Box>
    </main>
  );
}

export default  PurchaseSalesPage;
