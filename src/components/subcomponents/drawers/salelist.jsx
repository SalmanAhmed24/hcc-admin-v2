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

function AddSalelist({
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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [prefCon, setPrefCon] = useState([]);
  const [service, setService] = useState([]);
  const [inputServiceValue, setInputServiceValue] = useState();
  const [inputPrefConValue, setInputPrefConValue] = useState();

  const [website, setWebsite] = useState("");
  const [budget, setBudget]= useState("");
  const [estDate, setEstDate]=useState("");
  const [message, setMessage] = useState("");
  const [preferredContactOpt, setPreferredContactOpt] = useState([]);
  const [servicesOpt, setServicesOpt] = useState([]);
  const [loader, setLoader] = useState(false);
  const [serviceSelected, setServiceSelected] = useState([]);

  const [conFirstName, setConFirstName] = useState("");
  const [conLastName, setConLastName] = useState("");
  const [conEmail, setConEmail] = useState("");
  const [conPhone, setConPhone] = useState("");
  const [conCompanyName, setConCompanyName] = useState("");
  const [conMessage, setConMessage] = useState("");
  const [conService, setConService] = useState([]);
  const [inputConServiceValue, setInputConServiceValue] = useState();
  const [conServiceSelected, setConServiceSelected] = useState([]);
  const [conServiceOpt, setConServiceOpt] = useState([]);
  const [carrierRoute, setCarrierRoute] = useState("");
  const [carrierRouteOpt, setCarrierRouteOpt] = useState([]);
  const [DMstate, setDMstate] = useState("");
  const [DMstateOpt, setDMstateOpt] = useState([]);
  const [residential, setResidential] = useState("");
  const [business, setBusiness] = useState("");
  const [total, setTotal] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [size, setSize] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [zipCodeOpt, setZipCodeOpt] = useState([]);
  const [cityOpt, setCityOpt] = useState([]);
  const [city, setCity] = useState("");
  const [inputValueCity, setInputValueCity] = useState("");
  const [income, setIncome] = useState("");
  const [cost, setCost] = useState("");
  const [zipCodeLoader, setZipCodeLoader] = useState(false);
  const [DMstateLoader, setDMstateLoader] = useState(false);
  const [carrierRouteLoader, setCarrierRouteLoader] = useState(false);
  const [inputCarrierRouteValue, setInputCarrierRouteValue] = useState("");
  const [inputDmStateValue, setInputDmStateValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [secondPhone, setSecondPhone] = useState("");
  const [secondEmail, setSecondEmail] = useState("");

  
  useEffect (()=>{
    servicesOptions();
    preferredContactOptions();
    getZipCodes();
    DMstateOptions();
    carrierRoutesOptions();
    refresher();
    if (edit) {if (picklistName === "Web Requests") {
      setFirstName(editData.firstName);
      setLastName(editData.lastName);
      setEmail(editData.email);
      setPhone(editData.phone);
      setCompanyName(editData.companyName);
      setWebsite(editData.website);
      setBudget(editData.budget);
      setEstDate(moment(editData.estDate).format('YYYY-MM-DD'));
      setMessage(editData.message);
      setPrefCon(editData.preferredContact.map((item)=>{
        return { label: item, value: item };
      }));
      setService(editData.services.map((item)=>{
        return { label: item, value: item };
      }));
      setSecondPhone(editData.secondPhone);
      setSecondEmail(editData.secondEmail);
    }else if(picklistName === "Contact Leads"){
      setConFirstName(editData.firstName);
      setConLastName(editData.lastName);
      setConEmail(editData.email);
      setConPhone(editData.phone);
      setConCompanyName(editData.companyName);
      setConMessage(editData.message);
      setService(editData.services.map((item)=>{
        return { label: item, value: item };
      }));
    }else if(picklistName === "Direct Mail") {
      setCarrierRoute({label : editData.carrierRoute, value : editData.carrierRoute});
      setDMstate({label : editData.DMstate, value : editData.DMstate});
      setResidential(editData.residential);
      setBusiness(editData.business);
      setTotal(editData.total);
      setAgeRange(editData.ageRange);
      setSize(editData.size);
      setZipCode({label : editData.zipCode, value : editData.zipCode});
      setCity({label : editData.city, value : editData.city});
      setIncome(editData.income);
      setCost(editData.cost);
    } 

    }
  }, [open, loader])

  function servicesOptions () {
    const stats = ['Design', 'Development', 'Social Media', 'SEO', 'Marketing', 'Admin','Business Consulting', 'iOS/Andriod', 'Website' ];
    const options = stats.map((item)=>{
      const statusOption = {
        label : item,
        value : item,
      }
      return statusOption;
    });
    setServicesOpt(options);
  }

  function preferredContactOptions () {
    const stats = ['Email', 'Phone', 'Skype', 'Zoom Meeting'];
    const options = stats.map((item)=>{
      const statusOption = {
        label : item,
        value : item,
      }
      return statusOption;
    });
    setPreferredContactOpt(options);
  }

  async function DMstateOptions (search = ""){
    setDMstateLoader(true);
     try {
      const res = await axios.get(
        `${apiPath.prodPath}/api/picklist/DMstate/getAllDMstate`,
      );
      const sortedData = res.data.DMstates.map((i) => ({
        label: i.stateName,
        value: i.stateName,
        stateCode : i.stateCode,
      }));
      setDMstateOpt(sortedData);
    } catch (err) {
      console.log(err);
    } finally {
      setDMstateLoader(false);
    }
  }

    async function getZipCodes (search = ""){
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

  async function carrierRoutesOptions (search = "") {
    setCarrierRouteLoader(true);
    try {
      const res = await axios.get(
        `${apiPath.prodPath}/api/picklist/carrierRoute/getAllCarrierRouteSearch`,
        {
          params: {
            search, 
            limit: 50, 
          },
        }
      );
      const sortedData = res.data.carrierRoutes.map((i) => ({
        label: i.carrierRoute,
        value: i.carrierRoute,
        routeDescription: i.routeDescription,
      }));
      setCarrierRouteOpt(sortedData);
    } catch (err) {
      console.log(err);
    } finally {
      setCarrierRouteLoader(false);
    }
  }

  const handleAddEmp = (e) => {
    e.preventDefault();
    let formData = {};
    const services = service.map((item)=>{
      return item.value;
    });
    const preferredContact  = prefCon.map((item)=>{
      return item.value;
    });
    
    if (picklistName === "Web Requests") {
      formData = {
        firstName,
        lastName,
        email,
        phone,
        companyName,
        preferredContact,
        services,
        website,
        budget,
        estDate,
        message,
        secondPhone,
        secondEmail,
      };
    }else if(picklistName === "Contact Leads"){
      
      formData = {
        firstName: conFirstName,
        lastName: conLastName,
        email: conEmail,
        phone: conPhone,
        companyName: conCompanyName,
        services: services,
        message: conMessage,
      };
    }else if (picklistName === "Direct Mail") {
      formData = {
        carrierRoute: carrierRoute.value,
        DMstate : DMstate.value,
        residential,
        business,
        total,
        ageRange,
        size,
        zipCode : zipCode.value,
        city : city.value,
        income,
        cost
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
    setName("");
    setShortCode("");
    setPhone("");
    setBudget("");
    setCompanyName("");
    setEstDate("");
    setFirstName("");
    setLastName("");
    setMessage("");
    setPrefCon([]);
    setService([]);
    setWebsite("");
    setEmail("");
    setConFirstName("");
    setConLastName("");
    setConEmail("");
    setConPhone("");
    setConCompanyName("");
    setConMessage("");
    setConService([]);
    setAgeRange("");
    setCity("");
    setZipCode("");
    setBusiness("");
    setResidential("");
    setIncome("");
    setCost("");
    setSize("");
    setDMstate("");
    setCarrierRoute("");
    setTotal("");
    setSecondPhone("");
    setSecondEmail("");
  };

  const handleInputService = (newInputValue) => {
    setInputServiceValue(newInputValue); 
  };

  // const handleInputCarrierRoute = (newInputValue) => {
  //   setInputCarrierRouteValue(newInputValue);
  // }

  const handleCarrierRouteSelectionChange = (selectedOptions) => {
    setCarrierRoute(selectedOptions);
  }

  const handleInputPrefCon = (newInputValue) => {
    setInputPrefConValue(newInputValue); 
  };
  
  const handleServiceSelectionChange = (selectedOptions) => {
    setService(selectedOptions);
  };

  const handlePrefConSelectionChange = (selectedOptions) => {
    setPrefCon(selectedOptions);
  };
  
  const handleInputDmState = (newInputValue) => {
    setInputDmStateValue(newInputValue);
  };

  const handleDmStateSelectionChange = (selectedOptions) => {
    setDMstate(selectedOptions);
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

    const debouncedGetCarrierRoute = debounce((inputValue) => {
        if (inputValue) {
          carrierRoutesOptions(inputValue);
        } else {
          setCarrierRouteOpt([]); 
        }
      }, 300);
    
      
      const handleInputChangeCarrierRoute = (newInputValue) => {
        setInputCarrierRouteValue(newInputValue);
        debouncedGetCarrierRoute(newInputValue);
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
        {picklistName === "Web Requests" ? (
          <form
            onSubmit={handleAddEmp}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2"
          >
          <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
          <div div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">First Name</label>
              <input
                type="text"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                name="first name"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Last Name</label>
              <input
                type="text"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                name="last name"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Email</label>
              <input
                type="text"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                name="email"
              />
            </div>
          </div>
            
          <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
          <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Phone</label>
              <input
                type="text"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter Phone"
                name="phone"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Company Name</label>
              <input
                type="text"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter Company Name"
                name="company name"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Preferred Contact</label>
                <Select
                  options={preferredContactOpt}
                  isMulti
                  value={prefCon}
                  inputValue={inputPrefConValue}
                  onInputChange={handleInputPrefCon}
                  onChange={handlePrefConSelectionChange}
                  placeholder="Select Preferred"
                  styles={customStyles}
                  name="preferred contact"
                  id="role-select-cus"
                />
            </div>
          </div>
            
          <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
          <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Services</label>
                <Select
                  options={servicesOpt}
                  isMulti
                  value={service}
                  inputValue={inputServiceValue}
                  onInputChange={handleInputService}
                  onChange={handleServiceSelectionChange}
                  placeholder="Select Services"
                  styles={customStyles}
                  name="services"
                  id="role-select-cus"
                />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Website</label>
              <input
                type="text"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Enter Website"
                name="website"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Budget</label>
              <input
                type="text"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Enter Budget"
                name="budget"
              />
            </div>
          </div>
            
          <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
          <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Est Date</label>
              <input
                type="date"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={estDate}
                onChange={(e) => setEstDate(e.target.value)}
                placeholder="Enter Est Date"
                name="estDate"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Message</label>
              <input
                type="text"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter Message"
                name="message"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Second Email</label>
              <input
                type="text"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={secondEmail}
                onChange={(e) => setSecondEmail(e.target.value)}
                placeholder="Enter Second Email"
                name="email"
              />
            </div>
          </div>

          <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Second Phone</label>
              <input
                type="text"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={secondPhone}
                onChange={(e) => setSecondPhone(e.target.value)}
                placeholder="Enter Second Phone"
                name="phone"
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
        ) : picklistName === "Contact Leads" ? (
          <form
            onSubmit={handleAddEmp}
            className="flex flex-row flex-wrap gap-5"
          >
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">First Name</label>
              <input
                type="text"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={conFirstName}
                onChange={(e) => setConFirstName(e.target.value)}
                placeholder="Enter first name"
                name="first name"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Last Name</label>
              <input
                type="text"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={conLastName}
                onChange={(e) => setConLastName(e.target.value)}
                placeholder="Enter last name"
                name="last name"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Email</label>
              <input
                type="text"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={conEmail}
                onChange={(e) => setConEmail(e.target.value)}
                placeholder="Enter Email"
                name="email"
              />
            </div>
            </div>
            
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Phone</label>
              <input
                type="text"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={conPhone}
                onChange={(e) => setConPhone(e.target.value)}
                placeholder="Enter Phone"
                name="phone"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Company Name</label>
              <input
                type="text"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={conCompanyName}
                onChange={(e) => setConCompanyName(e.target.value)}
                placeholder="Enter Company Name"
                name="company name"
              />
            </div>
            
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Services</label>
                <Select
                  options={servicesOpt}
                  isMulti
                  value={service}
                  inputValue={inputServiceValue}
                  onInputChange={handleInputService}
                  onChange={handleServiceSelectionChange}
                  styles={customStyles}
                  placeholder="Select Services"
                  name="services"
                  id="role-select-cus"
                />
            </div>
            </div>

            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Message</label>
              <input
                type="text"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={conMessage}
                onChange={(e) => setConMessage(e.target.value)}
                placeholder="Enter Message"
                name="message"
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
        ) : picklistName === "Direct Mail" ? (
            <form
            onSubmit={handleAddEmp}
            className="flex flex-row flex-wrap gap-5"
          >
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Residential</label>
              <input
                type="text"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={residential}
                onChange={(e) => setResidential(e.target.value)}
                placeholder="Enter Residential"
                name="residential"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Business</label>
              <input
                type="text"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                placeholder="Enter Business"
                name="business"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Total</label>
              <input
                type="text"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="Enter Total"
                name="total"
              />
            </div>
            </div>
            
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">

            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Carrier Route</label>
                <Select
                  options={carrierRouteOpt}
                  value={carrierRoute}
                  inputValue={inputCarrierRouteValue}
                  onInputChange={handleInputChangeCarrierRoute}
                  onChange={handleCarrierRouteSelectionChange}
                  styles={customStyles}
                  placeholder="Select Carrier Route"
                  name="carrierRoute"
                  id="role-select-cus3"
                />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">DM State</label>
                <Select
                  options={DMstateOpt}
                  value={DMstate}
                  inputValue={inputDmStateValue}
                  onInputChange={handleInputDmState}
                  onChange={handleDmStateSelectionChange}
                  styles={customStyles}
                  placeholder="Select DM State"
                  name="dmState"
                  id="role-select-cus2"
                />
            </div>

            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Age Range</label>
              <input
                type="text"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                placeholder="Enter Age Range"
                name="age range"
              />
            </div>
            </div>
            
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
               <div className="flex flex-col gap-2 w-1/3">
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
                    }}
                    placeholder="Select ZipCode"
                    styles={customStyles}
                    id="role-select-cus"
                    name="zipCode"
                  />
                }
              </div>
              <div className="flex flex-col gap-2 w-1/3">
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
              <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Income</label>
              <input
                type="text"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="Enter Income"
                name="income"
              />
            </div>
            </div>

            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Cost</label>
              <input
                type="text"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="Enter Cost"
                name="cost"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Size</label>
              <input
                type="text"
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="Enter Size"
                name="size"
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

export default AddSalelist;

