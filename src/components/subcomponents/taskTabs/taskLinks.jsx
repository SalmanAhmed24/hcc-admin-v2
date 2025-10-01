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
import Swal from "sweetalert2";
import Select from "react-select";
import TaskLinkDetails from './TaskModalOpen/taskLinksOpen';

const TaskLinks = ({item, open}) => {

  const [clientItem, setClientItem] = useState(item);
  const[loader, setLoader] = useState(false);
//   const[id, setId] = useState("");
  
  const [editLink, setEditLink] = useState(false);
  const [linkId, setLinkId] = useState("");

  const [linkCategory, setLinkCategory] = useState("");
  const [linkCategoryOpt, setLinkCategoryOpt] = useState([]);
  const [inputLinkCategory, setInputLinkCategory] = useState("");

  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const[createdBy, setCreatedBy] = useState("");
  const[createdByOpt, setCreatedByOpt] = useState([]);
  const[inputCreatedBy, setInputCreatedBy] = useState("");

  const[openModal, setOpenModal] = useState(false);
  const[empId, setEmpId] = useState("");
  

   useEffect(()=>{
    linkCategoryOptions();
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

    axios.get(`${apiPath.prodPath}/api/tasks/${item._id}`)
      .then((res) => {
        setClientItem(res.data);
        setLoader(false);
      });
   
  }, [open, loader]);

  async function linkCategoryOptions() {
    // const interactionCategories = await axios.get(`${apiPath.prodPath}/api/picklist/interactionType/getAllInteractionCategory`)
    // .then((res) => {
    //   const categoryArr = res.data.interactionCategory;
    //   console.log(categoryArr)
    //   return categoryArr;
    // }); 
    const linkCategories = [
        { categoryName: "Email" },
        { categoryName: "Instagram" },
        { categoryName: "LinkedIn" },
        { categoryName: "Phone Call" },
        { categoryName: "Text Message" },
    ];
    const options = linkCategories.map((item)=>{
      const statusOption = {
        label : item.categoryName,
        value : item.categoryName,
      }
      return statusOption;
    });
    setLinkCategoryOpt(options);
  }
  

  const handleInputCreatedBy = (e) => {
    setInputCreatedBy(e);
  }
  
  const handleInputLinkCatagory = (e) => {
    setInputLinkCategory(e);
  }

  // const handleInteractionCategory = (e)=> {
  //   setInteractionCategory(e);
  // }

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (editLink) {
      const formData = new FormData();
      console.log(linkCategory, " ", description, " ", date, " ", createdBy, " ");
      formData.append("linkCategory", linkCategory.value);
      formData.append("description", description);
      formData.append("date", date);
      formData.append("createdBy", createdBy.value);
      
      await axios
        .patch(`${apiPath.prodPath}/api/tasks/editTaskLink/${item._id}&&${linkId}`, formData)
        .then((res) => {
          Swal.fire({
            icon: "success",
            text: "Task Link Updated Successfully",
          });
          setLinkCategory("");
          setInputCreatedBy("");
          setInputLinkCategory("");
          setDescription("");
          setDate("");
          setCreatedBy("");
          setEditLink(false);
        })
        .catch((err) => {
          console.log(err);
          Swal.fire({
            icon: "error",
            text: "Something went wrong with the editing link",
          });
          setEditLink(false);
        });

    }else{
      const formData = new FormData();
      console.log(linkCategory, " ", description, " ", date, " ", createdBy, " ");
      formData.append("linkCategory", linkCategory.value);
      formData.append("description", description);
      formData.append("date", date);
      formData.append("createdBy", createdBy.value);
      
      await axios
        .patch(`${apiPath.prodPath}/api/tasks/addTaskLink/${item._id}`, formData)
        .then((res) => {
          Swal.fire({
            icon: "success",
            text: "Task Link added Successfully",
          });
          setLinkCategory("");
          setInputCreatedBy("");
          setInputLinkCategory("");
          setDescription("");
          setDate("");
          setCreatedBy("");
        })
        .catch((err) => {
          console.log(err);
          Swal.fire({
            icon: "error",
            text: "Something went wrong with the adding link",
          });
        });
      
    }
  setLoader(true);    
  };

  const handleDelete = async (id) => {
    Swal.fire({
              icon: "warning",
              text: `Are you sure you want to delete the link`,
              showCancelButton: true,
              cancelButtonText: "No",
              showConfirmButton: true,
              confirmButtonText: "Yes",
            }).then(async(result)=>{
              if(result.isConfirmed){
                await axios
                  .patch(`${apiPath.prodPath}/api/tasks/deleteTaskLink/${item._id}&&${id}`)
                  .then((res) => {
                    Swal.fire({
                      icon: "success",
                      text: "Task Link Deleted Successfully",
                    });
                    setLoader(true);
                  })
                  .catch((err) => {
                    console.log(err);
                    Swal.fire({
                      icon: "error",
                      text: "Something went wrong with the deleting link",
                    });
                  });
              }
            });
    
    
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

  return (
        <>
      <form
            onSubmit={handleUpload}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2 mt-8 mb-8"
             >

            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Interaction Catagory</label>
                <Select
                    options={linkCategoryOpt}
                    value={linkCategory}
                    onInputChange={handleInputLinkCatagory}
                    inputValue={inputLinkCategory}
                    onChange={(e) => setLinkCategory(e)}
                    styles={customStyles}
                    placeholder="Select Link Category"
                    id="role-select-cus"
                    name="Link Category"
                  />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Created By</label>
                <Select
                    options={createdByOpt}
                    value={createdBy}
                    onInputChange={handleInputCreatedBy}
                    inputValue={inputCreatedBy}
                    onChange={(e) => setCreatedBy(e)}
                    styles={customStyles}
                    placeholder="Select created by"
                    id="role-select-cus"
                    name="Created By"
                  />
              </div>
            </div>          
            
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Date</label>
                <input
                  type="date"
                  value={date}
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  onChange={(e)=> setDate(e.target.value)}
                  name="Date"
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Description</label>
                <input
                  type='text'
                  value={description}
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] h-[42px]"
                  onChange={(e) => setDescription(e.target.value)}
                  name="Link Description"
                />
              </div>
            </div>
            
            
            
          <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={editLink?`Edit`:`Add Link`}
              />
            </div>
      
          </form>
          {
            
      <Table className="bg-[#231C46] rounded-[12px] font-satoshi">
        <TableCaption>A list of all Task Links</TableCaption>
        <TableHeader>
          <TableRow className="w-fit, h-[58px] font-satoshi text-lg text-[#E1C9FF]">
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Link Category</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Link Description</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>date</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Created By</TableHead>
            <TableHead className="text-[#E1C9FF]" >Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          { clientItem.links !== undefined && clientItem.links.map((i) => 
             <TableRow className="w-fit, h-[72px] bg-[#2D245B] border-[1px] border-[#452C95]" key={i._id}>
              <TableCell className="font-satoshi font-medium text-#fff">
                {i.linkCategory}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {i.description}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {i.date}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {i.createdBy}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                <DropdownMenu className="">
                  <DropdownMenuTrigger>
                    <MoreVertIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="z-[9999]">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleOpenModal(i)}>
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setEditLink(true);
                      setLinkId(i._id);
                      setLinkCategory({label: i.linkCategory, value:i.linkCategory});
                      setDescription(i.description);
                      setDate(i.date);
                      setCreatedBy({label: i.createdBy, value:i.createdBy});
                    }}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(i._id)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              {openModal && empId == i._id ? (
                    <TaskLinkDetails
                      open={openModal}
                      handleClose={() => setOpenModal(false)}
                      item={i}
                    />
                  ) : null}
            </TableRow>
          ) }
        </TableBody>
      </Table>
          }
    </>
  )
}

export default TaskLinks
