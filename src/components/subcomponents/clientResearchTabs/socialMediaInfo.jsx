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
import ResearchSocialMediaOpen from './clientResearchOpen/socialMediaInfoOpen';

const SocialMediaInfo = ({item, open}) => {
  
  const [clientItem, setClientItem] = useState(item);
  const[loader, setLoader] = useState(false);
  const[openModal, setOpenModal] = useState(false);
  const[empId, setEmpId] = useState("");
  const [blueSky, setBlueSky] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [facebook, setFacebook] = useState("");
  const [youtube, setYoutube] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [pinterest, setPinterest] = useState("");
  const [editSocialMedia, setEditSocialMedia] = useState(false);


   useEffect(()=>{
    
   }, [open, loader]);


  

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (editSocialMedia) {
      const formData = new FormData();
      formData.append("instagram", instagram);
      formData.append("tiktok", tiktok);
      formData.append("linkedin", linkedin);
      formData.append("twitter", twitter);
      formData.append("facebook", facebook);
      formData.append("youtube", youtube);
      formData.append("pinterest", pinterest);
      formData.append("blueSky", blueSky);
      
      await axios
        .patch(`${apiPath.prodPath}/api/clients/addResearchSocialMedia/${item._id}`, formData)
        .then((res) => {
          Swal.fire({
            icon: "success",
            text: "Client Social Media Info Updated Successfully",
          });
          setBlueSky("");
          setInstagram("");
          setLinkedin("");
          setTwitter("");
          setFacebook("");
          setYoutube("");
          setTiktok("");
          setPinterest("");
          setEditSocialMedia(false);
         



        })
        .catch((err) => {
          console.log(err);
          Swal.fire({
            icon: "error",
            text: "Something went wrong with the editing Social Media Info",
          });
          setEditClientTask(false);
        });

    }else{
      const formData = new FormData();
      
      formData.append("instagram", instagram);
      formData.append("tiktok", tiktok);
      formData.append("linkedin", linkedin);
      formData.append("twitter", twitter);
      formData.append("facebook", facebook);
      formData.append("youtube", youtube);
      formData.append("pinterest", pinterest);
      formData.append("blueSky", blueSky);
      
      await axios
        .patch(`${apiPath.prodPath}/api/clients/addResearchSocialMedia/${item._id}`, formData)
        .then((res) => {
          Swal.fire({
            icon: "success",
            text: "Client Social Media Info added Successfully",
          });
          setBlueSky("");
          setInstagram("");
          setLinkedin("");
          setTwitter("");
          setFacebook("");
          setYoutube("");
          setTiktok("");
          setPinterest("");
          setEditSocialMedia(false);
          
        })
        .catch((err) => {
          console.log(err);
          Swal.fire({
            icon: "error",
            text: "Something went wrong with the adding Social Media Info",
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

  return (
        <>
      <form
            onSubmit={handleUpload}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2 mt-8 mb-8"
             >
            <p>Social Media</p>
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]"> 
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Blue Sky</label>
                <input
                  type='text'
                  value={blueSky}
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] h-[42px]"
                  onChange={(e) => setBlueSky(e.target.value)}
                  name="Blue Sky"
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Instagram</label>
                <input
                  type="text"
                  value={instagram}
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  onChange={(e)=> setInstagram(e.target.value)}
                  name="Instagram"
                />
              </div>
            </div>
            
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Facebook</label>
                <input
                  type="text"
                  value={facebook}
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  onChange={(e) => setFacebook(e.target.value)}
                  name="Facebook"
                />
              </div>
                <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Youtube</label>
                <input
                  type="text"
                  value={youtube}
                  className="p-2  border-[#452C95] rounded-[8px]
                  focus-within:outline-none border-[1px] bg-[#191526]"
                  onChange={(e) => setYoutube(e.target.value)}
                  name="Youtube"
                />
              </div>
            </div>

            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
                <div className="flex flex-col gap-2 w-1/2">
                  <label className="font-satoshi text-md">Pinterest</label>
                  <input
                    type="text"
                    value={pinterest}
                    className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                    onChange={(e) => setPinterest(e.target.value)}
                    name="Pinterest"
                  />
                </div>
                <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Tiktok</label>
                <input
                  type='text'
                  value={tiktok}
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] h-[42px]"
                  onChange={(e) => setTiktok(e.target.value)}
                  name="Tiktok"
                />
              </div>
            </div>
            

            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Twitter/X</label>
                <input
                  type='text'
                  value={twitter}
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] h-[42px]"
                  onChange={(e) => setTwitter(e.target.value)}
                  name="Twitter"
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">LinkedIn</label>
                <input
                  type='text'
                  value={linkedin}
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] h-[42px]"
                  onChange={(e) => setLinkedin(e.target.value)}
                  name="LinkedIn"
                />
                </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={editSocialMedia ? `Edit` : `Save`}
              />
            
            </div>
          
      
          </form>
          {
            
      <Table className="bg-[#231C46] rounded-[12px] font-satoshi">
        <TableCaption>Social Media Research</TableCaption>
        <TableHeader>
          <TableRow className="w-fit, h-[58px] font-satoshi text-lg text-[#E1C9FF]">
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Company Name</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>BlueSky</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Twitter</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Instagram</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>LinkedIn</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Facebook</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>TikTok</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>YouTube</TableHead>
            <TableHead className="text-[#E1C9FF]" style={{ minWidth: 100 }}>Pinterest</TableHead>
            <TableHead className="text-[#E1C9FF]" >Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
           
             <TableRow className="w-fit, h-[72px] bg-[#2D245B] border-[1px] border-[#452C95]" key={clientItem._id}>
              <TableCell className="font-satoshi font-medium text-#fff">
                {clientItem.companyName}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {clientItem.socialMedia.blueSky}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {clientItem.socialMedia.twitter}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {clientItem.socialMedia.instagram}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {clientItem.socialMedia.linkedin}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {clientItem.socialMedia.facebook}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {clientItem.socialMedia.tiktok}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {clientItem.socialMedia.youtube}
              </TableCell>
              <TableCell className="font-satoshi font-medium text-#fff">
                {clientItem.socialMedia.pinterest}
              </TableCell>
              <TableCell>
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
                      setEmpId(clientItem._id);
                      setEditSocialMedia(true);
                      setBlueSky(clientItem.socialMedia.blueSky);
                      setInstagram(clientItem.socialMedia.instagram);
                      setLinkedin(clientItem.socialMedia.linkedin);
                      setTwitter(clientItem.socialMedia.twitter);
                      setFacebook(clientItem.socialMedia.facebook);
                      setYoutube(clientItem.socialMedia.youtube);
                      setTiktok(clientItem.socialMedia.tiktok);
                      setPinterest(clientItem.socialMedia.pinterest);
                      setTikTok(clientItem.socialMedia.tiktok);

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
                    <ResearchSocialMediaOpen
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

export default SocialMediaInfo;
