import Drawer from "@mui/material/Drawer";
import "./style.scss";
import React, { use, useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import { apiPath } from "@/utils/routes";
import CloseIcon from "@mui/icons-material/Close";
import debounce from "lodash.debounce";
import Swal from "sweetalert2";
import moment from "moment";

function AddPurchaseSalelist({
  open,
  handleClose,
  addEmp,
  picklistName,
  edit,
  editData,
  editPicklist,
}) {
  const [cost, setCost] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [purchaseCategory, setPurchaseCategory] = useState("");
  const [purchaseCategoryOpt, setPurchaseCategoryOpt] = useState([]);
  const [purchaseName , setPurchaseName] = useState("");
  const [purchaseNameOpt, setPurchaseNameOpt] = useState([]);
  const [purchaseTools, setPurchaseTools] = useState("");
  const [purchaseToolsOpt, setPurchaseToolsOpt] = useState([]);
  const [purchaseDescription, setPurchaseDescription] = useState("");
  const [inputPurchaseCategoryValue, setInputPurchaseCategoryValue] = useState("");
  const [inputPurchaseNameValue, setInputPurchaseNameValue] = useState("");
  const [inputPurchaseToolsValue, setInputPurchaseToolsValue] = useState("");
  const [purchaseNameLoader, setPurchaseNameLoader] = useState(false);
  const [loader, setLoader] = useState(false);
  const [purchaseNameProductData, setPurchaseNameProductData] = useState([]);
  const [purchaseNameServiceData, setPurchaseNameServiceData] = useState([]);
  const [purchaseIcon, setPurchaseIcon] = useState("");

  function purchaseCategoryOptions () {
    const stats = ['Product', 'Service' ];
    const options = stats.map((item)=>{
      const statusOption = {
        label : item,
        value : item,
      }
      return statusOption;
    });
    setPurchaseCategoryOpt(options);
    
  }

  const loadPurchaseNameProductData = () => {
    setPurchaseNameLoader(true);
    try {
       axios.get(
        `${apiPath.prodPath}/api/picklist/productList/getAllProduct`,
      ).then((res) => {
        console.log(res.data.products);
        const sortedData = res.data.products.map((i) => ({
          label: i.productName,
          value: i.productName,
          tools: i.tools,
        }));
        setPurchaseNameProductData(sortedData);
      });
      
    } catch (err) {
      console.log(err);
    } finally {
      setPurchaseNameLoader(false);
    }
  };

  const loadPurchaseNameServiceData = () => {
    setPurchaseNameLoader(true);
    try {
      axios.get(
        `${apiPath.prodPath}/api/picklist/serviceList/getAllService`,
      ).then((res) => {
        console.log(res.data.services);
        const sortedData = res.data.services.map((i) => ({
          label: i.serviceName,
          value: i.serviceName,
          tools: i.tools,
        }));
        setPurchaseNameServiceData(sortedData);
      });
    } catch (err) {
      console.log(err);
    } finally {
      setPurchaseNameLoader(false);
    }
  };
  

  useEffect (()=>{
    refresher();
    purchaseCategoryOptions();
    loadPurchaseNameProductData();
    loadPurchaseNameServiceData();
    if (edit) {if(picklistName === "Products & Services"){
      setPurchaseCategory( {label: editData.purchaseCategory, value: editData.purchaseCategory});
      setPurchaseName( {label: editData.purchaseName, value: editData.purchaseName});
      setPurchaseTools( {label: editData.purchaseTools, value: editData.purchaseTools});
      setPurchaseDescription(editData.purchaseDescription);
      setCost(editData.cost);
      setSellingPrice(editData.sellingPrice);
    }

    }
  }, [open, loader]);

  

  const handleAddEmp = (e) => {
    e.preventDefault();
    let formData = {};
    
    if (picklistName === "Products & Services") {
      formData = {
        cost,
        sellingPrice,
        purchaseCategory : purchaseCategory.value,
        purchaseName : purchaseName.value,
        purchaseTools : purchaseTools.value,
        purchaseDescription,
      };
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
    setLoader(true);
   setCost("");
   setSellingPrice("");
    setPurchaseCategory("");
    setPurchaseName("");
    setPurchaseTools("");
    setPurchaseDescription("");
    setPurchaseCategoryOpt([]);
    setPurchaseNameOpt([]);
    setPurchaseToolsOpt([]);
    setLoader(false);
  };

  

  // const handleInputCarrierRoute = (newInputValue) => {
  //   setInputCarrierRouteValue(newInputValue);
  // }

  

  const handleInputPurchaseCategory = async (newInputValue) => {
    setInputPurchaseCategoryValue(newInputValue);
  };

  const handlePurchaseCategoryChange = (selectedOption) => {
    setPurchaseCategory(selectedOption);
    if(selectedOption?.value === "Product") {
      setPurchaseNameOpt(purchaseNameProductData);
    } else if(selectedOption?.value === "Service") {
      setPurchaseNameOpt(purchaseNameServiceData);
    }else {
      setPurchaseNameOpt([]);
    }
    setPurchaseIcon(selectedOption?.value);
  }

  const handleInputPurchaseName = (newInputValue) => {
    setInputPurchaseNameValue(newInputValue);
  };

  const handlePurchaseNameChange = (selectedOptions) => {
    setPurchaseName(selectedOptions);
    const sortedTools = selectedOptions.tools.map((tool) => ({
      label: tool,
      value: tool,
    }));
    setPurchaseToolsOpt(sortedTools);
  };
  

  const handleInputPurchaseTools = (newInputValue) => {
    setInputPurchaseToolsValue(newInputValue);
  };

  const handlePurchaseToolsChange = (selectedOptions) => {
    setPurchaseTools(selectedOptions);
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
1
  return (
         <Drawer
                className="bg-client-modals"
                anchor="left" 
                open={open}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    width: "1142px",  
                    height: "800px", 
                    position: "absolute",
                    left: "15%",
                    top: "1%",
                    transform: "translate(-50%, -50%)",
                    borderRadius: "16px", 
                    boxShadow: 3, 
                  },
                }}
                >
      <div className="p-10 flex flex-col bg-[#2D245B] flex-wrap">
        <div className="flex flex-row justify-end">
          <CloseIcon
            className="text-2xl hover:cursor-pointer"
            onClick={handleClose}
          />
        </div>
        <h1 className="text-white font-satoshi text-2xl font-bold mb-5">
          Add {picklistName}
        </h1>
        {picklistName === "Products & Services" ? (
          <form
            onSubmit={handleAddEmp}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2"
          >
          <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
          <div div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Category</label>
              <Select
                  options={purchaseCategoryOpt}
                  value={purchaseCategory}
                  inputValue={inputPurchaseCategoryValue}
                  onInputChange={handleInputPurchaseCategory}
                  onChange={handlePurchaseCategoryChange}
                  placeholder="Select Preferred"
                  styles={customStyles}
                  name="preferred contact"
                  id="role-select-cus"
                />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">{purchaseIcon === "" ? "Sub Category" : purchaseIcon}</label>
              <Select
                  options={purchaseNameOpt}
                  value={purchaseName}
                  inputValue={inputPurchaseNameValue}
                  onInputChange={handleInputPurchaseName}
                  onChange={handlePurchaseNameChange}
                  placeholder="Select Preferred"
                  styles={customStyles}
                  name="preferred contact"
                  id="role-select-cus"
                />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Tools</label>
              <Select
                  options={purchaseToolsOpt}
                  value={purchaseTools}
                  inputValue={inputPurchaseToolsValue}
                  onInputChange={handleInputPurchaseTools}
                  onChange={handlePurchaseToolsChange}
                  placeholder="Select Preferred"
                  styles={customStyles}
                  name="preferred contact"
                  id="role-select-cus"
                />
            </div>
          </div>
            
          <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
          <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Purchase Description</label>
              <input
                type="text"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={purchaseDescription}
                onChange={(e) => setPurchaseDescription(e.target.value)}
                placeholder="Enter Description"
                name="description"
                required={true}
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Cost $</label>
              <input
                type="number"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="Enter Cost"
                name="cost"
                required={true}
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Selling Price $</label>
                <input
                type="number"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="Enter Selling Price"
                name="selling price"
                required={true}
              />
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 w-full">
            <input
              type="submit"
              className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
              value={edit ? "Save" : `Add`}
            />
            </div>
          </form>
        ) : null }

      </div>
    </Drawer>
  );
}

export default AddPurchaseSalelist;

