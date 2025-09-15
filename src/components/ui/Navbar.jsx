"use client";

import React, { useState } from "react";
import { InputAdornment, TextField, IconButton } from "@mui/material";
import { Search, SearchIcon } from "lucide-react";
import { Settings, Task } from "@mui/icons-material";
import Link from "next/link";
import Image from "next/image";
import useAuthStore from "@/store/store";
import TaskNavTab from "../subcomponents/drawers/taskDrawer";
import TaskIcon from '@mui/icons-material/Task';


const Navbar = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const user = useAuthStore((state)=> state.user);
  console.log(user);
  const handleSearch = () => {
    if (onSearch) {
      onSearch(query);
    }
  };
  
  

  return (
    <div className="flex flex-row justify-center">

    <section className="bg-[#191526] w-['90%'] h-[75px] flex flex-row items-center border-[2px] rounded-[128px] ml-[40px] mt-[23px]">
      <div className="flex flex-row items-center">
      <SearchIcon onClick={handleSearch} className="text-white ml-[19.74px] pt-2 pb-[10px] cursor-pointer h-[44px]  w-[40px] rounded-l-full border-none bg-[#2D245B]">
          <Search />
        </SearchIcon>
      <input
      className="w-[454.74px] h-[44px] rounded-r-full bg-[#2D245B] font-satoshi font-bold text-white text-center"
      type="text"
      variant="outlined"
      placeholder="Search for anything ..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      />
      
      </div>
      
        
      <div className="mr-4 ml-2 justify-center flex flex-row gap-1">
        <button className="h-[24px] w-[24px]  mr-4 text-[#2D245B]" onClick={() => setOpen(true)}>
          <TaskIcon />
        </button>
        <Link href="/settings" className="h-[24px] w-[24px]  text-[#2D245B]">
          <Settings/>
        </Link>
      </div>
      <div className="flex flex-row items-start">
        <Image src= {!(user)? "/logo.png" : (user.user.avatar ? user.user.avatar : "/logo.png")} width={32.96} height={32.96} className="bg-[#2D245B] rounded-full mr-2" alt="Profile"/>
      <div className="flex flex-col gap-0 mr-10">
        <p className="size-[14px] uppercase font-satoshi w-full mb-1">{!user ? null: `${user.user.firstName} ${user.user.secondName}`}</p>
        <p className="text-[#DBD1F2] font-satoshi w-full text-sm">{!user ? null: `${user.user.email}`}</p>
      </div>
      </div>
        

    </section>
    <TaskNavTab open={open} handleClose={() => setOpen(false)} />
    </div>
    
  );
};

export default Navbar;
