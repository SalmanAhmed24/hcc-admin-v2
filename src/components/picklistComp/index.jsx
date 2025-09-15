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
import PicklistTable from "../subcomponents/tables/picklistTable";
import AddPicklist from "../subcomponents/drawers/picklist";
import { ClearAll } from "@mui/icons-material";


function PicklistComp({ picklistName }) {
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

    if(picklistName == "User Type"){
       sorts = [];
    }else if(picklistName == "Zip Code"){
      sorts = ['zip', 'city', 'state'];
    }else if(picklistName == "Territory"){
      sorts = ['territoryName'];
    }else if (picklistName == "Managers"){
      sorts = ['managerName', 'managerRole', 'managerTerritory'];
    }else if (picklistName == "File Category"){
      sorts = ['categoryName'];
    }else if (picklistName == "Task Category"){
      sorts = ['categoryName'];
    }else if (picklistName == "Notes Category"){
      sorts = ['categoryName'];
    }else if(picklistName == "Interaction Category"){
      sorts = ['categoryName'];
    }else if(picklistName == "Client Status"){
      sorts = ['clientStatus'];
    }else if(picklistName == "Task Status"){
      sorts = ['taskStatus'];
    }else if(picklistName == "Task Priority"){
      sorts = ['taskPriority'];
    }else if(picklistName == "Need Category"){
      sorts = ['categoryName',"categoryCode",
      "subCategory",
      "subCategoryCode",];
    }else if(picklistName == "Need Sub-Category"){
      sorts = ["subCategoryName",
        "subCategoryCode",];
    }else if(picklistName == "Status"){
      sorts = ["statusName", "statusCode"];
    }else if(picklistName == "Carrier Route"){
      sorts = ["carrierRoute", "routeDescription"]
    }else if(picklistName == "DM State"){
      sorts = ["stateName", "stateCode"]
    }else if(picklistName == "Product List"){
      sorts = ["productName", "tools"];
    }else if(picklistName == "Service List"){
      sorts = ["serviceName", "tools"];
    }else if (picklistName == "Department"){
      sorts = ["departmentName", "departmentShortCode"]
    }
    else{ console.log("No data found"); }  

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
   
    if (picklistName == "Zip Code") {
      url = `${apiPath.prodPath}/api/picklist/zipcodes/getfilteredzipcodes/?${filterBy}=${searchTerm}`;
    }
    if (picklistName == "Territory") {
      url = `${apiPath.prodPath}/api/picklist/territory/getterritory/?${filterBy}=${searchTerm}`;
    }
    if (picklistName == "User Type") {
      url = `${apiPath.prodPath}/api/picklist/usertypes/getfilteredusertypes/?${filterBy}=${searchTerm}`;
    }
    if (picklistName == "Managers") {
      url = `${apiPath.prodPath}/api/picklist/managers/getManager/?${filterBy}=${searchTerm}`;
    }
    if (picklistName == "File Category") {
      url = `${apiPath.prodPath}/api/picklist/fileCategory/getFileCategory/?${filterBy}=${searchTerm}`;
    }
    if (picklistName == "Task Category") {
      url = `${apiPath.prodPath}/api/picklist/taskCategory/getTaskCategory/?${filterBy}=${searchTerm}`;
    }
    if (picklistName == "Notes Category") {
      url = `${apiPath.prodPath}/api/picklist/noteCategory/getNoteCategory/?${filterBy}=${searchTerm}`;
    }
    if (picklistName == "Interaction Category") {
      url = `${apiPath.prodPath}/api/picklist/interactionType/getInteractionCategory/?${filterBy}=${searchTerm}`;
    }
    if (picklistName == "Client Status") {
      url = `${apiPath.prodPath}/api/picklist/clientStatus/getClientStatus/?${filterBy}=${searchTerm}`;
    }
    if (picklistName == "Task Status") {
      url = `${apiPath.prodPath}/api/picklist/taskStatus/getTaskStatus/?${filterBy}=${searchTerm}`;
    }
    if (picklistName == "Task Priority") {
      url = `${apiPath.prodPath}/api/picklist/taskPriority/getTaskPriority/?${filterBy}=${searchTerm}`;
    }
    if (picklistName == "Need Category") {
      url = `${apiPath.prodPath}/api/picklist/needCategory/getNeedCategory/?${filterBy}=${searchTerm}`;
    }
    if (picklistName == "Need Sub-Category") {
      url = `${apiPath.prodPath}/api/picklist/needSubCategory/getNeedSubCategory/?${filterBy}=${searchTerm}`;
    }
    if (picklistName == "Status") {
      url = `${apiPath.prodPath}/api/picklist/status/getStatus/?${filterBy}=${searchTerm}`;
    }
    if (picklistName == "Carrier Route"){
      url = `${apiPath.prodPath}/api/picklist/carrierRoute/getCarrierRoute/?${filterBy}=${searchTerm}`;
    }
    if (picklistName == "DM State"){
      url = `${apiPath.prodPath}/api/picklist/DMstate/getDMstate/?${filterBy}=${searchTerm}`;
    }
    if (picklistName == "Product List"){
      url = `${apiPath.prodPath}/api/picklist/productList/getProduct/?${filterBy}=${searchTerm}`;
    }
    if (picklistName == "Service List"){
      url = `${apiPath.prodPath}/api/picklist/serviceList/getService/?${filterBy}=${searchTerm}`;
    }
    if (picklistName == "Department"){
      url = `${apiPath.prodPath}/api/picklist/departments/getDepartment/?${filterBy}=${searchTerm}`;
    }
    


      const res = await axios
      .get(url)
      .then((res) => {
        if (picklistName == "Zip Code"){
          setPicklistData(res.data);
        }else{
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
    if (picklistName == "User Type") {
      url = `${apiPath.prodPath}/api/picklist/usertypes/getallusertypes?page=${page}&limit=8`;
    }
    if (picklistName == "Zip Code") {
      url = `${apiPath.prodPath}/api/picklist/zipcodes/getallzipcodes?page=${page}&limit=8`;
    }
    if (picklistName == "Territory") {
      url = `${apiPath.prodPath}/api/picklist/territory/getallterritory?page=${page}&limit=8`;
    }
    if (picklistName == "Managers") {
      url = `${apiPath.prodPath}/api/picklist/managers/getAllManagers?page=${page}&limit=8`;
    }
    if (picklistName == "File Category") {
      url = `${apiPath.prodPath}/api/picklist/fileCategory/getAllFileCategory?page=${page}&limit=8`;
    }
    if (picklistName == "Task Category") {
      url = `${apiPath.prodPath}/api/picklist/taskCategory/getAllTaskCategory?page=${page}&limit=8`;
    }
    if (picklistName == "Notes Category") {
      url = `${apiPath.prodPath}/api/picklist/noteCategory/getAllNoteCategory?page=${page}&limit=8`;
    }
    if (picklistName == "Interaction Category") {
      url = `${apiPath.prodPath}/api/picklist/interactionType/getAllInteractionCategory?page=${page}&limit=8`;
    }
    if (picklistName == "Client Status") {
      url = `${apiPath.prodPath}/api/picklist/clientStatus/getAllClientStatus?page=${page}&limit=8`;
    }
    if (picklistName == "Task Status") {
      url = `${apiPath.prodPath}/api/picklist/taskStatus/getAllTaskStatus?page=${page}&limit=8`;
    }
    if (picklistName == "Task Priority") {
      url = `${apiPath.prodPath}/api/picklist/taskPriority/getAllTaskPriority?page=${page}&limit=8`;
    }
    if (picklistName == "Need Category") {
      url = `${apiPath.prodPath}/api/picklist/needCategory/getAllNeedCategory?page=${page}&limit=8`;
    }
    if (picklistName == "Need Sub-Category") {
      url = `${apiPath.prodPath}/api/picklist/needSubCategory/getAllNeedSubCategory?page=${page}&limit=8`;
    }
    if (picklistName == "Status") {
      url = `${apiPath.prodPath}/api/picklist/status/getAllStatus?page=${page}&limit=8`;
    }
    if (picklistName == "Carrier Route"){
      url = `${apiPath.prodPath}/api/picklist/carrierRoute/getAllCarrierRoute?page=${page}&limit=8`;
    }
    if (picklistName == "DM State"){
      url = `${apiPath.prodPath}/api/picklist/DMstate/getAllDMstate?page=${page}&limit=8`;
    }
    if (picklistName == "Product List"){
      url = `${apiPath.prodPath}/api/picklist/productList/getAllProduct?page=${page}&limit=8`;
    }
    if (picklistName == "Service List"){
      url = `${apiPath.prodPath}/api/picklist/serviceList/getAllService?page=${page}&limit=8`;
    }
    if (picklistName == "Department"){
      url = `${apiPath.prodPath}/api/picklist/departments/getAllDepartments?page=${page}&limit=8`;
    }
    axios
      .get(url)
      .then((res) => {
        if (picklistName == "Zip Code"){
          setPicklistData(res.data.zipCodes);
          setTotalPages(res.data.pages);
          console.log(res.data.zipCodes);
        }else if (picklistName == "User Type"){
          setPicklistData(res.data.userTypes);
          setTotalPages(res.data.pages);
        }else if (picklistName == "Territory"){
          setPicklistData(res.data.territories);
          setTotalPages(res.data.pages);
        }else if (picklistName == "Managers"){
          setPicklistData(res.data.managers);
          setTotalPages(res.data.pages);
        }else if (picklistName == "File Category"){
          setPicklistData(res.data.fileCategory);
          setTotalPages(res.data.pages);
        }else if (picklistName == "Task Category"){
          setPicklistData(res.data.taskCategory);
          setTotalPages(res.data.pages);
        }else if (picklistName == "Notes Category"){
          setPicklistData(res.data.noteCategory);
          setTotalPages(res.data.pages);
        }else if (picklistName == "Interaction Category"){
          setPicklistData(res.data.interactionCategory);
          setTotalPages(res.data.pages);
        }else if (picklistName == "Client Status"){
          setPicklistData(res.data.clientStatus);
          setTotalPages(res.data.pages);
        }else if (picklistName == "Task Status"){
          setPicklistData(res.data.taskStatus);
          setTotalPages(res.data.pages);
        }else if (picklistName == "Task Priority"){
          setPicklistData(res.data.taskPriority);
          setTotalPages(res.data.pages);
        }else if (picklistName == "Need Category"){
          setPicklistData(res.data.needCategory);
          setTotalPages(res.data.pages);
        }else if (picklistName == "Need Sub-Category"){
          setPicklistData(res.data.needSubCategory);
          setTotalPages(res.data.pages);
        }else if (picklistName == "Status"){
          setPicklistData(res.data.status);
          setTotalPages(res.data.pages);
        }else if (picklistName == "Carrier Route"){
          setPicklistData(res.data.carrierRoutes);
          setTotalPages(res.data.pages);
        }else if (picklistName == "DM State"){
          setPicklistData(res.data.DMstates);
          setTotalPages(res.data.pages);
        }else if (picklistName == "Product List"){
          setPicklistData(res.data.products);
          setTotalPages(res.data.pages);
        }else if (picklistName == "Service List"){
          setPicklistData(res.data.services);
          setTotalPages(res.data.pages);
        }
        else if (picklistName == "Department"){
          setPicklistData(res.data.departments);
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
    if (picklistName == "User Type") {
      url = `${apiPath.prodPath}/api/picklist/usertypes/getallusertypes?page=${page}&limit=8`;
    }
    if (picklistName == "Zip Code") {
      url = `${apiPath.prodPath}/api/picklist/zipcodes/getallzipcodes?page=${page}&limit=8`;
    }
    if (picklistName == "Territory") {
      url = `${apiPath.prodPath}/api/picklist/territory/getallterritory?page=${page}&limit=8`;
    }
    if (picklistName == "Managers") {
      url = `${apiPath.prodPath}/api/picklist/managers/getAllManagers?page=${page}&limit=8`;
    }
    if (picklistName == "File Category") {
      url = `${apiPath.prodPath}/api/picklist/fileCategory/getAllFileCategory?page=${page}&limit=8`;
    }
    if (picklistName == "Task Category") {
      url = `${apiPath.prodPath}/api/picklist/taskCategory/getAllTaskCategory?page=${page}&limit=8`;
    }
    if (picklistName == "Notes Category") {
      url = `${apiPath.prodPath}/api/picklist/noteCategory/getAllNoteCategory?page=${page}&limit=8`;
    }
    if (picklistName == "Interaction Category") {
      url = `${apiPath.prodPath}/api/picklist/interactionType/getAllInteractionCategory?page=${page}&limit=8`;
    }
    if (picklistName == "Client Status") {
      url = `${apiPath.prodPath}/api/picklist/clientStatus/getAllClientStatus?page=${page}&limit=8`;
    }
    if (picklistName == "Task Status") {
      url = `${apiPath.prodPath}/api/picklist/taskStatus/getAllTaskStatus?page=${page}&limit=8`;
    }
    if (picklistName == "Task Priority") {
      url = `${apiPath.prodPath}/api/picklist/taskPriority/getAllTaskPriority?page=${page}&limit=8`;
    }
    if (picklistName == "Need Category") {
      url = `${apiPath.prodPath}/api/picklist/needCategory/getAllNeedCategory?page=${page}&limit=8`;
    }
    if (picklistName == "Need Sub-Category") {
      url = `${apiPath.prodPath}/api/picklist/needSubCategory/getAllNeedSubCategory?page=${page}&limit=8`;
    }
    if (picklistName == "Status") {
      url = `${apiPath.prodPath}/api/picklist/status/getAllStatus?page=${page}&limit=8`;
    }
    if(picklistName == "Carrier Route"){
      url = `${apiPath.prodPath}/api/picklist/carrierRoute/getAllCarrierRoute?page=${page}&limit=8`;
    }
       if(picklistName == "DM State"){
      url = `${apiPath.prodPath}/api/picklist/DMstate/getAllDMstate?page=${page}&limit=8`;
    }
    if (picklistName == "Product List"){
      url = `${apiPath.prodPath}/api/picklist/productList/getAllProduct?page=${page}&limit=8`;
    }
    if (picklistName == "Service List"){
      url = `${apiPath.prodPath}/api/picklist/serviceList/getAllService?page=${page}&limit=8`;
    }
    if (picklistName == "Department"){
      url = `${apiPath.prodPath}/api/picklist/departments/getAllDepartments?page=${page}&limit=8`;
    }
    await axios
      .get(url)
      .then((res) => {
        if(picklistName == "Interaction Category"){
          setPicklistData(res.data.interactionCategory);
          setLoader(false);
        }else if (picklistName == "Notes Category"){
          setPicklistData(res.data.noteCategory);
          setLoader(false);
        }else if (picklistName == "Task Category"){
          setPicklistData(res.data.taskCategory);
          setLoader(false);
        }else if (picklistName == "File Category"){
          setPicklistData(res.data.fileCategory);
          setLoader(false);
        }else if(picklistName == "Zip Code"){
          setPicklistData(res.data.zipCodes);
          setLoader(false);
        }else if (picklistName == "User Type"){
          setPicklistData(res.data.userTypes);
          setLoader(false);
        }else if (picklistName == "Territory"){
          setPicklistData(res.data.territories);
          setLoader(false);
        }else if (picklistName == "Managers"){
          setPicklistData(res.data.managers);
          setLoader(false);
        }else if (picklistName == "Client Status"){
          setPicklistData(res.data.clientStatus);
          setLoader(false);
        }else if (picklistName == "Task Status"){
          setPicklistData(res.data.taskStatus);
          setLoader(false);
        }else if (picklistName == "Task Priority"){
          setPicklistData(res.data.taskPriority);
          setLoader(false);
        }else if (picklistName == "Need Category"){
          setPicklistData(res.data.needCategory);
          setLoader(false);
        }else if (picklistName == "Need Sub-Category"){
          setPicklistData(res.data.needSubCategory);
          setLoader(false);
        }else if (picklistName == "Status"){
          setPicklistData(res.data.status);
          setLoader(false);
        }else if (picklistName == "Carrier Route"){
          setPicklistData(res.data.carrierRoutes);
          setLoader(false);
        }else if (picklistName == "DM State"){
          setPicklistData(res.data.DMstates);
          setLoader(false);
        }else if (picklistName == "Product List"){
          setPicklistData(res.data.products);
          setLoader(false);
        }else if (picklistName == "Service List"){
          setPicklistData(res.data.services);
          setLoader(false);
        }else if (picklistName == "Department"){
          setPicklistData(res.data.departments);
          setLoader(false);
        }else{
          setPicklistData(res.data);
          setLoader(false);
        }
        
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
    if (picklistName == "Zip Code") {
      url = `${apiPath.prodPath}/api/picklist/zipcodes/addzipcode`;
    }
    if (picklistName == "User Type") {
      url = `${apiPath.prodPath}/api/picklist/userTypes/addusertype`;
    }
    if (picklistName == "Territory") {
      url = `${apiPath.prodPath}/api/picklist/territory/addterritory`;
    }
    if (picklistName == "Managers") {
      url = `${apiPath.prodPath}/api/picklist/managers/addManager`;
    }
    if (picklistName == "File Category") {
      url = `${apiPath.prodPath}/api/picklist/fileCategory/addFileCategory`;
    }
    if (picklistName == "Task Category") {
      url = `${apiPath.prodPath}/api/picklist/taskCategory/addTaskCategory`;
    }
    if (picklistName == "Notes Category") {
      url = `${apiPath.prodPath}/api/picklist/noteCategory/addNoteCategory`;
    }
    if (picklistName == "Interaction Category") {
      url = `${apiPath.prodPath}/api/picklist/interactionType/addInteractionCategory`;
    }
    if (picklistName == "Client Status") {
      url = `${apiPath.prodPath}/api/picklist/clientStatus/addClientStatus`;
    }
    if (picklistName == "Task Status") {
      url = `${apiPath.prodPath}/api/picklist/taskStatus/addTaskStatus`;
    }
    if (picklistName == "Task Priority") {
      url = `${apiPath.prodPath}/api/picklist/taskPriority/addTaskPriority`;
    }
    if (picklistName == "Need Category") {
      url = `${apiPath.prodPath}/api/picklist/needCategory/addNeedCategory`;
    }
    if (picklistName == "Need Sub-Category") {
      url = `${apiPath.prodPath}/api/picklist/needSubCategory/addNeedSubCategory`;
    }
    if (picklistName == "Status") {
      url = `${apiPath.prodPath}/api/picklist/status/addStatus`;
    }
     if(picklistName == "Carrier Route"){
      url = `${apiPath.prodPath}/api/picklist/carrierRoute/addCarrierRoute`;
    }
       if(picklistName == "DM State"){
      url = `${apiPath.prodPath}/api/picklist/DMstate/addDMstate`;
    }
    if (picklistName == "Product List"){
      url = `${apiPath.prodPath}/api/picklist/productList/addProduct`;
    }
    if (picklistName == "Service List"){
      url = `${apiPath.prodPath}/api/picklist/serviceList/addService`;
    }
    if (picklistName == "Department"){
      url = `${apiPath.prodPath}/api/picklist/departments/addDepartment`;
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

  const handleClearSearch = () => {
    setSearchTerm("");
    setFilterBy("");
    setLoader(true);
    fetchData(currentPage);
  };


  return (
    <main className={`${poppins.className} flex flex-col`}>
      <div className="flex w-full flex-row flex-wrap justify-between">
        <div className="w-full flex flex-row gap-2 mb-[24px] h-[34px]">
          <h1 className="font-satoshi font-semibold text-2xl ml-[20px]">{picklistName === "Need Category" ? "Client Category" : picklistName === "Need Sub-Category" ? "Client Sub-Category" : picklistName}</h1>
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
           <Button
              onClick={handleClearSearch}
              variant="outline"
              className="bg-[#B797FF] w-[162.2px] h-[42] rounded-[8px] font-satoshi"
            >
              <ClearAll />Clear Search
            </Button>
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
        
        
        {/* <div className="w-full">
          <SearchForm handleSearch={handleTest} />
        </div> */}
      </div>

      <div className="mt-8">
        {loader ? (
          <SkeletonCard />
        ) : (
          <PicklistTable
            picklistData={picklistData}
            picklistName={picklistName}
            refreshData={refreshData}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
      <AddPicklist
        picklistName={picklistName}
        open={userTypeModal}
        handleClose={() => setUserTypeModal(false)}
        addEmp={(data) => addPicklist(data)}
      />
    </main>
  );
}

export default PicklistComp;
