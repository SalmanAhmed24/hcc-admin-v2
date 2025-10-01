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
// import { Button } from "@mui/material";
// import { Edit2Icon, Trash, View } from "lucide-react";
import Swal from "sweetalert2";
import Select from "react-select";
// import ClientNoteDetails from './clientTabsOpen/clientNoteOpen';
import TaskNoteDetails from './TaskModalOpen/taskNotesOpen';

const TaskNotes = ({item, open}) => {
  const [notesCategory, setNotesCategory] = useState("");
  const [notesCategoryOpt, setNotesCategoryOpt] = useState([]);
  const [inputNotesCategory, setInputNotesCategory] = useState("");

  const [notesDescription, setNotesDescription] = useState("");
  const [date, setDate] = useState("");

  const[createdBy, setCreatedBy] = useState("");
  const[createdByOpt, setCreatedByOpt] = useState([]);
  const[inputCreatedBy, setInputCreatedBy] = useState("");

  const [clientItem, setClientItem] = useState(item);
  const[loader, setLoader] = useState(false);
  
  const [editNote, setEditNote] = useState(false);
  const [noteId, setNoteId] = useState("");

  const[openModal, setOpenModal] = useState(false);
  const[empId, setEmpId] = useState("");
  

   useEffect(()=>{
    notesCategoryOptions();
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

  async function notesCategoryOptions() {
    const noteCategories = await axios.get(`${apiPath.prodPath}/api/picklist/noteCategory/getAllNoteCategory`)
    .then((res) => {
      const categoryArr = res.data.noteCategory;
      console.log(categoryArr)
      return categoryArr;
    });
    
    const options = noteCategories.map((item)=>{
      const statusOption = {
        label : item.categoryName,
        value : item.categoryName,
      }
      return statusOption;
    });
    setNotesCategoryOpt(options);
  }
  

  const handleInputCreatedBy = (e) => {
    setInputCreatedBy(e);
  }
  
  const handleInputNotesCatagory = (e) => {
    setInputNotesCategory(e);
  }

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (editNote) {
      const formData = new FormData();
      console.log(notesCategory, " ", notesDescription, " ", date, " ", createdBy, " ");
      formData.append("noteCategory", notesCategory.value);
      formData.append("noteDescription", notesDescription);
      formData.append("date", date);
      formData.append("createdBy", createdBy.value);
      
      await axios
        .patch(`${apiPath.prodPath}/api/tasks/editTaskNotes/${item._id}&&${noteId}`, formData)
        .then((res) => {
          Swal.fire({
            icon: "success",
            text: "Client Note Updated Successfully",
          });
          setNotesCategory("");
          setInputCreatedBy("");
          setInputNotesCategory("");
          setNotesDescription("");
          setDate("");
          setCreatedBy("");
          setEditNote(false);
        })
        .catch((err) => {
          console.log(err);
          Swal.fire({
            icon: "error",
            text: "Something went wrong with the editing Note",
          });
          setEditNote(false);
        });

    }else{
      const formData = new FormData();
      console.log(notesCategory, " ", notesDescription, " ", date, " ", createdBy, " ");
      formData.append("noteCategory", notesCategory.value);
      formData.append("noteDescription", notesDescription);
      formData.append("date", date);
      formData.append("createdBy", createdBy.value);
      
      await axios
        .patch(`${apiPath.prodPath}/api/tasks/addTaskNote/${item._id}`, formData)
        .then((res) => {
          Swal.fire({
            icon: "success",
            text: "Client Note added Successfully",
          });
          setNotesCategory("");
          setInputCreatedBy("");
          setInputNotesCategory("");
          setNotesDescription("");
          setDate("");
          setCreatedBy("");
          setEditNote(false);
        })
        .catch((err) => {
          console.log(err);
          Swal.fire({
            icon: "error",
            text: "Something went wrong with the adding Note",
          });
        });
      
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
        }).then(async(result)=>{
          if(result.isConfirmed){
            await axios
              .patch(`${apiPath.prodPath}/api/tasks/deleteTaskNote/${item._id}&&${id}`)
              .then((res) => {
                Swal.fire({
                  icon: "success",
                  text: "Client Note Deleted Successfully",
                });
              })
              .catch((err) => {
                console.log(err);
                Swal.fire({
                  icon: "error",
                  text: "Something went wrong with the deleting Note",
                });
              });
          }
        })
    
    setLoader(true);
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
                <label className="font-satoshi text-md">Notes Catagory</label>
                <Select
                    options={notesCategoryOpt}
                    value={notesCategory}
                    onInputChange={handleInputNotesCatagory}
                    inputValue={inputNotesCategory}
                    onChange={(e) => setNotesCategory(e)}
                    styles={customStyles}
                    placeholder="Select Note Catagory"
                    id="role-select-cus"
                    name="Note Catagory"
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
                <label className="font-satoshi text-md">Note Description</label>
                <input
                  type='text'
                  value={notesDescription}
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] h-[42px]"
                  onChange={(e) => setNotesDescription(e.target.value)}
                  name="Note Description"
                />
              </div>
            </div>
  
            
          <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={editNote? `Edit`:`Add Notes`}
              />
            </div>
      
          </form>
          {
            
      <Table className="bg-[#231C46] rounded-[12px] font-satoshi">
        <TableCaption>A list of all Client Notes</TableCaption>
        <TableHeader>
          <TableRow className="w-fit, h-[58px] font-satoshi text-lg text-[#E1C9FF]">
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Note Category</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Note Description</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>date</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Created By</TableHead>
            <TableHead className="text-[#E1C9FF]" >Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          { clientItem.taskNotes !== undefined && clientItem.taskNotes.map((i) => 
             <TableRow className="w-fit, h-[72px] bg-[#2D245B] border-[1px] border-[#452C95]" key={i._id}>
              <TableCell className="font-satoshi font-medium text-#fff">
                {i.noteCategory}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {i.noteDescription}
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
                      setEditNote(true);
                      setNoteId(i._id);
                      setNotesCategory({label: i.noteCategory, value: i.noteCategory});
                      setNotesDescription(i.noteDescription);
                      setDate(i.date);
                      setCreatedBy({label: i.createdBy, value: i.createdBy});
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
                    <TaskNoteDetails
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

export default TaskNotes
