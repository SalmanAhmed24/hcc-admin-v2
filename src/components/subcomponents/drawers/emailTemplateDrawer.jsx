import React, { useEffect, useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { apiPath } from "@/utils/routes";
import Swal from "sweetalert2";
import useAuthStore from "@/store/store";
import { Drawer } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const AddEmailTemplate = ({ open, handleClose, refreshData, editMode, editData }) => {
  
  const user = useAuthStore((state) => state.user);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [templateName, setTemplateName] = useState("");
  


  const username = user?.user?.username;
  const email = user?.user?.email;
  const fullname = user?.user?.firstName + " " + user?.user?.secondName;

  useEffect(() => {
    if (editMode && editData) {
      setSubject(editData.subject || "");
      setBody(editData.body || "");
      setTemplateName(editData.templateName || "");
    }
  }, [editMode, editData]);

  const handleUpload = async (e) => {
    e.preventDefault();
      const formData = new FormData();

      formData.append("username", username);
      formData.append("email", email);
      formData.append("fullname", fullname);
      formData.append("templateName", templateName);
      formData.append("subject", subject);
      formData.append("body", body);

        if (editMode && editData) {
            try {
              await axios.patch(`${apiPath.prodPath}/api/emailTemplate/modifyEmailTemplate/${editData._id}`, formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }).then((response) => {
                console.log(response.data);
                Swal.fire({
                  title: "Success!",
                  text: "Email Template successfully updated.",
                  icon: "success",
                  confirmButtonText: "OK",
                });
              });
          } catch (error) {
              console.error("Error updating email template:", error);
          }
        }else {
            try {
             await axios.post(`${apiPath.prodPath}/api/emailTemplate/addEmailTemplate`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }).then((response) => {
              console.log(response.data);
              Swal.fire({
                title: "Success!",
                text: "Email Template successfully created.",
                icon: "success",
                confirmButtonText: "OK",
              });
            });
          } catch (error) {
              console.error("Error creating email template:", error);
          }
        }

      refreshData();
      setSubject("");
      setBody("");
      setTemplateName("");

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
          <h1 className="text-white font-satoshi text-2xl font-bold mb-5">Add Email Template</h1>
           <form onSubmit={handleUpload} className="space-y-4 mt-4">
          <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/2">
            <label className="font-satoshi text-md">Template Name</label>
            <input
                type="text"
                value={templateName}
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                onChange={(e)=> setTemplateName(e.target.value)}
                name="emailTemplate"
            />
            </div>

          <div className="flex flex-col gap-2 w-1/2">
            <label className="font-satoshi text-md">Subject</label>
            <input
                type="text"
                value={subject}
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                onChange={(e)=> setSubject(e.target.value)}
                name="subject"
            />
            </div>
          
        </div>

        <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-full">
                <label htmlFor="body">Body</label>
                <textarea id="body" name="body" value={body} onChange={(e) => setBody(e.target.value)} required className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]" />
              </div>
          </div>
        <Button type="submit" className="w-full bg-[#B797FF]">
          {"Save Email Template"}
        </Button>
        </form>
        </div>
      </Drawer>
    </>
  );
};

export default AddEmailTemplate;

