import { Poppins } from "next/font/google";
import EmployeeTable from "@/components/subcomponents/tables/employeeTable";
import { Button } from "@/components/ui/button";
import { apiPath } from "@/utils/routes";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Swal from "sweetalert2";
import { SkeletonCard } from "@/components/reusable/skeleton-card";
import Select from "react-select";
import { Search } from "lucide-react";
import SearchForm from "../reusable/searchForm";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "800"],
  style: ["italic", "normal"],
  subsets: ["latin"],
});
import "./style.scss";

import SalelistTable from "../subcomponents/tables/saleslistTable";
import AddSalelist from "../subcomponents/drawers/salelist";


function SaleslistComp({ picklistName }) {
  const [picklistData, setPicklistData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); 
  const [totalPages, setTotalPages] = useState(1);
  const [loader, setLoader] = useState(false);
  const [userTypeModal, setUserTypeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("");  
  const [filterOpt, setFilterOpt] = useState([]);

  function filterOptions() {
    let sorts;

    if(picklistName == "Web Requests"){
       sorts = [];
    }
    else if(picklistName == "Contact Leads"){
      sorts = [];
    }else if (picklistName == "Direct Mail"){
      sorts = ["zipCode", "carrierRoute"];
    }else{ console.log("No data found"); }

    const options = sorts.map((item)=>{
      const statusOption = {
        label : item,
        value : item,
      }
      return statusOption;
    });
    setFilterOpt(options);
  }


  const handleSearch = async (e) => {
    e.preventDefault()
    if (!filterBy || !searchTerm.trim()) {
      Swal.fire({
        icon: "warning",
        text: "Please select a filter and enter a search term.",
      });
      return;
    }

    setLoader(true);
    
      var url = "";
   
    if (picklistName == "Web Requests") {
      url = `${apiPath.prodPath}/api/webSaleLeads/getAllWebSaleLeads?${filterBy}=${searchTerm}`;
    }
    if (picklistName == "Contact Leads") {
      url = `${apiPath.prodPath}/api/webContactLeads/getAllWebContactLeads?${filterBy}=${searchTerm}`;
    }
    if (picklistName == "Direct Mail"){
      url = `${apiPath.prodPath}/api/directMail/directmail?${filterBy}=${searchTerm}`
    }
    
      const res = await axios
      .get(url)
      .then((res) => {
        if (picklistName == "Web Requests"){
          setPicklistData(res.data.webLeads);
        }
        if (picklistName == "Contact Leads"){
          setPicklistData(res.data.contactLeads);
        }
        if (picklistName == "Direct Mail"){
          setPicklistData(res.data);
        }
        setLoader(false);
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          icon: "error",
          text: "Something went wrong with the data fetching",
        });
        setLoader(false);
      });
      
  };


  
  const fetchData = (page=1)=>{
    setLoader(true);
    filterOptions();
    var url = "";
    if (picklistName == "Web Requests") {
      url = `${apiPath.prodPath}/api/webSaleLeads/getAllWebSaleLeads?page=${page}&limit=8`;
    }
    if (picklistName == "Contact Leads") {
      url = `${apiPath.prodPath}/api/webContactLeads/getAllWebContactLeads?page=${page}&limit=8`;
    }
    if (picklistName == "Direct Mail"){
      url = `${apiPath.prodPath}/api/directMail/alldirectmails?page=${page}&limit=8`
    }
  
    axios
      .get(url)
      .then((res) => {
        if (picklistName == "Web Requests"){
          setPicklistData(res.data.webLeads);
          setTotalPages(res.data.pages);
        }else if (picklistName == "Contact Leads"){
          setPicklistData(res.data.contactLeads);
          setTotalPages(res.data.pages);
        }else if (picklistName == "Direct Mail"){
          setPicklistData(res.data.directMail);
          setTotalPages(res.data.pages);
        }
        else{
          console.log("No data found");
        }
        setLoader(false);
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          icon: "error",
          text: "Something went wrong with the data fetching",
        });
        setLoader(false);
      });
  }
  
  
  useEffect(() => {
    fetchData(currentPage)
  }, [currentPage]);

  const handlePageChange = (event, page) => {
    setCurrentPage(page); 
  };

  const handleUserTypeModal = () => {
    setUserTypeModal(true);
  };
  const refreshData = async (page=1) => {
    setLoader(true);
    var url = "";
    if (picklistName == "Web Requests") {
      url = `${apiPath.prodPath}/api/webSaleLeads/getAllWebSaleLeads?page=${page}&limit=8`;
    }
    if (picklistName == "Contact Leads") {
      url = `${apiPath.prodPath}/api/webContactLeads/getAllWebContactLeads?page=${page}&limit=8`;
    }
    if (picklistName == "Direct Mail"){
      url = `${apiPath.prodPath}/api/directMail/alldirectmails?page=${page}&limit=8`
    }


    await axios
      .get(url)
      .then((res) => {if (picklistName == "Web Requests"){
        setPicklistData(res.data.webLeads);
      }else if (picklistName == "Contact Leads"){
        setPicklistData(res.data.contactLeads);
      }else if (picklistName == "Direct Mail"){
          setPicklistData(res.data.directMail);
        }
      else{
        console.log("No data found");
      }
        setLoader(false);
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          icon: "error",
          text: "Something went wrong with the data fetching",
        });
        setLoader(false);
      });
  };
  const addPicklist = async (data) => {
    var url = "";
    if (picklistName == "Web Requests") {
      url = `${apiPath.prodPath}/api/webSaleLeads/addWebSaleLead`;
    }
    if (picklistName == "Contact Leads") {
      url = `${apiPath.prodPath}/api/webContactLeads/addWebContactLead`;
    }
    if (picklistName == "Direct Mail"){
      url = `${apiPath.prodPath}/api/directMail/addDirectMail`
    }
    
    await axios
      .post(url, data)
      .then( (res) => {
        setUserTypeModal(false);
        console.log(res);
        Swal.fire({
          icon: "success",
          text: "Added Successfully",
        });
         refreshData();
      })
      .catch((err) => {
        setUserTypeModal(false);

        console.log(err);
      });
  };
  const handleTest=(data)=>{
    console.log("@@@@@",data)
  }
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
            <Button
              onClick={handleUserTypeModal}
              variant="outline"
              className="bg-[#B797FF] w-[162.2px] h-[42] rounded-[8px] font-satoshi"
            >
              <AddIcon /> {picklistName}
            </Button>
          </div>
        </div>

        {/* <div className="w-3/4 flex flex-row gap-5 justify-end">
          <Button
            onClick={handleUserTypeModal}
            variant="outline"
            className="bg-transparent"
          >
            <AddIcon /> {picklistName}
          </Button>
        </div>
        <form onSubmit={handleSearch} className="flex flex-row gap-4 w-full items-center">
        <Select
                options={filterOpt}
                value={filterBy}
                onChange={(selectedOption) => setFilterBy(selectedOption)}
                placeholder="Select Filter"
                className="rounded text-gray-800 h-[37px] w-1/5"
              />
              <div className="flex gap-4 rounded items-center border-none">
                <input
                  type="search"
                  placeholder="  Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded px-5 text-gray-800 h-[38px] w-full"
                />
                <input
                  type="submit"
                  className="rounded p-2 bg-gray-400 text-black hover:bg-gray-500 cursor-pointer"
                value={"Search"}
                />                
              </div>
        </form> */}
        {/* <div className="w-full">
          <SearchForm handleSearch={handleTest} />
        </div> */}
      </div>

      <div className="mt-8">
        {loader ? (
          <SkeletonCard />
        ) : (
          <SalelistTable
            picklistData={picklistData}
            picklistName={picklistName}
            refreshData={refreshData}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
      <AddSalelist
        picklistName={picklistName}
        open={userTypeModal}
        handleClose={() => setUserTypeModal(false)}
        addEmp={(data) => addPicklist(data)}
      />
    </main>
  );
}

export default SaleslistComp;
