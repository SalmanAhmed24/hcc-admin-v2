import React, { useState, useEffect } from "react";

// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { apiPath } from "@/utils/routes";
import Swal from "sweetalert2";
import useAuthStore from "@/store/store";
import { Drawer } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Select from "react-select";

const AddEmailCredentials = ({ open, handleClose }) => {
  
  const user = useAuthStore((state) => state.user);
  const [hccEmail, setHccEmail] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const id = user?.user?._id;

  
  
//   const handleUpload = (e) => {
//   e.preventDefault();

//   const data = {
//     hccEmail,
//     clientId,
//     clientSecret,
//     refreshToken,
//     accessToken,
//   };

//   try {
//      axios.patch(
//       `${apiPath.devPath}/api/users/gmailCredentialsForm/${id}`,
//       data,
//       { headers: { "Content-Type": "application/json" } }
//     ).then((response) => {
//       console.log(response.data);
//     });
//   } catch (error) {
//     console.error("Error saving Gmail credentials:", error);
//   }

//   setHccEmail("");
//   setClientId("");
//   setClientSecret("");
//   setRefreshToken("");
//   setAccessToken("");

//   handleClose();
// };



  const handleUpload = async (e) => {
    e.preventDefault();
      const formData = new FormData();

      formData.append("hccEmail", hccEmail);
      formData.append("clientId", clientId);
      formData.append("clientSecret", clientSecret);
      formData.append("refreshToken", refreshToken);
      formData.append("accessToken", accessToken);

        try {
             await axios.patch(`${apiPath.prodPath}/api/users/gmailCredentialsForm/${id}`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }).then((response) => {
              console.log(response.data);
              Swal.fire({
                title: "Success!",
                text: "Email credentials updated successfully.",
                icon: "success",
                confirmButtonText: "OK",
              });
            });
        } catch (error) {
            console.error("Error sending email:", error);
        }

      setHccEmail("");
      setClientId("");
      setClientSecret("");
      setRefreshToken("");
      setAccessToken("");

  handleClose();
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
            height: "50%", 
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
          <h1 className="text-white font-satoshi text-2xl font-bold mb-5">Add Email Credentials</h1>
           <form onSubmit={handleUpload} className="space-y-4 mt-4">
          <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/2">
            <label className="font-satoshi text-md">Hcc Email</label>
            <input
                type="text"
                value={hccEmail}
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                onChange={(e)=> setHccEmail(e.target.value)}
                name="hccEmail"
            />
            </div>

          <div className="flex flex-col gap-2 w-1/2">
            <label className="font-satoshi text-md">clientId</label>
            <input
                type="text"
                value={clientId}
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                onChange={(e)=> setClientId(e.target.value)}
                name="clientId"
            />
            </div>
          
        </div>

        <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/2">
            <label className="font-satoshi text-md">Refresh Token</label>
            <input
                type="text"
                value={refreshToken}
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                onChange={(e)=> setRefreshToken(e.target.value)}
                name="refreshToken"
            />
            </div>
            <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Client Secret</label>
                <input
                    type="text"
                    value={clientSecret}
                    className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                    onChange={(e)=> setClientSecret(e.target.value)}
                    name="clientSecret"
                />
            </div>
          </div>

        <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-full">
            <label className="font-satoshi text-md">Access Token</label>
            <input
                type="text"
                value={accessToken}
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                onChange={(e)=> setAccessToken(e.target.value)}
                name="accessToken"
            />
            </div>
        </div>

        <Button type="submit" className="w-full bg-[#B797FF]">
          {"Save Email Credentials"}
        </Button>
        </form>
        </div>
      </Drawer>
    </>
  );
};

export default AddEmailCredentials;

