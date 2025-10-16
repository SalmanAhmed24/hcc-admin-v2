"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import "./style.scss";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "@/store/store";
import Link from "next/link";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import TuneIcon from "@mui/icons-material/Tune";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TaskIcon from '@mui/icons-material/Task';
import { Button } from "./button";
import { LogOutIcon } from "lucide-react";
import { Email, EventBusy } from "@mui/icons-material";


function AppSideBar() {
  const router = useRouter();
  const pathname = usePathname();
  const storeUser = useAuthStore((state) => state.logout);

  return (
    <Sidebar className="cus-style-sidebar rounded-r-[30px] bg-[#2D245B] w-[280px] border-[1px] z-30">
      <SidebarHeader className="p-10 ml-[35px] w-[220px] border-b-2 flex flex-col items-center pt-[31px]">
        <Image src={"/logo.png"} width={59} height={59}  alt="HCC"/>
      </SidebarHeader>
      <SidebarContent className="pt-3 pb-3 pl-10 pr-10 font-satoshi text-sm">
        <Link
          href={"/"}
          className={
            pathname == "/" ? "active-link pt-3 pb-3 pl-[30px] text-center flex flex-row items-end gap-4" 
            : "text-[#E1C9FF] pt-3 pb-3 pl-[30px] text-center flex flex-row items-end gap-4"
          }
        >
          <DashboardIcon /> Dashboard
        </Link>
        {/* <Link
          href={"/employees"}
          className={
            pathname == "/employees"
              ? "active-link pt-3 pb-3 pl-[30px] text-center flex flex-row items-end gap-4"
              : "text-[#E1C9FF] pt-3 pl-[30px] pb-3 text-center flex flex-row items-end gap-4"
          }
        >
          <PeopleOutlineIcon /> Employees
        </Link> */}
        <Link
          href={"/clients"}
          className={
            pathname == "/clients"
              ? "active-link pt-3 pb-3 pl-[30px] text-center flex flex-row items-end gap-4"
              : "text-[#E1C9FF] pt-3 pb-3 pl-[30px] text-center flex flex-row items-end gap-4"
          }
        >
          <Diversity3Icon /> Leads/Clients
        </Link>
        <Link
          href={"/settings"}
          className={
            pathname == "/settings"
              ? "active-link pt-3 pb-3 pl-[30px] text-center flex flex-row items-end gap-4"
              : "text-[#E1C9FF] pt-3 pb-3 pl-[30px] text-center flex flex-row items-end gap-4"
          }
        >
          <TuneIcon /> Settings
        </Link>
        <Link
          href={"/sales"}
          className={
            pathname == "/sales"
              ? "active-link pt-3 pb-3 pl-[30px] text-center flex flex-row items-end gap-4"
              : "text-[#E1C9FF] pt-3 pb-3 pl-[30px] text-center flex flex-row items-end gap-4"
          }
        >
          <MonetizationOnIcon /> Sales
        </Link>
        <Link
          href={"/PurchaseSales"}
          className={
            pathname == "/PurchaseSales"
              ? "active-link pt-3 pb-3 pl-[30px] text-center flex flex-row items-end gap-4"
              : "text-[#E1C9FF] pt-3 pb-3 pl-[30px] text-center flex flex-row items-end gap-4"
          }
        >
          <EventBusy /> Product & Services
        </Link>
        {/* <Link
          href={"/clientResearch"}
          className={
            pathname == "/clientResearch"
              ? "active-link pt-3 pb-3 pl-[30px] text-center flex flex-row items-end gap-4"
              : "text-[#E1C9FF] pt-3 pb-3 pl-[30px] text-center flex flex-row items-end gap-4"
          }
        >
          <EventBusy /> Client Research
        </Link> */}
        <Link
          href={"/tasks"}
          className={
            pathname == "/tasks"
              ? "active-link pt-3 pb-3 pl-[30px] text-center flex flex-row items-end gap-4"
              : "text-[#E1C9FF] pt-3 pb-3 pl-[30px] text-center flex flex-row items-end gap-4"
          }
        >
          <TaskIcon /> Tasks
        </Link>
        <Link
          href={"/Mailing"}
          className={
            pathname == "/Mailing"
              ? "active-link pt-3 pb-3 pl-[30px] text-center flex flex-row items-end gap-4"
              : "text-[#E1C9FF] pt-3 pb-3 pl-[30px] text-center flex flex-row items-end gap-4"
          }
        >
          <Email /> Mailing
        </Link>
        <Link
          href={"/businesslistings"}
          className={
            pathname == "/businesslistings"
              ? "active-link pt-3 pb-3 pl-[30px] text-center flex flex-row items-end gap-4"
              : "text-[#E1C9FF] pt-3 pb-3 pl-[30px] text-center flex flex-row items-end gap-4"
          }
        >
          <Email /> Business Listings
        </Link>
      </SidebarContent>
      <SidebarFooter className="pl-10 pb-10">
        <button className="ml-[30px]">
          <LogOutIcon className="text-[#E1C9FF] pt-3 pb-3 pl-[30px] text-center flex flex-row items-end gap-4 bg-[#2D245B]" />
          <Link
            href={"/login"}
            className="text-[#E1C9FF] pt-3 pb-3 pl-[30px] font-satoshi text-center flex flex-row items-end gap-4 bg-[#2D245B] cursor-pointer hover:text-[#FFF0F5] hover:font-extrabold hover:ease-in-out hover:duration-300"
            onClick={() => {
              router.push("/login");
              storeUser();
            }}
          >
            Log Out
          </Link>
        </button>
        {/* <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                router.push("/login");
                storeUser();
              }}
            >
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSideBar;
