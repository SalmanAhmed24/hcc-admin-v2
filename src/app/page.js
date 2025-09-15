"use client";
import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import useStore from "@/store/store";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSideBar from "@/components/ui/app-sidebar";
import useAuthStore from "@/store/store";
import Navbar from "@/components/ui/Navbar";
import NewClientWidget from "@/components/dashboardWidgets/AccountExecutive/newClientWidget";
import axios from "axios";
import { apiPath } from "@/utils/routes";
import Swal from "sweetalert2";
import ResearchCompleteClient from "@/components/dashboardWidgets/AccountExecutive/reseachCompleteAcc";
import TaskAccordion from "@/components/dashboardWidgets/AccountExecutive/newTaskAccordion";





export default function Home() {
  const isUserLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const loggedInUser = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [clientItem, setClientItem] = useState([]);
  const [loader, setLoader] = useState(false);
  
  // const newClientData = async () => {
  // // setLoader(true);
  //    axios
  //     .get(`${apiPath.prodPath}/api/clients/allclients`)
  //     .then((res) => {
  //       setClientItem(res.data);
  //       // setLoader(false);
  //       Swal.fire({ 
  //         icon: "success",
  //         text: "Data refreshed successfully",
  //       });
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       Swal.fire({
  //         icon: "error",
  //         text: "Something went wrong with the data fetching",
  //       });
  //       // setLoader(false);
  //     });
  // };

  useEffect(() => {
  if (!hasHydrated) return;

  if (!isUserLoggedIn) {
    router.push("/login");
  }
//  newClientData();

}, [isUserLoggedIn, hasHydrated]);

if (!user){ 
  if (!isUserLoggedIn) {
    router.push("/login");
  }
  return <div>Redirecting...</div>;
}

console.log("##$$", loggedInUser);



// newClientData();

  return (
    
    <div className="flex flex-row w-full gap-5">
      <section className="w-1/6">
        <SidebarProvider>
          <AppSideBar />
        </SidebarProvider>
      </section>
      <section className="w-4/5 h-dvh pt-5 pb-5 home-sec bg-[#191526]">
        <Navbar/>
        <div className="w-full h-full p-5 flex flex-col justify-center align-middle main-inner-home">
          <h1 className="text-center text-2xl font-bold main-heading">
            {/* <NewClientWidget user={user} /> */}
          </h1>
          {user?.user.role === "Business Growth Consultant" || "Admin" || "SuperUser" ? (
            <main className="flex flex-col justify-start items-center w-full h-dvh gap-5">
            <NewClientWidget user={user} client={clientItem} />
            <ResearchCompleteClient user ={user} client = {clientItem}/>
            <TaskAccordion user = {user} client = {clientItem}/>
            </main>
            
          ) : null}
        </div>
      </section>
    </div>
  );
}
