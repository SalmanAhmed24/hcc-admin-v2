import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { apiPath } from "@/utils/routes";
import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { Edit2Icon, Trash, View } from "lucide-react";
import Swal from "sweetalert2";
import Select from "react-select";
import FilePreviewDrawer from "@/components/Viewer/FilePreviewer";
import EmployeeFilePreviewer from "@/components/Viewer/EmployeeFilePreviewer";


const EmployeeFile = ({ open, item }) => {
  const [files, setFiles] = useState([]);
  const [fileCategory, setFileCategory] = useState("");
  const [fileCategoryOpt, setFileCategoryOpt] = useState("");
  const [inputFileCatagory, setInputFileCatagory] = useState("");
  const [note, setNote] = useState("");
  const [loader, setLoader] = useState(false);
  const [userItem, setUserItem] = useState(item);
  const [attachments, setAttachments] = useState();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editFile, setEditFile] = useState(false);
  const [editAttachments, setEditAttachments] = useState(false);
  const [user, setUser] = useState({});
  const [attachmentId, setAttachmentId] = useState();
  const [fileId, setFileId]= useState();

  const[previewAttachment, setPreviewAttachment] = useState({});
  const[previewObj, setPreviewObj] = useState();
  const [newFileFlag, setNewFileFlag] = useState(false);
  const [ oldFiles, setOldFiles ] = useState([]);
 
  const[createdBy, setCreatedBy] = useState("");
  const[createdByOpt, setCreatedByOpt] = useState([]);
  const[inputCreatedBy, setInputCreatedBy] = useState("");
  // const [selectedFile, setSelectedFile] = useState(null);

  

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setPreviewOpen(true);
  }
  
  useEffect(() => {
    console.log("####called")
      fileCatagoryOptions();
      axios
    .get(`${apiPath.prodPath}/api/users/allusers`)
    .then((res) => {
      const name = res.data.map((item) => {
        const fullname = item.firstName + " " + item.secondName;
        console.log(fullname);
        return fullname;
      });
      const options = name.map((item)=>{
        const statusOption = {
          label : item,
          value : item,
        }
        return statusOption;
      });
      setCreatedByOpt(options);
    })
    .catch((err) => {
      console.log(err);
      Swal.fire({
        icon: "error",
        text: "Something went wrong with the data fetching",
      });
    });
      axios.get(`${apiPath.prodPath}/api/users/user/${item._id}`)
      .then((res) => {
        setUserItem(res.data);
        console.log(res.data.attachments)
        setAttachments(res.data.attachments);
      });
      }, [open,loader]);

  
   async function fileCatagoryOptions () {
    const fileCategories = await axios.get(`${apiPath.prodPath}/api/picklist/fileCategory/getAllFileCategory`)
    .then((res) => {
      const fileCategoryArr = res.data.fileCategory;
      return fileCategoryArr;
    }); 
    const options = fileCategories.map((item)=>{
      const statusOption = {
        label : item.categoryName,
        value : item.categoryName,
      }
      return statusOption;
    });
    setFileCategoryOpt(options);
  }
  
  const handleFileChange = (e) => {
    if(editAttachments){
      setNewFileFlag(true);
    }
    const selectedFile = e.target.files[0]; 
    setFiles((prevFiles) => [...prevFiles, selectedFile]); 
    console.log(files);
  };
  const handleInputFileCatagory = (newInputValue) => {
    if(editAttachments){
      setNewFileFlag(true);
    }
    setInputFileCatagory(newInputValue); 
  };

  const handleInputCreatedBy = (e) => {
    setInputCreatedBy(e);
  }

  const refreshData = async () => {
    console.log("called")
    setLoader(true);
    setFiles([]);
    setFileCategory("");
    setNote("");
    setCreatedBy("");
    setOldFiles([]);
    await axios
      .get(`${apiPath.prodPath}/api/users/user/${item._id}`)
      .then((res) => {
        setUserItem(res.data);
        console.log(res.data.attachments)
        setAttachments(res.data.attachments);
        // setAttachments(clientItem.attachments);
        console.log("attachments", attachments);
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

  const handleUpload = async (e) => {
    e.preventDefault();
    

    if (editAttachments){
      const formData = new FormData();
      console.log(fileCategory.value, " ", note, " ", userItem.firstName);
      formData.append("attachmentCategories", fileCategory.value);

      const name = `${item.firstName} ${item.secondName}`
      
        if (files.length) {
          files.forEach((file) => {
            formData.append("files", file);
          });
          }

      formData.append("date", new Date().toISOString()); 
      formData.append("user", name);
      formData.append("note", note);
      formData.append("createdBy", createdBy.value);

      editFiles(formData);

    }else{
      const formData = new FormData();
      if (!files.length || !fileCategory) {
        alert("Please select files and a category before uploading.");
        return;
      }
      const name = `${item.firstName} ${item.secondName}`
  
      console.log("Uploading files:", files);
      console.log("Selected category:", fileCategory);
      
      formData.append("date", new Date().toISOString()); 
      formData.append("user", name);
      formData.append("note", note);
      formData.append("createdBy", createdBy.value);
      formData.append("attachmentCategories", fileCategory.value);
      
      files.forEach((file) => {
        formData.append("files", file);
      });
  
      sendFiles(formData);
      
    }
    
  };

  async function sendFiles(data) {
    console.log('here in send files');
    try {
      const res = await axios.patch(
        `${apiPath.prodPath}/api/users/addFiles/${item._id}`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      console.log("Upload response:", res);
      await refreshData();
       
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        text: "Something went wrong with sending files",
      });
    }
  }

  async function editFiles(data) {
    console.log('here in edit files');
    for (const pair of data.entries()) {
      console.log(pair[0], pair[1]);
    };
    try {
      const res = await axios.patch(
        `${apiPath.prodPath}/api/users/editFile/${item._id}&&${attachmentId}&&${fileId}`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      console.log("Upload response:", res);
      await refreshData();
       
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        text: "Something went wrong with sending files",
      });
    }
  }
  
  const handleDelete = async (i, obj) => {
        const oldFiles = i.files;
        console.log(oldFiles);
      
        try {
          Swal.fire({
            icon: "warning",
            text: "Are you sure you want to delete the Client",
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
          }).then(async (result) => {
            if (result.isConfirmed) {
          await axios.patch(
            `${apiPath.prodPath}/api/users/delFile/${item._id}&&${i._id}&&${obj._id}`, {oldFiles}
          ).then(async (res) => {
                  console.log(res);
                  Swal.fire({
                    icon: "success",
                    text: "File deleted successfully",
                  });
                  await refreshData();
                }).catch((err) => {
                       console.log(err)
                         Swal.fire({
                                   icon: "error",
                                   text: "Something went wrong with the deleting the file",
                                 });
                       });
                      }});

        
        } catch (err) {
          console.log(err);
          Swal.fire({
            icon: "error",
            text: "Something went wrong while deleting the file",
          });
        }
  };

  async function handleRemove(file) {
       setFiles((prevFiles) =>
            prevFiles.filter((item) => item.name !== file.name)
          );
  }


  // const handleView = async (i, obj) => {
  //   try {
  //     const response = await axios.get(
  //       `${apiPath.devPath}/api/clients/getFile/${item._id}&&${i._id}&&${obj._id}`,
  //       { responseType: "blob" } 
  //     );
  
  //     console.log(response);
  //     const contentType = response.ContentType|| "application/octet-stream";
  //     console.log(response.ContentType);
  //     console.log(response.data);
  
  //     const blob = new Blob([response.data], { type: contentType });
  
  //     const fileURL = window.URL.createObjectURL(blob);
  
  //     window.open(fileURL, "_blank");
  
  //   } catch (err) {
  //     console.error("Error retrieving file:", err);
  //     Swal.fire({
  //       icon: "error",
  //       text: "Something went wrong while retrieving the file.",
  //     });
  //   }
  // };

  const handlePreviewClick = (i, obj) => {
      setPreviewAttachment(i);
      setPreviewObj(obj)
      setPreviewOpen(true);
  }
  
  async function handleDeleteFile(file, attachmentId, fileId, client) {
    // console.log(file);
    try {
      Swal.fire({
          icon: "warning",
          text: "Are you sure you want to delete the Client",
          showConfirmButton: true,
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "No",
        }).then(async (result) => {
          if (result.isConfirmed) {
        console.log('here');
        await axios.patch(
          `${apiPath.prodPath}/api/users/delFileByName/${client._id}&&${attachmentId}&&${fileId}`, {file}
        ).then(async (res) => {
                console.log(res);
                
                Swal.fire({
                 icon: "success",
                 text: "File deleted successfully",
                 });
                 await refreshData();
              }).catch((err) => {
                      console.log(err)
                        Swal.fire({
                                  icon: "error",
                                  text: "Something went wrong with the deleting the file",
                                });
                      });
                    }});
    
    setOldFiles((prevFiles) =>
      prevFiles.filter((item) => item !== file)
    );
    
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        text: "Something went wrong with delecting files",
      });
    }
  }

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

  return (
    <>
      <form
            onSubmit={handleUpload}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2 mt-8 mb-8"
             >
            {/* <h1 className="font-semibold text-xl w-full">Upload Files</h1> */}
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
                <label className="font-satoshi text-md">File Catagory</label>
                <Select
                    options={fileCategoryOpt}
                    value={fileCategory}
                    onInputChange={handleInputFileCatagory}
                    inputValue={inputFileCatagory}
                    onChange={(e) => setFileCategory(e)}
                    placeholder="Select File Catagory"
                    styles={customStyles}
                    id="role-select-cus"
                    name="File Catagory"
                  />
              </div>
            </div>
            
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Note</label>
                <input
                  type="text"
                  value={note}
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  onChange={(e)=> setNote(e.target.value)}
                  name="note"
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">created By</label>
                <Select
                    options={createdByOpt}
                    value={createdBy}
                    onInputChange={handleInputCreatedBy}
                    inputValue={inputCreatedBy}
                    onChange={(e) => setCreatedBy(e)}
                    placeholder="Select Created By"
                    styles={customStyles}
                    id="role-select-cus"
                    name="Created By"
                  />
              </div>
            </div>
            
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">            
              <div className="flex flex-col gap-2 w-1/2" >
                <h3 className="font-satoshi text-md">Selected Files:</h3>
                <ul className="list-disc pl-4 text-xl">
                  {files.map((file, index) => (
                    <li key={index}><Button onClick={() => handleRemove(file)} className="w-fit h-30px m-2 bg-gray-400 rounded-xl text-black font-bold">{file.name} <Trash/> </Button></li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-2 w-1/2" >
                <h3 className="font-satoshi text-md">Old File:</h3>
                {editAttachments ? (<ul className="list-disc pl-4 text-xl">
                  {oldFiles.map((file, index) => (
                    <li key={index}><Button  className="w-fit h-30px m-2 bg-gray-400 rounded-xl text-black font-bold">{file} </Button></li>
                  ))}
                </ul>) : null}
              </div>
          </div>

          <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={`Upload`}
              />
            </div>
      
          </form>
          {
            loader ? <p>loading</p> :
      <Table className="bg-[#231C46] rounded-[12px] font-satoshi">
        <TableCaption>A list of all Client Files</TableCaption>
        <TableHeader>
          <TableRow className="w-fit, h-[58px] font-satoshi text-lg text-[#E1C9FF]">
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>File Name</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Category</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Date</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Client</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Note</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Created By</TableHead>
            <TableHead className="text-[#E1C9FF]" >Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          { attachments !== undefined && attachments.map((i) =>
            i.files.map((obj) => (
              <TableRow className="w-fit, h-[72px] bg-[#2D245B] border-[1px] border-[#452C95]" key={obj._id}>
                <TableCell className="font-satoshi font-medium text-#fff">{obj.filename}</TableCell>
                <TableCell className="font-satoshi font-medium text-#fff">{i.attachmentCategories}</TableCell>
                <TableCell className="font-satoshi font-medium text-#fff">{i.date}</TableCell>
                <TableCell className="font-satoshi font-medium text-#fff">{i.user}</TableCell>
                <TableCell className="font-satoshi font-medium text-#fff">{i.note}</TableCell>
                <TableCell className="font-satoshi font-medium text-#fff">{i.createdBy}</TableCell>
                <TableCell className="font-satoshi font-medium text-#fff">
                  <Button
                    onClick={() => handleDelete(i, obj)}
                    className="hover:bg-red-700 text-white"
                  >
                    <Trash />
                  </Button>
                  <Button onClick={() => {
                    setEditAttachments(true);
                    setFileCategory({label : i.attachmentCategories, value:i.attachmentCategories});
                    setOldFiles(() => {
                      let arr = [];
                       arr.push(obj.filename);
                       return arr;
                       });
                    setNote(i.note);
                    setCreatedBy({label : i.createdBy, value:i.createdBy});
                    setEditFile(false);
                    setUser(item);
                    setAttachmentId(i._id);
                    setFileId(obj._id);
                    } } className="hover:bg-green-700 text-white">
                    <Edit2Icon />
                  </Button>
                  <Button onClick={()=>handlePreviewClick(i, obj)} className="hover:bg-green-700 text-white">
                    <View />
                  </Button>
                  { previewOpen ?
                   <EmployeeFilePreviewer
                   open={previewOpen}
                   handleClose={() => setPreviewOpen(false)}
                   file={previewObj}
                   i={previewAttachment}
                   item={item}
                   previewOpen = {previewOpen}
                 /> : null
                  }
                </TableCell>
              </TableRow>
            ))
          ) }
        </TableBody>
      </Table>
          }
    </>
  );
};

export default EmployeeFile;






