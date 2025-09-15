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

const SendEmailViaGmail = ({ open, handleClose, email, item }) => {
  
  const user = useAuthStore((state) => state.user);
  const [body, setBody] = useState("");
  const [to, setTo] = useState(email || "");
  const [subject, setSubject] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [templateData, setTemplateData] = useState({});
  const [inputTemplateId, setInputTemplateId] = useState("");
  const [attachments, setAttachments] = useState([]);

  const hccEmail = user?.user?.hccEmail || " ";
  const id = user?.user?._id;


  
  
  async function templateOptions() {
    const templates = await axios.get(`${apiPath.prodPath}/api/appGmail/templates`)
    .then((res) => {
      const templateArr = res.data;
      console.log(templateArr)
      return templateArr;
    });
    const options = templates.map((item)=>{
      const statusOption = {
        label : item.id,
        value : item.id,
        id : item.id,
        name : item.name,
        description : item.description,
      }
      return statusOption;
    });
    setTemplateData(options);
  }

  useEffect(() => {
    templateOptions();
  }, []);

  
  
  const handleUpload = async (e) => {
    e.preventDefault();
      const formData = new FormData();

      formData.append("to", to);
      formData.append("subject", subject);
      formData.append("body", body);
      formData.append("templateId", templateId.value);
      formData.append("templateData", templateData);
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });


        try {
            const response = await axios.post(`${apiPath.prodPath}/api/appGmail/send/${id}`, formData);
            console.log(response.data);
        } catch (error) {
            console.error("Error sending email:", error);
        }

      setBody("");
      setSubject("");
      setTemplateId("");
      setTemplateData({});
      setInputTemplateId("");
      setAttachments([]);
      


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


  const handleInputTemplateId = (e) => {
    setInputTemplateId(e);
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]; 
    setAttachments((prevFiles) => [...prevFiles, selectedFile]); 
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
            left: "50%",
            top: "50%",
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
          <h1 className="text-white font-satoshi text-2xl font-bold mb-5">Email</h1>
           <form onSubmit={handleUpload} className="space-y-4 mt-4">
          <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/2">
            <label className="font-satoshi text-md">From</label>
               <p
                className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                name="note"
                >
                {hccEmail}
                </p>
            </div>

          <div className="flex flex-col gap-2 w-full">
                <label className="font-satoshi text-md">To</label>
                <p
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  name="note"
                >
                  {to}
                </p>
              </div>

          <div className="flex flex-col gap-2 w-full">
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
              <textarea
                id="body"
                name="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
              />
            </div>
            
          </div>

        <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
             <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Files</label>
                <input
                  type="file"
                  multiple
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  onChange={handleFileChange}
                  name="Files"
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label htmlFor="taskStatus">Template</label>
                <Select
                options={templateData}
                value={templateId}
                onInputChange={handleInputTemplateId}
                inputValue={inputTemplateId}
                onChange={(e) => setTemplateId(e)}
                placeholder="Select Template"
                styles={customStyles}
                id="role-select-cus"
                name="Task Status"
                />
            </div>
        </div>

        <Button type="submit" className="w-full bg-[#B797FF]">
          {"Send Email"}
        </Button>
        </form>
        </div>
      </Drawer>
    </>
  );
};

export default SendEmailViaGmail;

