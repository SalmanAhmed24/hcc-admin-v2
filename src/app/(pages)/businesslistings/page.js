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
import BusinessListingComp from "@/components/businessListingComp";

function BusinessListingsPage() {
  const [value, setValue] = useState("Business Listings");
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
              <Tab label="Business Listings" value="Business Listings" />
              <Tab label="Search" value="Search" />

            </TabList>
          </Box>
          <TabPanel value="Business Listings">
            <BusinessListingComp picklistName={"Business Listings"} />
          </TabPanel>
          <TabPanel value="Search">
            <BusinessListingComp picklistName={"Search"} />
          </TabPanel>
        </TabContext>
      </Box>
    </main>
  );
}

export default  BusinessListingsPage;
