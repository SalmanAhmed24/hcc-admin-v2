"use client";

import React, { useState } from "react";
import { InputAdornment, TextField, IconButton, Drawer } from "@mui/material";
import { NotebookTabsIcon, Search, SearchIcon } from "lucide-react";
import { Settings, Task } from "@mui/icons-material";
import Link from "next/link";
import Image from "next/image";
import useAuthStore from "@/store/store";
import TaskNavTab from "../subcomponents/drawers/taskDrawer";
import { Bell } from "lucide-react";
/* import Notifications from "@/components/common/Notifications"; */
import { useNotifications } from "../contexts/NotificationContext";
import Notifications from "../notifications";
const Navbar = ({ onSearch }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const handleSearch = () => {
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <div className="flex flex-row justify-center">
      <section className="bg-[#191526] w-['90%'] h-[75px] flex flex-row items-center border-[2px] rounded-[128px] ml-[40px] mt-[23px]">
        <div className="flex flex-row items-center">
          <SearchIcon
            onClick={handleSearch}
            className="text-white ml-[19.74px] pt-2 pb-[10px] cursor-pointer h-[44px]  w-[40px] rounded-l-full border-none bg-[#2D245B]"
          >
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

        <div className="mr-4 ml-2 justify-center flex flex-row gap-4">
          <Link className="h-[24px] w-[24px] text-[#2D245B]" href="/notes">
            <NotebookTabsIcon />
          </Link>
          <Link href="/settings" className="h-[24px] w-[24px]  text-[#2D245B]">
            <Settings />
          </Link>
          <div className="relative">
            <button
              onClick={() => setNotifOpen(true)}
              className="relative rounded-full  hover:bg-[#EAE6FF] transition"
            >
              <Bell className="text-[#2D245B] h-[24px] w-[24px]" />

              {/*  Unread badge */}
              {unreadCount > 0 && (
                <span
                  className="
        absolute -top-1 -right-1
        bg-red-500 text-white
        text-[10px] font-bold
        rounded-full px-1.5 py-0.5
        min-w-[16px] text-center
      "
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
        <div className="flex flex-row items-start">
          <Image
            src={
              !user
                ? "/logo.png"
                : user.user.avatar
                  ? user.user.avatar
                  : "/logo.png"
            }
            width={32.96}
            height={32.96}
            className="bg-[#2D245B] rounded-full mr-2"
            alt="Profile"
          />
          <div className="flex flex-col gap-0 mr-10">
            <p className="size-[14px] uppercase font-satoshi w-full mb-1">
              {!user ? null : `${user.user.firstName} ${user.user.secondName}`}
            </p>
            <p className="text-[#DBD1F2] font-satoshi w-full text-sm">
              {!user ? null : `${user.user.email}`}
            </p>
          </div>
        </div>
      </section>
      <TaskNavTab open={open} handleClose={() => setOpen(false)} />
      <Drawer
        anchor="right"
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        PaperProps={{
          sx: {
            width: "420px",
            backgroundColor: "#231C46",
            color: "#fff",
          },
        }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#2D2640]">
            <h2 className="text-lg font-semibold">Notifications</h2>

            <button
              onClick={() => setNotifOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4">
            <Notifications drawer={true} />
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default Navbar;
