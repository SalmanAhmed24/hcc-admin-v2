import Drawer from "@mui/material/Drawer";
import "./style.scss";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import { apiPath } from "@/utils/routes";
import Checkbox from "@mui/material/Checkbox";
import { FormControlLabel } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import debounce from "lodash.debounce";

function AddEmployee({ open, handleClose, addEmp, edit, editData, editEmp }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cell, setCell] = useState("");
  const [roleOpt, setRoleOpt] = useState([]);
  const [roleLoader, setRoleLoader] = useState(false);
  const [role, setRole] = useState("");
  const [title, setTitle] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [state, setState] = useState("");
  const [zipCodeLoader, setZipCodeLoader] = useState(false);
  const [zipCodeOpt, setZipCodeOpt] = useState([]);
  const [zipCode, setZipCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [newPassFlag, setnewPassFlag] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [cityOpt, setCityOpt] = useState([]);
  const [city, setCity] = useState("");
  const [inputValueCity, setInputValueCity] = useState("");

  
  useEffect(() => {
    getUserTypes();
    getZipCodes();
    if (edit) {
      setFirstName(editData.firstName);
      setLastName(editData.secondName);
      setEmail(editData.email);
      setPhone(editData.phone);
      setCell(editData.cell);
      setRole({ label: editData.role, value: editData.role });
      setTitle(editData.title);
      setAddress1(editData.address1);
      setAddress2(editData.address2);
      setCity(editData.city);
      setState(editData.state);
      setZipCode({ label: editData.zipCode, value: editData.zipCode });
      setUsername(editData.username);
    }
  }, [open]);
  const handleAddEmp = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("secondName", lastName);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("cell", cell);
    formData.append("role", role.value);
    formData.append("title", title);
    formData.append("address1", address1);
    formData.append("address2", address2);
    formData.append("city", city.value);
    formData.append("state", state);
    formData.append("zipCode", zipCode.value);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("avatar", avatar);
    if (edit) {
      formData.append("newPasswordFlag", newPassFlag);
      editEmp(formData);
    } else {
      addEmp(formData);
      dataReset();
    }
  };
  const dataReset = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setCell("");
    setRole("");
    setTitle("");
    setAddress1("");
    setAddress2("");
    setCity("");
    setState("");
    setZipCode("");
    setUsername("");
  };
  function getUserTypes(){
    setRoleLoader(true);
    axios
      .get(`${apiPath.prodPath}/api/picklist/usertypes/getusertypes`)
      .then((res) => {
        const sortedData = res.data
          .map((i) => {
            return {
              label: i.userTypeCategory,
              value: i.userTypeCategory,
            };
          });

          console.log(sortedData);
        setRoleOpt(sortedData);
        setRoleLoader(false);
      })
      .catch((err) => {
        console.log(err);
        setRoleLoader(false);
      });
  };
  // const getZipCodes = () => {
  //   setZipCodeLoader(true);
  //   axios
  //     .get(`${apiPath.prodPath}/api/picklist/zipcodes/getzipcodes`)
  //     .then((res) => {
  //       console.log(res.data);
  //       res.data.zipCodes.map((i) => {
  //         console.log("##", i.zipCode);
  //       });
  //       const sortedData = res.data.zipCodes.map((i) => {
  //         return {
  //           label: i.zipCode,
  //           value: i.zipCode,
  //           city: i.city,
  //           state: i.state,
  //         };
  //       });
  //       setZipCodeOpt(sortedData);
  //       setZipCodeLoader(false);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       setZipCodeLoader(false);
  //     });
  // };

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
   };




  const fileHandler = (event) => {
    setAvatar(event.target.files[0]);
  };
  const handleNewPassFlag = (e) => {
    setnewPassFlag(e.target.checked);
  };
  console.log("newpass", newPassFlag);
  console.log("##$$", zipCodeOpt);
  return (
    <>
          <Drawer
            className="bg-all-modals"
            anchor="left" 
            open={open}
            onClose={handleClose}
            PaperProps={{
              sx: {
                width: "1142px",  
                height: "dvh", 
                position: "absolute",
                left: "15%",
                top: "1%",
                transform: "translate(-50%, -50%)",
                borderRadius: "16px", 
                boxShadow: 3, 
                marginTop : "30px",
                marginBottom: "30px",
              },
            }}
           >
        <div className="p-10 flex flex-col bg-[#2D245B] flex-wrap">
          <div className="flex flex-row justify-end">
            <CloseIcon
              className="text-2xl hover:cursor-pointer"
              onClick={() => handleClose()}
            />
          </div>
          <h1 className="text-white font-satoshi text-2xl font-bold mb-5">
            Add Employee
          </h1>
          <form
            onSubmit={handleAddEmp}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2"
          >
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/3">
                <label className="font-satoshi text-md">First Name</label>
                <input
                  type="text"
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter First Name"
                  name="firstName"
                />
              </div>
              <div className="flex flex-col gap-2 w-1/3">
                <label className="font-satoshi text-md">Last Name</label>
                <input
                  type="text"
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter Last Name"
                  name="lastName"
                />
              </div>
              <div className="flex flex-col gap-2 w-1/3">
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
            </div>

            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              
              <div className="flex flex-col gap-2 w-1/3">
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
              <div className="flex flex-col gap-2 w-1/3">
                  <label className="font-satoshi text-md">Cell</label>
                  <input
                    type="text"
                    className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                    value={cell}
                    onChange={(e) => setCell(e.target.value)}
                    placeholder="Enter Cell"
                    name="cell"
                  />
                </div>
                <div className="flex flex-col gap-2 w-1/3">
                  <label className="font-satoshi text-md">User Types</label>
                  {roleLoader ? (
                    <p className="text-white text-lg">Loading...</p>
                  ) : (
                    <Select
                      options={roleOpt}
                      value={role}
                      onChange={(v) => setRole(v)}
                      placeholder="Select Role"
                      required={true}
                      styles={customStyles}
                      id="role-select-cus"
                      name="role"
                    />
                  )}
                </div>
            </div>
            


            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/3">
                <label className="font-satoshi text-md">Title</label>
                <input
                  type="text"
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter Title"
                  name="title"
                />
              </div>
              <div className="flex flex-col gap-2 w-1/3">
                <label className="font-satoshi text-md">Address 1</label>
                <input
                  type="text"
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  placeholder="Enter Address 1"
                  name="address1"
                />
              </div>
              <div className="flex flex-col gap-2 w-1/3">
                <label className="font-satoshi text-md">Address 2</label>
                <input
                  type="text"
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  placeholder="Enter Address 2"
                  name="address2"
                />
              </div>
            </div>

            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[rgb(127,86,217)]">
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
                      setState(v.state);
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
                <label className="font-satoshi text-md">State</label>
                <input
                  type="text"
                  className="p-2 border-[1px] border-[#452C95] rounded-[8px] focus-within:outline-none  bg-[#191526]"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Enter State"
                  name="state"
                />
              </div>
            </div>
            
            
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
                <div className="flex flex-col gap-2 w-1/3">
                  <label className="font-satoshi text-md">Username</label>
                  <input
                    type="text"
                    className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter Username"
                    name="username"
                    required={true}
                  />
                </div>
                {edit ? (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newPassFlag}
                        onChange={handleNewPassFlag}
                        inputProps={{ "aria-label": "controlled" }}
                        value={"new"}
                      />
                    }
                    label="New Password"
                  />
                ) : null}
                {newPassFlag ? (
                  <div className="flex flex-col gap-2 w-1/3">
                    <label className="font-satoshi text-md">Password</label>
                    <input
                      type="password"
                      className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="New Enter Password"
                      name="password"
                      required={true}
                    />
                  </div>
                ) : null}
                {edit ? null : (
                  <div className="flex flex-col gap-2 w-1/3">
                    <label className="font-satoshi text-md">Password</label>
                    <input
                      type="password"
                      className="p-2 focus-within:outline-none border-[1px] border-[#452C95] rounded-[8px] bg-[#191526]"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter Password"
                      name="password"
                      required={true}
                    />
                  </div>
                )}
                <div className="flex flex-col gap-2 w-1/3">
                <label className="font-satoshi text-md">Avatar</label>
                <input
                  name="avatar"
                  className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  type="file"
                  onChange={(e) => fileHandler(e)}
                  accept="image/png,image/jpeg"
                />
              </div>
            </div>
             
            <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={edit ? "Edit Employee" : `Add Employee`}
              />
            </div>
          </form>
        </div>
      </Drawer>
    </>
  );
}

export default AddEmployee;
