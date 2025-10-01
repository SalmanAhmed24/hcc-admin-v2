"use client";
import { Button } from "@/components/ui/button";
import { apiPath } from "@/utils/routes";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Swal from "sweetalert2";
import { SkeletonCard } from "@/components/reusable/skeleton-card";
import AddTask from "@/components/subcomponents/drawers/addTask";
import TaskTable from "@/components/subcomponents/tables/taskTable";
import useStore from "@/store/store";
import { useRouter } from "next/navigation";
import Select from "react-select";
import useAuthStore from "@/store/store";
import { Search } from "lucide-react";
import Image from "next/image";
import { ClearAll } from "@mui/icons-material";
import TaskIcon from "@mui/icons-material/Task";

function TasksPage() {
  const [loader, setLoader] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [allTasks, setAllTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("");  
  const [filterOpt, setFilterOpt] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); 
  const [totalPages, setTotalPages] = useState(1);

  function filterOptions() {
    const sorts = [
      'taskStatus',
      // 'assignedTo',
      'taskCategory',
      // 'createdBy',
      // 'dueDate',
      'taskDescription',
      'taskPriority',
    ];
    const options = sorts.map((item)=>{
      const statusOption = {
        label : item,
        value : item,
      }
      return statusOption;
    });
    setFilterOpt(options);
  }

  const isUserLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated) return; 

    if (!isUserLoggedIn) {
      router.push("/login");
    }
  }, [isUserLoggedIn, hasHydrated]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!filterBy || !searchTerm.trim()) {
      Swal.fire({
        icon: "warning",
        text: "Please select a filter and enter a search term.",
      });
      return;
    }

    setLoader(true);
    try {
      
      // let url = `${apiPath.prodPath}/api/tasks/filter`;
      // const params = {};
      
      // if (filterBy === 'dateCreated' || filterBy === 'dueDate') {
        
      //   params[filterBy] = searchTerm;
      // } else {
        
      //   params[filterBy] = searchTerm;
      // }
      
      // const res = await axios.get(url, { params });
      // setAllTasks(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        text: "Something went wrong while fetching search results.",
      });
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
        refreshData(currentPage)
      }, [currentPage]);

  const handlePageChange = (event, page) => {
    setCurrentPage(page); 
  };

  useEffect(() => {
    setLoader(true);
    filterOptions();
    axios
      .get(`${apiPath.prodPath}/api/tasks`)
      .then((res) => {
        setAllTasks(res.data.tasks);
        setTotalPages(res.data.totalPages);
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
  }, []);

  const handleTaskModal = () => {
    setTaskModal(true);
  };
  
  const refreshData = (page=1) => {
    setLoader(true);
    axios
      .get(`${apiPath.prodPath}/api/tasks`, {
         params : {
           page: page,         
           limit: 10,
        }
      })
      .then((res) => {
        setAllTasks(res.data.tasks);
        setTotalPages(res.data.totalPages);
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
  
  const addTask = (data) => {
    axios
      .post(`${apiPath.prodPath}/api/tasks`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        Swal.fire({
          icon: "success",
          text: "Task Added Successfully",
        });
        setTaskModal(false);
        refreshData();
      })
      .catch((err) => {
        setTaskModal(false);
        Swal.fire({
          icon: "error",
          text: `${err.message}`,
        });
      });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setFilterBy("");
    setLoader(true);
    axios
      .get(`${apiPath.prodPath}/api/tasks`)
      .then((res) => {
        setAllTasks(res.data.tasks);
        setTotalPages(res.data.totalPages)
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
  }

  return (
    <main className="flex flex-col">
      <div className="flex w-full flex-row flex-wrap justify-between">
        <div className="w-full flex flex-row gap-2 mb-[24px] h-[34px]">
          <TaskIcon className="text-white" />
          <h1 className="font-satoshi font-semibold text-2xl ml-[20px]">Tasks</h1>
        </div>
        <div className="flex flex-row gap-4 items-start border-none w-full">
          <form onSubmit={handleSearch} className="flex flex-row gap-4 w-full items-center">
          <input
                    type="search"
                    placeholder="  Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-5 text-white bg-[#2D245B] h-[42px] w-[243px] rounded-full font-satoshi"
                  />
              <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="rounded-full text-white bg-[#2D245B] h-[42px] w-[243px] px-5 pr-4 font-satoshi"
                    >
                    <option value="" disabled>Select Filter</option>
                    {filterOpt.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.value}
                      </option>
                    ))}
                    </select>
                  <input
                    type="submit"
                    className="rounded-full w-[99px] h-[42px] font-satoshi font-bold px-3 bg-[#2D245B] text-white hover:bg-gray-500 cursor-pointer"
                  value={"Search"}
                  />                
               
          </form>
          <Button
            onClick={handleClearSearch}
            variant="outline"
            className="bg-[#B797FF] w-[162.2px] h-[42] rounded-[8px] font-satoshi"
          >
            <ClearAll />Clear Search
          </Button>
          <div className="w-3/4 flex flex-row gap-5 justify-end">
          <Button
            onClick={handleTaskModal}
            variant="outline"
            className="bg-[#B797FF] w-[162.2px] h-[42] rounded-[8px] font-satoshi"
          >
            <AddIcon />Add Task
          </Button>
        </div>
      </div>
 
      </div>
      <div className="mt-10">
        {loader ? (
          <SkeletonCard />
        ) : (
          <TaskTable refreshData={refreshData} allTasks={allTasks}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            filterBy={filterBy}
            searchTerm={searchTerm}
            />
        )}
      </div>
      <AddTask
        open={taskModal}
        handleClose={() => setTaskModal(false)}
        addTask={(data) => addTask(data)}
        edit={false}
      />
    </main>
  );
}

export default TasksPage;