import { Poppins } from "next/font/google";
import { Button } from "@/components/ui/button";
import { apiPath } from "@/utils/routes";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { SkeletonCard } from "@/components/reusable/skeleton-card";
import useAuthStore from "@/store/store";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "800"],
  style: ["italic", "normal"],
  subsets: ["latin"],
});

import "./style.scss";
import MailingTable from "../subcomponents/tables/mailingTable";
import AddEmailCredentials from "../subcomponents/drawers/addEmailCredentials";
import InboxTable from "../subcomponents/tables/inboxTable";
import AddEmailTemplate from "../subcomponents/drawers/emailTemplateDrawer";
import EmailTemplateTable from "../subcomponents/tables/emailTemplateTable";

function MailingComp({ picklistName }) {
  const [picklistData, setPicklistData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); 
  const [totalPages, setTotalPages] = useState(1);
  const [loader, setLoader] = useState(false);
  const [userTypeModal, setUserTypeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("");  
  const [filterOpt, setFilterOpt] = useState([]);
  const [emailTemplateModal, setEmailTemplateModal] = useState(false);
  
  const user = useAuthStore((state) => state.user);
  const usernameId = user?.user?._id || ""; // Directly get from Zustand store
  const username = user?.user?.username || "";

  function filterOptions() {
    let sorts;
    
    if (picklistName == "Inbox") {
      sorts = [];
    } else if (picklistName == "Gmail") {
      sorts = [];
    } else if (picklistName == "Email Templates") {
      sorts = [];
    } else { 
      console.log("No data found"); 
    }

    const options = sorts.map((item) => ({
      label: item,
      value: item,
    }));
    setFilterOpt(options);
  }

  const fetchData = useCallback(async (page = 1) => {
    console.log("fetchData called with usernameId:", usernameId);
    
    // If we need usernameId for Inbox but it's not available, don't fetch
    if (picklistName === "Inbox" && !usernameId) {
      console.log("Skipping fetch - usernameId not available yet");
      return;
    }

    setLoader(true);
    let url = "";
    
    try {
      if (picklistName === "Inbox") {
        url = `${apiPath.prodPath}/api/appGmail/listEmails/${usernameId}`;
      } else if (picklistName === "Gmail") {
        url = `${apiPath.prodPath}/api/clients/allNewLeads?page=${page}&limit=8`;
      } else if (picklistName === "Email Templates") {
        url = `${apiPath.prodPath}/api/emailTemplate/getEmailTemplateForUser/${username}`;
      }

      const res = await axios.get(url);
      
      if (picklistName === "Inbox") {
        setPicklistData(res.data);
      } else if (picklistName === "Gmail") {
        setPicklistData(res.data);
      } else if (picklistName === "Email Templates") {
        setPicklistData(res.data);
      } else {
        console.log("No data found");
      }
      
      setLoader(false);
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        text: "Something went wrong with the data fetching",
      });
      setLoader(false);
    }
  }, [picklistName, usernameId]); // Add dependencies

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!filterBy || !searchTerm.trim()) {
      Swal.fire({
        icon: "warning",
        text: "Please select a filter and enter a search term.",
      });
      return;
    }

    setLoader(true);
    let url = "";

    try {
      if (picklistName === "Inbox") {
        url = `${apiPath.prodPath}/api/gmail/inbox?${filterBy}=${searchTerm}`;
      } else if (picklistName === "Gmail") {
        url = `${apiPath.prodPath}/api/clients/allNewLeads?${filterBy}=${searchTerm}`;
      } else if (picklistName === "Email Templates") {
        url = `${apiPath.prodPath}/api/emailTemplate/getEmailTemplateForUser/${username}`;
      }

      const res = await axios.get(url);
      
      if (picklistName === "Inbox") {
        setPicklistData(res.data);
      } else if (picklistName === "Gmail") {
        setPicklistData(res.data);
      } else if (picklistName === "Email Templates") {
        setPicklistData(res.data);
      }
      
      setLoader(false);
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        text: "Something went wrong with the data fetching",
      });
      setLoader(false);
    }
  };

  useEffect(() => {
    filterOptions();
  }, [picklistName]);

  useEffect(() => {
    if (picklistName === "Inbox" && !usernameId) {
      // Wait for usernameId to be available before fetching
      return;
    }
    fetchData(currentPage);
  }, [currentPage, picklistName, usernameId, fetchData]);

  const handlePageChange = (event, page) => {
    setCurrentPage(page); 
  };

  const handleUserTypeModal = () => {
    setUserTypeModal(true);
  };

  const refreshData = async (page = 1) => {
    setLoader(true);
    let url = "";
    
    try {
      if (picklistName === "Inbox") {
        url = `${apiPath.prodPath}/api/appGmail/listEmails/${usernameId}`;
      } else if (picklistName === "Gmail") {
        url = `${apiPath.prodPath}/api/clients/allNewLeads?page=${page}&limit=8`;
      } else if (picklistName === "Email Templates") {
        url = `${apiPath.prodPath}/api/emailTemplate/getEmailTemplateForUser/${username}`;
      }

      const res = await axios.get(url);
      
      if (picklistName === "Inbox") {
        setPicklistData(res.data);
      } else if (picklistName === "Gmail") {
        setPicklistData(res.data);
      } else if (picklistName === "Email Templates") {
        setPicklistData(res.data);
      } else {
        console.log("No data found");
      }
      
      setLoader(false);
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        text: "Something went wrong with the data fetching",
      });
      setLoader(false);
    }
  };

  const handleAuth = () => {
    window.location.assign("https://api-hccbackendcrm.com/auth/google");
  };

  const handleEmailTemplateModal = () => {
    setEmailTemplateModal(true);
  };

  return (
    <main className={`${poppins.className} flex flex-col`}>
      <div className="flex w-full flex-row flex-wrap justify-between">
        <div className="w-full flex flex-row gap-2 mb-[24px] h-[34px]">
          <h1 className="font-satoshi font-semibold text-2xl ml-[20px]">{picklistName}</h1>
        </div>
        <div className="flex flex-row gap-4 items-start border-none w-full">
          <form onSubmit={handleSearch} className="flex flex-row gap-4 w-full items-center">
            <input
              type="search"
              placeholder="  Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-5 text-white bg-[#2D245B] h-[42px] w-[243px] rounded-full font-satoshi"
            />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="rounded-full text-white bg-[#2D245B] h-[42px] w-[243px] px-5 pr-4 font-satoshi"
            >
              <option value="" disabled>Select Filter</option>
              {filterOpt.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value}
                </option>
              ))}
            </select>
            <input
              type="submit"
              className="rounded-full w-[99px] h-[42px] font-satoshi font-bold px-3 bg-[#2D245B] text-white hover:bg-gray-500 cursor-pointer"
              value={"Search"}
            />
          </form>
          <div className="w-3/4 flex flex-row gap-5 justify-end">
            {(picklistName === "Gmail" || picklistName === "Inbox") && (
              <Button
                onClick={handleAuth}
                variant="outline"
                className="bg-[#B797FF] w-[162.2px] h-[42] rounded-[8px] font-satoshi"
              >
                <AddIcon /> Google
              </Button>
            )}
            {picklistName === "Email Templates" && (
              <Button
                onClick={handleEmailTemplateModal}
                variant="outline"
                className="bg-[#B797FF] w-[162.2px] h-[42] rounded-[8px] font-satoshi"
              >
                <AddIcon /> {picklistName}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        {loader ? (
          <SkeletonCard />
        ) : picklistName === "Gmail" && (
          <MailingTable />
        )}
        {loader ? (
          <SkeletonCard />
        ) : picklistName === "Inbox" && (
          <InboxTable
            picklistData={picklistData}
            refreshData={refreshData}
            picklistName={picklistName}
          />
        )}
        {loader ? (
          <SkeletonCard />
        ) : picklistName === "Email Templates" && (
          <EmailTemplateTable
            picklistData={picklistData}
            refreshData={refreshData}
            picklistName={picklistName}
          />
        )}
      </div>
      
      {picklistName === "Gmail" && (
        <AddEmailCredentials
          open={userTypeModal}
          handleClose={() => setUserTypeModal(false)}
        />
      )}
      {picklistName === "Email Templates" && (
        <AddEmailTemplate
          open={emailTemplateModal}
          handleClose={() => setEmailTemplateModal(false)}
          refreshData={refreshData}
        />
      )}
    </main>
  );
}

export default MailingComp;
