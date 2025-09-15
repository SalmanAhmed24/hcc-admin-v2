import Drawer from "@mui/material/Drawer";
import "./style.scss";
import React, { use, useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import { apiPath } from "@/utils/routes";
import CloseIcon from "@mui/icons-material/Close";
import debounce from "lodash.debounce";
import Swal from "sweetalert2";

function AddPicklist({
  open,
  handleClose,
  addEmp,
  picklistName,
  edit,
  editData,
  editPicklist,
}) {
  const [name, setName] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [city, setCity] = useState([]);
  const [state, setState] = useState("");
  const [territoryName, setTerritoryName] = useState("");
  const [territoryState, setTerritoryState] = useState([]);
  const [zipCodeLoader, setZipCodeLoader] = useState(false);
  const [zipCodeOpt, setZipCodeOpt] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [taskCategoryName, setTaskCategoryName] = useState("");
  const [noteCategoryName, setNoteCategoryName] = useState("");
  const [fileCategoryName, setFileCategoryName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [managerRole, setManagerRole] = useState("");
  const [managerTerritory, setManagerTerritory] = useState("");
  const [interactionCategoryName, setInteractionCategoryName] = useState("");
  const [clientStatus, setClientStatus] = useState("");
  const [taskStatus, setTaskStatus] = useState("");
  const [taskPriority, setTaskPriority] = useState("");
  const [statusName, setStatusName] = useState("");
  const [statusCode, setStatusCode] = useState("");
  const [needCategoryName, setNeedCategoryName] = useState("");
  const [needSubCategoryName, setNeedSubCategoryName] = useState([]);
  const [needCategoryCode, setNeedCategoryCode] = useState("");
  // const [needSubCategoryCode, setNeedSubCategoryCode] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [subCategoryCode, setSubCategoryCode] = useState("");
  const [inputValueNeedSub, setInputValueNeedSub] = useState("");
  const [needSubOpt, setNeedSubOpt] = useState([]);
  const [carrierRoute, setCarrierRoute] = useState("");
  const [routeDescription, setRouteDescription] = useState("");
  const [stateName, setStateName] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [productName, setProductName] = useState("");
  const [productTools, setProductTools] = useState([]);
  const [inputProductTools, setInputProductTools] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [serviceTools, setServiceTools] = useState([]);
  const [inputServiceTools, setInputServiceTools] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [departmentShortCode, setDepartmentShortCode] = useState("");
  const [departmentDescription, setDepartmentDescription] = useState("");


const getNeedSub = async (search = "") => {
  try {
    const data = await axios.get(
    `${apiPath.prodPath}/api/picklist/needSubCategory/getAllNeedSubCategory`,
    {
      params: {
        search, 
        limit: 50, 
      },
    }
  ).then((res)=>{
    return res.data.needSubCategory;
  }).catch((error)=>{
    console.log(error);
  });
  const sortedData = data.map((i) => ({
    label: i.subCategoryName + " " + i.subCategoryCode,
    value: i.subCategoryName,
    subCategoryName: i.subCategoryName,
    subCategoryCode: i.subCategoryCode,
  }));
  console.log(sortedData);
  setNeedSubOpt(sortedData);
} catch (err) {
  console.log(err);
}
}
  


 useEffect(() => {

  getNeedSub();

  if (edit) {
    if (picklistName === "Zip Code") {
      setZipCode(editData.zipCode);
      setCity(editData.city);
      setState(editData.state);
    } else if (picklistName === "User Type") {
      setName(editData.userTypeCategory);
      setShortCode(editData.userTypeFlag);
    } else if (picklistName === "Territory") {
      setTerritoryName(editData.territoryName);
      const territoryZips = editData.territoryState.map((item) => ({
        label: item,
        value: item,
      }));
      setTerritoryState(territoryZips);
    }else if (picklistName === "Task Category") {
      setTaskCategoryName(editData.categoryName);
    } else if (picklistName === "Notes Category") {
      setNoteCategoryName(editData.categoryName);
    } else if (picklistName === "File Category") {
      setFileCategoryName(editData.categoryName);
    } else if (picklistName === "Managers") {
      setManagerName(editData.managerName);
      setManagerRole(editData.managerRole);
      setManagerTerritory(editData.managerTerritory);
    } else if (picklistName === "Interaction Category") {
      setInteractionCategoryName(editData.categoryName);
    }else if (picklistName === "Client Status") {
      setClientStatus(editData.status);
    }else if (picklistName === "Task Status") {
      setTaskStatus(editData.status);
    }else if (picklistName === "Task Priority") {
      setTaskPriority(editData.priority);
    }else if (picklistName === "Need Category") {
      setNeedCategoryName(editData.categoryName);
      setNeedCategoryCode(editData.categoryCode);
      setNeedSubCategoryName(editData.subCategory.map((i) => ({
        label: i.subCategoryName + " " + i.subCategoryCode,
        value: i.subCategoryName,
        subCategoryName: i.subCategoryName,
        subCategoryCode: i.subCategoryCode,
      })));
      // setNeedSubCategoryCode(editData.subCategoryCode);
    }else if (picklistName === "Need Sub-Category") {
      setSubCategoryName(editData.subCategoryName);
      setSubCategoryCode(editData.subCategoryCode);
    }else if (picklistName === "Status") {
      setStatusName(editData.statusName);
      setStatusCode(editData.statusCode);
    }else if(picklistName === "Carrier Route"){
      setCarrierRoute(editData.carrierRoute);
      setRouteDescription(editData.routeDescription);
    }else if(picklistName === "DM State"){
      setStateName(editData.stateName);
      setStateCode(editData.stateCode);
    }else if(picklistName === "Product List"){
      setProductName(editData.productName);
      setProductTools(editData.tools);
    }else if(picklistName === "Service List"){
      setServiceName(editData.serviceName);
      setServiceTools(editData.tools);
    }else if (picklistName === "Department") {
      setDepartmentName(editData.departmentName);
      setDepartmentShortCode(editData.departmentShortCode);
      setDepartmentDescription(editData.departmentDescription);
    }
    else {
      console.log("No data found for this picklist name.");
    }
  }

 }, [edit, open]);


  const getZipCodes = async (search = "") => {
    setZipCodeLoader(true);
    try {
       const data = await axios.get(
        `${apiPath.prodPath}/api/picklist/zipcodes/getzipcodes`,
        {
          params: {
            search, 
            limit: 50, 
          },
        }
      ).then((res)=>{
        return res.data.zipCodes;
      }).catch((error)=>{
        console.log(error);
      });
      const sortedData = data.map((i) => ({
        label: i.zipCode,
        value: i.zipCode,
      }));
      console.log(sortedData);
      setZipCodeOpt(sortedData); 
    } catch (err) {
      console.log(err);
    } finally {
      setZipCodeLoader(false);
    }
  };
  const debouncedGetZipCodes = debounce((inputValue) => {
    if (inputValue) {
      getZipCodes(inputValue);
    } else {
      setZipCodeOpt([]);
    }
  }, 300);
  const handleInputChange = (newInputValue) => {
    setInputValue(newInputValue);
    debouncedGetZipCodes(newInputValue); 
  };

  const handleInputChangeNeedSub = (newInputValue) => {
    setInputValueNeedSub(newInputValue); 
  };

  const handleSelectionChangeNeedSub = (selectedOptions) => {
    console.log(selectedOptions);
    setNeedSubCategoryName(selectedOptions);
    // const selectedCodes = selectedOptions.map((option) => option.subCategoryCode);
    // setNeedSubCategoryCode(selectedCodes.join(","));
  };

  const handleAddEmp = (e) => {
    e.preventDefault();
    let formData = {};
    if (picklistName === "Zip Code") {
      formData = { zipCode, city, state };
    } else if (picklistName === "User Type") {
      formData = { userTypeCategory: name, userTypeFlag: shortCode };
    } else if (picklistName === "Territory") {
      const territoryZips = territoryState.map((item) => item.value);
      formData = { territoryName, territoryState: territoryZips };
    }else if (picklistName === "Task Category") {
      formData = { categoryName :taskCategoryName };
    } else if (picklistName === "Notes Category") {
      formData = { categoryName :noteCategoryName };
    } else if (picklistName === "File Category") {
      formData = { categoryName :fileCategoryName };
    } else if (picklistName === "Managers") {
      formData = { managerName, managerRole, managerTerritory };
    } else if (picklistName === "Interaction Category") {
      formData = { categoryName :interactionCategoryName };
    }else if (picklistName === "Client Status") {
      formData = { status :clientStatus };
    }else if (picklistName === "Task Status") {
      formData = { status :taskStatus };
    }else if (picklistName === "Task Priority") {
      formData = { priority :taskPriority };
    }else if (picklistName === "Need Category") {
      formData = { categoryName :needCategoryName, categoryCode: needCategoryCode, subCategory: needSubCategoryName};
    }else if (picklistName === "Need Sub-Category") {
      formData = { subCategoryName: subCategoryName, subCategoryCode: subCategoryCode };
    }else if (picklistName === "Status") {
      formData = { statusName: statusName, statusCode: statusCode };
    }else if (picklistName === "Carrier Route") {
      formData = { carrierRoute, routeDescription };
    }else if (picklistName === "DM State") {
      formData = { stateName, stateCode };
    }else if (picklistName === "Product List") {
      formData = { productName, tools: productTools };
    }else if (picklistName === "Service List") {
      formData = { serviceName, tools: serviceTools };
    }else if (picklistName === "Department") {
      formData = { departmentName, departmentShortCode, departmentDescription };
    }
    else {
      formData = { name, shortCode };
    }
    if (edit) {
      editPicklist(formData);
    } else {
      addEmp(formData);
    }
    refresher();
  };

  const refresher = () => {
    setName("");
    setShortCode("");
    setTerritoryName("");
    setTerritoryState([]);
    setFileCategoryName("");
    setInteractionCategoryName("");
    setTaskCategoryName("");
    setNoteCategoryName("")
    setManagerName("");
    setManagerRole("");
    setManagerTerritory("");
    setTaskStatus("");
    setClientStatus("");
    setTaskPriority("");
    setStatusName("");
    setStatusCode("");
    setNeedCategoryName("");
    setNeedSubCategoryName("");
    setNeedCategoryCode("");
    setSubCategoryName("");
    setSubCategoryCode("");
    setCarrierRoute("");
    setRouteDescription("");
    setStateName("");
    setStateCode("");
    setProductName("");
    setProductTools([]);
    setServiceName("");
    setServiceTools([]);
    setDepartmentDescription("");
    setDepartmentName("");
    setDepartmentShortCode("");
  };

  const handleSelectionChange = (selectedOptions) => {
    setTerritoryState(selectedOptions);
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#191526", 
      color: "white", 
      borderRadius: "12px",       
      padding: "5px",            
      borderColor: "#452C95",
      "&:hover": {
        borderColor: "darkviolet",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#191526",
      borderRadius: "12px",       
      padding: "5px", 
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "darkviolet" : "#191526", 
      color: "white",
      "&:hover": {
        backgroundColor: "darkviolet",
      },
      borderRadius: "12px",       
      padding: "5px",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "white", 
    }),
  };

  const handleAddCity = () => {
    if (cityInput.trim() !== "") {
      setCity([...city, cityInput.trim()]);
      setCityInput(""); // clear input after adding
    }
  };

  const handleAddProductTools = () => {
    if (inputProductTools.trim() !== "") {
      setProductTools([...productTools, inputProductTools.trim()]);
      setInputProductTools(""); // clear input after adding
    }
  };

  const handleAddServiceTools = () => {
    if (inputServiceTools.trim() !== "") {
      setServiceTools([...serviceTools, inputServiceTools.trim()]);
      setInputServiceTools(""); // clear input after adding
    }
  };

  const handleRemoveCity = (index) => {
    const newCity = [...city];
    newCity.splice(index, 1);
    setCity(newCity);
  };

  const handleRemoveProductTool = (index) => {
    const newProductTools = [...productTools];
    newProductTools.splice(index, 1);
    setProductTools(newProductTools);
  };

  const handleRemoveServiceTool = (index) => {
    const newServiceTools = [...serviceTools];
    newServiceTools.splice(index, 1);
    setServiceTools(newServiceTools);
  };

  return (
    <Drawer
            className="bg-client-modals"
            anchor="left" 
            open={open}
            onClose={handleClose}
            PaperProps={{
              sx: {
                width: "1142px",  
                height: "450px", 
                position: "absolute",
                left: "15%",
                top: "15%",
                transform: "translate(-50%, -50%)",
                borderRadius: "16px", 
                boxShadow: 3, 
              },
            }}
            >
      <div className="p-5 flex flex-col bg-[#2D245B] flex-wrap">
      <div className="flex flex-row justify-end">
            <CloseIcon
              className="text-2xl hover:cursor-pointer"
              onClick={() => handleClose()}
            />
          </div>
        <h1 className="text-white font-satoshi text-2xl font-bold mb-5">
          Add {picklistName}
        </h1>
        {picklistName === "Zip Code" ? (
          <form
            onSubmit={handleAddEmp}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2"
          >
          <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
           <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">ZipCode</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Enter ZipCode"
                required={true}
                name="zipCode"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">City</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] flex-1"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Enter City"
                />
                <button
                  type="button"
                  onClick={handleAddCity}
                  className="px-3 py-2 bg-[#7F56D9] text-white rounded-md hover:bg-orange-400"
                >
                  Add
                </button>
              </div>

              {/* Display added cities */}
              <div className="flex flex-wrap gap-2 mt-2">
                {city.map((city, index) => (
                  <div
                    key={index}
                    className="bg-[#7F56D9] text-white px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    {city}
                    <button
                      type="button"
                      onClick={() => handleRemoveCity(index)}
                      className="text-white hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">State</label>
                <input
                  type="text"
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Enter State"
                  name="state"
                  required={true}
                />
              </div>
          </div>

          <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={edit ? "Edit Zipcode" : `Add Zipcode`}
              />
            </div>
           
          </form>
        ) : picklistName === "Territory" ? (
          <form
            onSubmit={handleAddEmp}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2"
          >
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">Territory Name</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={territoryName}
                onChange={(e) => setTerritoryName(e.target.value)}
                placeholder="Enter Name"
                required={true}
                name="name"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">Territory Zipcodes</label>
              {zipCodeLoader ? (
                <p className="font-satoshi text-md">Loading...</p>
              ) : (
                <Select
                  options={zipCodeOpt}
                  isMulti
                  value={territoryState}
                  inputValue={inputValue}
                  onInputChange={handleInputChange}
                  onChange={handleSelectionChange}
                  styles={customStyles}
                  placeholder="Search Zipcodes"
                  name="territoryState"
                  id="role-select-cus"
                />
              )}
            </div>
            </div>

            <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={edit ? "Edit Territory" : `Add Territory`}
              />
            </div>
          </form>
        ) : picklistName === "User Type" ? (
          <form
            onSubmit={handleAddEmp}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2"
          >
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Name</label>
                <input
                  type="text"
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Name"
                  required={true}
                  name="name"
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Short Code</label>
                <input
                  type="text"
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value)}
                  placeholder="Enter ShortCode"
                  name="shortCode"
                />
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={edit ? "Edit UserType" : `Add UserType`}
              />
            </div>
          </form>
        ) :  picklistName === "Task Category" ? (
          <form
            onSubmit={handleAddEmp}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2"
          >
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">Task Category Name</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={taskCategoryName}
                onChange={(e) => setTaskCategoryName(e.target.value)}
                placeholder="Enter Name"
                required={true}
                name="name"
              />
            </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[190px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={edit ? "Edit Task Category" : `Add Task Category`}
              />
            </div>
          </form>
        ) : picklistName === "Notes Category" ? (
          <form
            onSubmit={handleAddEmp}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2"
          >
          <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Notes Category Name</label>
                <input
                  type="text"
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  value={noteCategoryName}
                  onChange={(e) => setNoteCategoryName(e.target.value)}
                  placeholder="Enter Name"
                  required={true}
                  name="name"
                />
              </div>
          </div>

            
            <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[190px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={edit ? "Edit Notes Category" : `Add Notes Category`}
              />
            </div>
          </form>
        ) : picklistName === "File Category" ? (
          <form
            onSubmit={handleAddEmp}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2"
          >
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">File Category Name</label>
                <input
                  type="text"
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  value={fileCategoryName}
                  onChange={(e) => setFileCategoryName(e.target.value)}
                  placeholder="Enter Name"
                  required={true}
                  name="name"
                />
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[190px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={edit ? "Edit File Category" : `Add File Category`}
              />
            </div>
          </form>
        ) : picklistName === "Managers" ? (
          <form
            onSubmit={handleAddEmp}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2"
          >
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">Manager Name</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="Enter Name"
                required={true}
                name="name"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">Manager Role</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={managerRole}
                onChange={(e) => setManagerRole(e.target.value)}
                placeholder="Enter Role"
                required={true}
                name="role"
              />
            </div>
            </div>
            
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">Manager Territory</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={managerTerritory}
                onChange={(e) => setManagerTerritory(e.target.value)}
                placeholder="Enter Territory"
                required={true}
                name="territory"
              />
            </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={edit ? "Edit Manager" : `Add Manager`}
              />
            </div>
          </form>
        ) : picklistName === "Interaction Category" ? (
          <form
            onSubmit={handleAddEmp}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2"
          >
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">Interaction Category Name</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={interactionCategoryName}
                onChange={(e) => setInteractionCategoryName(e.target.value)}
                placeholder="Enter Name"
                required={true}
                name="name"
              />
            </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[210px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={edit ? "Edit Interaction Category" : `Add Interaction Category`}
              />
            </div>
          </form> 
        ) : picklistName === "Client Status" ? (
          <form
            onSubmit={handleAddEmp}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2"
          >
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">Status Name</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={clientStatus}
                onChange={(e) => setClientStatus(e.target.value)}
                placeholder="Enter Name"
                required={true}
                name="name"
              />
            </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[210px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={edit ? "Edit Client Status" : `Add Client Status`}
              />
            </div>
          </form> 
        ) : picklistName === "Task Status" ? (
          <form
            onSubmit={handleAddEmp}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2"
          >
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">Status Name</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
                placeholder="Enter Name"
                required={true}
                name="name"
              />
            </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[210px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={edit ? "Edit Task Status" : `Add Task Status`}
              />
            </div>
          </form> 
        ) : picklistName === "Task Priority" ? (
          <form
            onSubmit={handleAddEmp}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2"
          >
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">Priority Name</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                placeholder="Enter Name"
                required={true}
                name="name"
              />
            </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[210px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={edit ? "Edit Task Priority" : `Add Task Priority`}
              />
            </div>
          </form> 
        ) : picklistName ==="Need Category" ? (
          <form
            onSubmit={handleAddEmp}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2"
          >
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">Client Category</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={needCategoryName}
                onChange={(e) => setNeedCategoryName(e.target.value)}
                placeholder="Enter Name"
                required={true}
                name="name"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">Category Code</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={needCategoryCode}
                onChange={(e) => setNeedCategoryCode(e.target.value)}
                placeholder="Enter Code"
                required={true}
                name="needCategoryCode"
              />
            </div>
            </div>
            
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Sub-Category</label>
                <Select
                  options={needSubOpt}
                  isMulti
                  value={needSubCategoryName}
                  inputValue={inputValueNeedSub}
                  onInputChange={handleInputChangeNeedSub}
                  onChange={handleSelectionChangeNeedSub}
                  styles={customStyles}
                  placeholder="Search Sub-Category"
                  name="needSubCategory"
                  id="role-select-cus"
                />
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={edit ? "Save" : `Add Category`}
              />
            </div>

          </form>
        ) : picklistName === "Need Sub-Category" ? (
          
          <form
            onSubmit={handleAddEmp}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2"
          >
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">Client Sub-Category</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={subCategoryName}
                onChange={(e) => setSubCategoryName(e.target.value)}
                placeholder="Enter Sub-Category"
                required={true}
                name="subCategory"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">Client Sub-Category Code</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={subCategoryCode}
                onChange={(e) => setSubCategoryCode(e.target.value)}
                placeholder="Enter Sub-Category Code"
                required={true}
                name="subCategoryCode"
              />
            </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={edit ? "Save" : `Add Sub-Category`}
              />
            </div>
          </form>
        ) : picklistName === "Status" ? (
          <form
            onSubmit={handleAddEmp}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2"
          >
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">Status Name</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={statusName}
                onChange={(e) => setStatusName(e.target.value)}
                placeholder="Enter Name"
                required={true}
                name="name"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">Status Code</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={statusCode}
                onChange={(e) => setStatusCode(e.target.value)}
                placeholder="Enter Code"
                required={true}
                name="statusCode"
              />
            </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={edit ? "Save" : `Add Status`}
              />
            </div>
          </form>
        ) : picklistName === "Carrier Route" ? (
          <form
            onSubmit={handleAddEmp}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2"
          >
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Carrier Route</label>
                <input
                  type="text"
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  value={carrierRoute}
                  onChange={(e) => setCarrierRoute(e.target.value)}
                  placeholder="Enter Carrier Route"
                  required={true}
                  name="carrierRoute"
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Route Description</label>
                <input
                  type="text"
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  value={routeDescription}
                  onChange={(e) => setRouteDescription(e.target.value)}
                  placeholder="Enter Route Description"
                  name="routeDescription"
                />
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={edit ? "Edit Carrier Route" : `Add Carrier Route`}
              />
            </div>
          </form>
        ) : picklistName === "DM State" ? (
          <form
            onSubmit={handleAddEmp}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2"
          >
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">State Name</label>
                <input
                  type="text"
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="Enter State Name"
                  required={true}
                  name="stateName"
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">State Code</label>
                <input
                  type="text"
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  placeholder="Enter State Code"
                  name="stateCode"
                />
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={edit ? "Edit DM State" : `Add DM State`}
              />
            </div>
          </form>
        ) : picklistName === "Product List" ? (
          <form
            onSubmit={handleAddEmp}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2"
          >
          <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
           <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">Product Name</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter Product Name"
                required={true}
                name="productName"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">Tools</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] flex-1"
                  value={inputProductTools}
                  onChange={(e) => setInputProductTools(e.target.value)}
                  placeholder="Enter Tools"
                />
                <button
                  type="button"
                  onClick={handleAddProductTools}
                  className="px-3 py-2 bg-[#7F56D9] text-white rounded-md hover:bg-orange-400"
                >
                  Add
                </button>
              </div>

              {/* Display added cities */}
              <div className="flex flex-wrap gap-2 mt-2">
                {productTools.map((tool, index) => (
                  <div
                    key={index}
                    className="bg-[#7F56D9] text-white px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    {tool}
                    <button
                      type="button"
                      onClick={() => handleRemoveProductTool(index)}
                      className="text-white hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={edit ? "Edit Product" : `Add Product`}
              />
            </div>
           
          </form>) : picklistName === "Service List" ? (
          <form
            onSubmit={handleAddEmp}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2"
          >
          <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
           <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">Service Name</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="Enter Service Name"
                required={true}
                name="serviceName"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">Tools</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] flex-1"
                  value={inputServiceTools}
                  onChange={(e) => setInputServiceTools(e.target.value)}
                  placeholder="Enter Tools"
                />
                <button
                  type="button"
                  onClick={handleAddServiceTools}
                  className="px-3 py-2 bg-[#7F56D9] text-white rounded-md hover:bg-orange-400"
                >
                  Add
                </button>
              </div>

              {/* Display added cities */}
              <div className="flex flex-wrap gap-2 mt-2">
                {serviceTools.map((tool, index) => (
                  <div
                    key={index}
                    className="bg-[#7F56D9] text-white px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    {tool}
                    <button
                      type="button"
                      onClick={() => handleRemoveServiceTool(index)}
                      className="text-white hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={edit ? "Edit Product" : `Add Product`}
              />
            </div>
           
          </form>) : picklistName === "Department" ? (
          <form
            onSubmit={handleAddEmp}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2"
          >
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">Department Name</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                placeholder="Enter Name"
                required={true}
                name="name"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">Department ShortCode</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={departmentShortCode}
                onChange={(e) => setDepartmentShortCode(e.target.value)}
                placeholder="Enter ShortCode"
                required={true}
                name="ShortCode"
              />
            </div>
            </div>
            
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/2">
              <label className="font-satoshi text-md">Department Description</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={departmentDescription}
                onChange={(e) => setDepartmentDescription(e.target.value)}
                placeholder="Enter Description"
                required={true}
                name="Description"
              />
            </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={edit ? "Edit Department" : `Add Department`}
              />
            </div>
          </form>
        ): null}
        
      </div>
    </Drawer>
  );
}




export default AddPicklist;

