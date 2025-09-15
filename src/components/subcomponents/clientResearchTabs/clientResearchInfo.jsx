import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import axios from "axios";
import { apiPath } from "@/utils/routes";
import { Button } from "@mui/material";
import { Edit2Icon, Trash, View } from "lucide-react";
import Swal from "sweetalert2";
import Select from "react-select";
import "./style.scss"
import Drawer from "@mui/material/Drawer";
import "./style.scss";
import Checkbox from "@mui/material/Checkbox";
import { FormControlLabel } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import debounce from "lodash.debounce";
import moment from "moment";
import ResearchInfoOpen from './clientResearchOpen/researchInfoOpen';

const ClientResearchInfo = ({item, open}) => {
  
  const [clientItem, setClientItem] = useState(item);
  const[loader, setLoader] = useState(false);
  const[openModal, setOpenModal] = useState(false);
  const[empId, setEmpId] = useState("");
  const[companyName, setCompanyName] = useState("");
  const[industry, setIndustry] = useState("");
  const [leadQualification, setLeadQualification] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [servicesOffered, setServicesOffered] = useState([]);
  const [numberOfEmployees, setNumberOfEmployees] = useState(0);
  const [annualRevenue, setAnnualRevenue] = useState(0);
  const [marketCapitalization, setMarketCapitalization] = useState(0);
  const [keyDecisionMakers, setKeyDecisionMakers] = useState([]);
  const [nameKdm, setNameKdm] = useState("");
  const [emailKdm, setEmailKdm] = useState("");
  const [phoneKdm, setPhoneKdm] = useState("");
  const [designationKdm, setDesignationKdm] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [state, setState] = useState("");
  const [zipCodeLoader, setZipCodeLoader] = useState(false);
  const [zipCodeOpt, setZipCodeOpt] = useState([]);
  const [zipCode, setZipCode] = useState("");
  const [websiteAddress, setWebsiteAddress] = useState("");
  const [cityOpt, setCityOpt] = useState([]);
  const [city, setCity] = useState("");
  const [inputValueCity, setInputValueCity] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [currentDM, setCurrentDM] = useState("");
  const [editClientTask, setEditClientTask] = useState(false);
  
  

   useEffect(()=>{
    
   }, [open, loader]);


  

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (editClientTask) {
      const formData = new FormData();
      formData.append("leadQualification", leadQualification);
      formData.append("websiteAddress", websiteAddress);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("address1", address1);
      formData.append("companyName", companyName);
      formData.append("currentDM", currentDM);
      formData.append("zipCode", zipCode);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("industry", industry);
      formData.append("servicesOffered", JSON.stringify(servicesOffered));
      formData.append("keyDecisionMakers", JSON.stringify(keyDecisionMakers));
      formData.append("marketCapitalization", marketCapitalization);
      formData.append("annualRevenue", annualRevenue);
      formData.append("numberOfEmployees", numberOfEmployees);


      
      
      await axios
        .patch(`${apiPath.prodPath}/api/clients/addResearchBasicInfo/${item._id}`, formData)
        .then((res) => {
          Swal.fire({
            icon: "success",
            text: "Client Basic Info Updated Successfully",
          });
          setCity("");
          setState("");
          setZipCode("");
          setWebsiteAddress("");
          setEmail("");
          setPhone("");
          setAddress1("");
          setCurrentDM("");
          setLeadQualification("");
          setEmailKdm("");
          setPhoneKdm("");
          setDesignationKdm("");
          setNameKdm("");
          setServiceName("");
          setServiceType("");
          setServicesOffered([]);
          setKeyDecisionMakers([]);
          setCompanyName("");
          setIndustry("");



        })
        .catch((err) => {
          console.log(err);
          Swal.fire({
            icon: "error",
            text: "Something went wrong with the editing Basic Info",
          });
          setEditClientTask(false);
        });

    }else{
      const formData = new FormData();
      
      formData.append("leadQualification", leadQualification);
      formData.append("websiteAddress", websiteAddress);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("address1", address1);
      formData.append("companyName", companyName);
      formData.append("currentDM", currentDM);
      formData.append("zipCode", zipCode.value);
      formData.append("city", city.value);
      formData.append("state", state);
      formData.append("industry", industry);
      formData.append("servicesOffered", JSON.stringify(servicesOffered));
      formData.append("keyDecisionMakers", JSON.stringify(keyDecisionMakers));
      formData.append("marketCapitalization", marketCapitalization);
      formData.append("annualRevenue", annualRevenue);
      formData.append("numberOfEmployees", numberOfEmployees);
      
      console.log(formData);

      await axios
        .patch(`${apiPath.prodPath}/api/clients/addResearchBasicInfo/${item._id}`, formData)
        .then((res) => {
          Swal.fire({
            icon: "success",
            text: "Client Basic Info added Successfully",
          });
          setCity("");
          setState("");
          setZipCode("");
          setWebsiteAddress("");
          setEmail("");
          setPhone("");
          setAddress1("");
          setCurrentDM("");
          setLeadQualification("");
          setEmailKdm("");
          setPhoneKdm("");
          setDesignationKdm("");
          setNameKdm("");
          setServiceName("");
          setServiceType("");
          setServicesOffered([]);
          setKeyDecisionMakers([]);
          setCompanyName("");
          setIndustry("");
          setEditClientTask(false);
        })
        .catch((err) => {
          console.log(err);
          Swal.fire({
            icon: "error",
            text: "Something went wrong with the adding Basic Info",
          });
        });
      
    }
   try {
      const res = await axios.get(
        `${apiPath.prodPath}/api/clients/client/${item._id}`
      );
      setClientItem(res.data);
    } catch (error) {
      console.error("Error fetching client data:", error);
    }
  setLoader(true);    
  };

  const handleDelete = async (id) => {

    Swal.fire({
                  icon: "warning",
                  text: `Are you sure you want to delete the note`,
                  showCancelButton: true,
                  cancelButtonText: "No",
                  showConfirmButton: true,
                  confirmButtonText: "Yes",
                }).then(async (result)=>{
                  if(result.isConfirmed){
                    await axios
                    .patch(`${apiPath.prodPath}/api/clients/deleteClientTask/${item._id}&&${id}`)
                    .then((res) => {
                      Swal.fire({
                        icon: "success",
                        text: "Client Task Deleted Successfully",
                      });
                    })
                    .catch((err) => {
                      console.log(err);
                      Swal.fire({
                        icon: "error",
                        text: "Something went wrong with the deleting task",
                      });
                    });
                  setLoader(true);
                  }
                })
  }
  
  const handleOpenModal = (item) => {
    setEmpId(item._id);
    setOpenModal(true);
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


  const getZipCodes = async (search = "") => {
    setZipCodeLoader(true); 
    try {
      const res = await axios.get(
        `${apiPath.prodPath}/api/picklist/zipcodes/getzipcodes`,
        {
          params: {
            search, 
            limit: 50,
          },
        }
      );
      const sortedData = res.data.zipCodes.map((i) => ({
        label: i.zipCode,
        value: i.zipCode,
        city: i.city,
        state: i.state,
      }));
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
   
  const handleInputCityChange = (newInputValue) => {
    setInputValueCity(newInputValue); 
  };

  const handleChangeCity = (v) => {
    setCity(v);
  }




  return (
        <>
      <form
            onSubmit={handleUpload}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2 mt-8 mb-8"
             >
            <p className='w-full'>Company Initials</p>
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">  
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Company Name</label>
                <input
                  type='text'
                  value={companyName}
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] h-[42px]"
                  onChange={(e) => setCompanyName(e.target.value)}
                  name="Company Name"
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Industry</label>
                <input
                  type="text"
                  value={industry}
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  onChange={(e)=> setIndustry(e.target.value)}
                  name="Industry"
                />
              </div>
            </div>

            <p className='w-full'>Services</p>
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Service Name</label>
                <input
                  type="text"
                  value={serviceName}
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  onChange={(e) => setServiceName(e.target.value)}
                  name="Service Name"
                />
              </div>
                <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Service Type</label>
                <input
                  type="text"
                  value={serviceType}
                  className="p-2  border-[#452C95] rounded-[8px]
                  focus-within:outline-none border-[1px] bg-[#191526]"
                  onChange={(e) => setServiceType(e.target.value)}
                  name="Service Type"
                />
              </div>
              <Button
                variant="outlined"
                className="bg-[#B797FF] w-[162.2px] h-[42] rounded-[8px] font-satoshi"
                onClick={() => {
                  setServicesOffered([...servicesOffered, { serviceName, serviceType }]);
                  setServiceName("");
                  setServiceType("");
                }}
              >
                Add Service
              </Button>
              <div className="flex flex-col gap-2 w-full">
                <label className="font-satoshi text-md">Services Offered</label>
                <div className="flex flex-wrap gap-2">
                  {servicesOffered.map((service, index) => (
                    <div key={index} className="bg-[#452C95] p-2 rounded-[8px]">
                      <span className="text-white">{service.serviceName} ({service.serviceType})</span>
                      <Button
                        variant="outlined"
                        className="ml-2 text-red-500"
                        onClick={() => {
                          const newServices = servicesOffered.filter((_, i) => i !== index);
                          setServicesOffered(newServices);
                        }}
                      >
                        <Trash />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className='w-full'>Company Size</p>
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              
                <div className="flex flex-col gap-2 w-1/2">
                  <label className="font-satoshi text-md">Number of Employees</label>
                  <input
                    type="number"
                    value={numberOfEmployees}
                    className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                    onChange={(e) => setNumberOfEmployees(e.target.value)}
                    name="Number of Employees"
                  />
                </div>
                <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Annual Revenue</label>
                <input
                  type='text'
                  value={annualRevenue}
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] h-[42px]"
                  onChange={(e) => setAnnualRevenue(e.target.value)}
                  name="Annual Revenue"
                  // maxLength={1000}
                />
              </div>
            </div>
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Market Capitalization</label>
                <input
                  type='text'
                  value={marketCapitalization}
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] h-[42px]"
                  onChange={(e) => setMarketCapitalization(e.target.value)}
                  name="Market Capitalization"
                  // maxLength={1000}
                />
              </div>
            </div>
            
            <p className='w-full'>Key Decision Makers</p>
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Name KDM</label>
                <input
                  type='text'
                  value={nameKdm}
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] h-[42px]"
                  onChange={(e) => setNameKdm(e.target.value)}
                  name="Name"
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Email KDM</label>
                <input
                  type='email'
                  value={emailKdm}
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] h-[42px]"
                  onChange={(e) => setEmailKdm(e.target.value)}
                  name="Email"
                />
                </div>
              
            </div>
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Phone KDM</label>
                <input
                  type='tel'
                  value={phoneKdm}
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] h-[42px]"
                  onChange={(e) => setPhoneKdm(e.target.value)}
                  name="Phone"
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Designation KDM</label>
                <input
                  type='text'
                  value={designationKdm}
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] h-[42px]"
                  onChange={(e) => setDesignationKdm(e.target.value)}
                  name="Designation"
                />
                </div>
            </div>

            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
              <Button
                variant="outlined"
                className="bg-[#B797FF] w-[162.2px] h-[42] rounded-[8px] font-satoshi"
                onClick={() => {
                  setKeyDecisionMakers([...keyDecisionMakers, { name : nameKdm, email: emailKdm, phone: phoneKdm, designation: designationKdm }]);
                  setNameKdm("");
                  setEmailKdm("");
                  setPhoneKdm("");
                  setDesignationKdm("");
                }}
              >
                Add Key Decision Maker
              </Button>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <label className="font-satoshi text-md">Key Decision Makers</label>
                <div className="flex flex-wrap gap-2">
                  {keyDecisionMakers.map((maker, index) => (
                    <div key={index} className="bg-[#452C95] p-2 rounded-[8px]">
                      <span className="text-white">{maker.name} ({maker.email}, {maker.phone}, {maker.designation})</span>
                      <Button
                        variant="outlined"
                        className="ml-2 text-red-500"
                        onClick={() => {
                          const newMakers = keyDecisionMakers.filter((_, i) => i !== index);
                          setKeyDecisionMakers(newMakers);
                        }}
                      >
                        <Trash />
                      </Button>
                    </div>
                  ))}
                </div>
                </div>
            </div>

            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            
              <div className="flex flex-col gap-2 w-1/2">
                  <label className="font-satoshi text-md">ZipCode</label>
                  {                  
                    <Select
                      options={zipCodeOpt}
                      value={zipCode}
                      onInputChange={handleInputChange}
                      inputValue={inputValue}
                      onChange={(v) => {
                        setZipCode(v);
                        setCityOpt(v.city.map((item)=> {
                          const sorts = {
                            label:item,
                            value:item
                          }
                          return sorts;
                        }));
                        setState(v.state);
                      }}
                      placeholder="Select ZipCode"
                      styles={customStyles}
                      id="role-select-cus"
                      name="zipCode"
                    />
                  }
                </div>
                
                <div className="flex flex-col gap-2 w-1/2">
                  <label className="font-satoshi text-md">City</label>
                  <Select
                      options={cityOpt}
                      value={city}
                      onInputChange={handleInputCityChange}
                      inputValue={inputValueCity}
                      onChange={handleChangeCity}
                      placeholder="Select City"
                      styles={customStyles}
                      id="role-select-cus"
                      name="City"
                    />
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
                  />
                </div>
                <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Address</label>
                <input
                  type="text"
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  placeholder="Enter Address"
                  name="address1"
                />
              </div>
            </div>
            
            <p className='w-full'>Company's Official Contact Info</p>
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Email</label>
                <input
                  type="email"
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email"
                  name="email"
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Phone</label>
                <input
                  type="text"
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter Phone"
                  name="phone"
                />
              </div>
            </div>

            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Website Address</label>
                <input
                  type="text"
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  value={websiteAddress}
                  onChange={(e) => setWebsiteAddress(e.target.value)}
                  placeholder="Enter Client Web address"
                  name="websiteAddress"
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Current DM Team/Company</label>
                <input
                  type="text"
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  value={currentDM}
                  onChange={(e) => setCurrentDM(e.target.value)}
                  placeholder="Enter Current DM Team/Company"
                  name="currentDM"
                />
              </div>
            </div>

            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Lead Qualification</label>
                <input
                  type="text"
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  value={leadQualification}
                  onChange={(e) => setLeadQualification(e.target.value)}
                  placeholder="Enter Lead Qualification"
                  name="leadQualification"
                />
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={editClientTask?`Edit`:`Save`}
              />
            
            </div>
          
      
          </form>
          {
            
      <Table className="bg-[#231C46] rounded-[12px] font-satoshi">
        <TableCaption>Research</TableCaption>
        <TableHeader>
          <TableRow className="w-fit, h-[58px] font-satoshi text-lg text-[#E1C9FF]">
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Company Name</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Industry</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Email</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Phone</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Web Address</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Address</TableHead>
            <TableHead className="text-[#E1C9FF]" >Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
           
             <TableRow className="w-fit, h-[72px] bg-[#2D245B] border-[1px] border-[#452C95]" key={clientItem._id}>
              <TableCell className="font-satoshi font-medium text-#fff">
                {clientItem.companyName}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {clientItem.industry}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {clientItem.email}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {clientItem.phone}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {clientItem.websiteAddress}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {clientItem.address1}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                <DropdownMenu className="">
                  <DropdownMenuTrigger>
                    <MoreVertIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="z-[9999]">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleOpenModal(clientItem)}>
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setCity(clientItem.city);
                      setState(clientItem.state);
                      setZipCode(clientItem.zipCode);
                      setWebsiteAddress(clientItem.websiteAddress);
                      setEmail(clientItem.email);
                      setPhone(clientItem.phone);
                      setAddress1(clientItem.address1);
                      setCurrentDM(clientItem.currentDM);
                      setLeadQualification(clientItem.leadQualification);
                      // setEmailKdm(clientItem.keyDecisionakers.email);
                      // setPhoneKdm(clientItem.keyDecisionMakers.phone);
                      // setDesignationKdm(clientItem.keyDecisionMakers.designation);
                      // setNameKdm(clientItem.keyDecisionMakers.name);
                      // setServiceName(clientItem.servicesOffered.serviceName);
                      // setServiceType(clientItem.servicesOffered.serviceType);
                      setServicesOffered(clientItem.servicesOffered);
                      setKeyDecisionMakers(clientItem.keyDecisionMakers);
                      setCompanyName(clientItem.companyName);
                      setIndustry(clientItem.industry);
                      setEditClientTask(true);
                      setEmpId(clientItem._id);
                      }}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(clientItem._id)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              {openModal && empId == clientItem._id ? (
                    <ResearchInfoOpen
                      open={openModal}
                      handleClose={() => setOpenModal(false)}
                      item={clientItem}
                    />
                  ) : null}
            </TableRow>
         
        </TableBody>
      </Table>
          }
    </>
  )
}

export default ClientResearchInfo;
