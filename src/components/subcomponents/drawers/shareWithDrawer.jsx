import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { apiPath } from "@/utils/routes";
import Swal from "sweetalert2";
import useAuthStore from "@/store/store";
import { Drawer } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Select from "react-select";

const ShareFile = ({ open, handleClose, item }) => {
 
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const getUser = () => {
      const user = useAuthStore.getState().user;
      setUserId(user?.user?._id || "");
    };
    getUser();
  }, []);

  // const [assignedTo, setAssignedTo] = useState([]);
  const [assignToOpt, setAssignToOpt] = useState([]);
  const [inputAssignTo, setInputAssignTo] = useState("");
  const [assignedToUsername, setAssignedToUsername] = useState("");

  useEffect(() => {
   axios
    .get(`${apiPath.prodPath}/api/users/allusers`)
    .then((res) => {
      
      const options = res.data
            .map((item) => ({
              label: `${item.firstName} ${item.secondName}`,
              value: `${item.firstName} ${item.secondName}`,
              username: item.username,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));

          setAssignToOpt(options);

    })
    .catch((err) => {
      console.log(err);
      Swal.fire({
        icon: "error",
        text: "Something went wrong with the data fetching",
      });
    });
  }, []);

  const shareFile = async (formData) => {
    try {
      const response = await axios.patch(
        `${apiPath.prodPath}/api/files/shareFile/${userId}/${item._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  
  const handleUpload = async (e) => {
    if (!userId) {
      console.log("Waiting for userId...");
      return;
    }
    e.preventDefault();
      const formData = new FormData();

      const assignedTo = assignedToUsername.map(user => {
        const username = user.username;
        return username;
      });

      console.log(assignedTo);

      
      formData.append("sharedWithUsernames", JSON.stringify(assignedTo));;

      await shareFile(formData).then((res) => {
        Swal.fire({
          icon: "success",
          text: "File Shared Successfully",
        });
      });
      setAssignedToUsername([]);
      setInputAssignTo("");
    
  handleClose();   
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


  const handleInputChange = (newInputValue) => {
    setInputAssignTo(newInputValue);
  };
  const handleSelectionChange = (selectedOptions) => {
    setAssignedToUsername(selectedOptions);
  };

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
            height: "60%", 
            position: "absolute",
            left: "20%",
            top: "5%",
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
          <h1 className="text-white font-satoshi text-2xl font-bold mb-5">Share File</h1>
           <form onSubmit={handleUpload} className="space-y-4 mt-4">

        <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
          <div className="flex flex-col gap-2 w-1/3">
              <label htmlFor="taskTitle">File Name</label>
              <h1
                id="fileName"
                name="fileName"
                className="p-3 border-[#452C95] rounded-[12px] focus-within:outline-none border-[1px] bg-[#191526]"
              >{item.filename}</h1>
            </div>
        </div>
        
        <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
          
          <div className="flex flex-col gap-2 w-1/3">
            <label>Assign To</label>
            <Select
              options={assignToOpt}
              isMulti
              value={assignedToUsername}
              inputValue={inputAssignTo}
              onInputChange={handleInputChange}
              onChange={handleSelectionChange}
              styles={customStyles}
              placeholder="Search Users"
              name="assignedTo"
              id="role-select-cus"
            />
          </div>
        </div>

        <Button type="submit" className="w-full bg-[#B797FF]">
          {"Share File"}
        </Button>
        </form>
        </div>
      </Drawer>
    </>
  );
};

export default ShareFile;

