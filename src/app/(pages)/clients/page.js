"use client";
import { Button } from "@/components/ui/button";
import { apiPath } from "@/utils/routes";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import React, { useState, useEffect, useCallback } from "react";
import { SkeletonCard } from "@/components/reusable/skeleton-card";
import Swal from "sweetalert2";
import AddCLient from "@/components/subcomponents/drawers/addClient";
import ClientTable from "@/components/subcomponents/tables/clientTable";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/store";
import { Search, X } from "lucide-react";
import Image from "next/image";

const PAGE_SIZE = 15;

const FILTER_OPTIONS = [
  { label: "Name", value: "Name" },
  { label: "Zip Code", value: "zipCode" },
  { label: "State", value: "state" },
  { label: "Status", value: "status" },
  { label: "Territory", value: "territory" },
  { label: "Assigned To", value: "assignedTo" },
  { label: "Territory Manager", value: "territoryManager" },
  { label: "Assigned By", value: "assignedBy" },
];

function ClientPage() {
  const [loader, setLoader] = useState(false);
  const [empModal, setEmpModal] = useState(false);
  const [allEmp, setAllEmp] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const [isFiltered, setIsFiltered] = useState(false);

  const isUserLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isUserLoggedIn) router.push("/login");
  }, [isUserLoggedIn, hasHydrated]);

  const getPersonName = (person) => {
    if (!person) return "";
    if (typeof person === "string") return person;
    if (typeof person === "object") return person.name || person.fullName || "";
    return "";
  };

  const normalizeClient = (client) => ({
    ...client,
    territoryManager: getPersonName(client?.territoryManager),
    assignedTo: client?.assignedTo,
    assignee: getPersonName(client?.assignee),
    assignedBy: getPersonName(client?.assignedBy),
    needCategory: {
      categoryName: client?.needCategory?.categoryName || "",
      categoryCode: client?.needCategory?.categoryCode || "",
      subCategory: {
        subCategoryName: client?.needCategory?.subCategory?.subCategoryName || "",
        subCategoryCode: client?.needCategory?.subCategory?.subCategoryCode || "",
      },
    },
  });

  const normalizeClientsPayload = (payload) => {
    const clients = Array.isArray(payload?.clients)
      ? payload.clients
      : Array.isArray(payload)
        ? payload
        : [];
    return clients.map(normalizeClient);
  };

  const fetchPaginated = useCallback(async (page = 1) => {
    setLoader(true);
    try {
      const res = await axios.get(`${apiPath.prodPath}/api/clients/allclients`, {
        params: { page, limit: PAGE_SIZE },
      });
      setAllEmp(normalizeClientsPayload(res.data));
      setTotalPages(res.data.totalPages || 1);
      setTotalClients(res.data.total || res.data.clients?.length || 0);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", text: "Something went wrong fetching clients." });
    } finally {
      setLoader(false);
    }
  }, []);

  const fetchFiltered = useCallback(async (page = 1) => {
    if (!filterBy || !searchTerm.trim()) return;
    setLoader(true);
    try {
      const res = await axios.get(`${apiPath.prodPath}/api/clients/client/`, {
        params: {
          [filterBy]: searchTerm.trim(),
          page,
          limit: PAGE_SIZE,
        },
      });
      const data = res.data;
      setAllEmp(normalizeClientsPayload(data));
      const pagination = data.pagination || {};
      setTotalPages(pagination.totalPages || 1);
      setTotalClients(pagination.total || data.clients?.length || 0);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", text: "Something went wrong while searching." });
    } finally {
      setLoader(false);
    }
  }, [filterBy, searchTerm]);

  useEffect(() => {
    if (isFiltered) {
      fetchFiltered(currentPage);
    } else {
      fetchPaginated(currentPage);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchPaginated(1);
  }, []);

  const handlePageChange = (_, page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!filterBy || !searchTerm.trim()) {
      Swal.fire({ icon: "warning", text: "Please select a filter and enter a search term." });
      return;
    }
    setIsFiltered(true);
    setCurrentPage(1);
    fetchFiltered(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setFilterBy("");
    setIsFiltered(false);
    setCurrentPage(1);
    fetchPaginated(1);
  };

  const refreshData = (page) => {
    const p = page || currentPage;
    if (isFiltered) {
      fetchFiltered(p);
    } else {
      fetchPaginated(p);
    }
  };

  const addEmp = (data) => {
    axios
      .post(`${apiPath.prodPath}/api/clients/add`, data)
      .then(() => {
        Swal.fire({ icon: "success", text: "Added Successfully" });
        setEmpModal(false);
        refreshData();
      })
      .catch((err) => {
        setEmpModal(false);
        Swal.fire({ icon: "error", text: err.message });
      });
  };

  return (
    <main className="flex flex-col">
      <div className="flex w-full flex-row flex-wrap justify-between">
        <div className="w-full flex flex-row gap-2 mb-6 h-[34px]">
          <Image src="/CustomerSidebar.png" alt="client" width={40} height={31.7} priority />
          <h1 className="font-satoshi font-semibold text-2xl ml-5">Companies</h1>
        </div>

        <div className="flex flex-row gap-3 items-center w-full mb-6">
          <form onSubmit={handleSearch} className="flex flex-row gap-3 flex-1 items-center">
            <div className="relative flex-1 max-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6F618F]" size={16} />
              <input
                type="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 text-white bg-[#1C1634] border border-[rgba(69,44,149,0.5)] h-[40px] w-full rounded-[10px] font-satoshi text-sm outline-none focus:border-[#B797FF] transition-colors"
              />
            </div>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="rounded-[10px] text-white bg-[#1C1634] border border-[rgba(69,44,149,0.5)] h-[40px] w-[180px] px-4 font-satoshi text-sm outline-none focus:border-[#B797FF]"
            >
              <option value="" disabled>Filter by...</option>
              {FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-[10px] h-[40px] px-5 font-satoshi font-semibold text-sm bg-[rgba(127,86,217,0.2)] border border-[rgba(127,86,217,0.35)] text-[#B797FF] hover:bg-[rgba(127,86,217,0.3)] cursor-pointer transition-colors"
            >
              Search
            </button>
          </form>

          {isFiltered && (
            <button
              onClick={handleClearSearch}
              className="flex items-center gap-1.5 rounded-[10px] h-[40px] px-4 font-satoshi text-sm bg-[rgba(127,86,217,0.15)] border border-[rgba(127,86,217,0.3)] text-[#E1C9FF] hover:bg-[rgba(127,86,217,0.25)] cursor-pointer transition-colors"
            >
              <X size={14} />
              Clear
            </button>
          )}

          <div className="ml-auto">
            <Button
              onClick={() => setEmpModal(true)}
              variant="outline"
              className="bg-[#B797FF] text-[#1C1634] font-satoshi font-bold h-[40px] rounded-[10px] hover:bg-[#C9ADFF]"
            >
              <AddIcon className="mr-1" style={{ fontSize: 18 }} />
              Add Lead/Client
            </Button>
          </div>
        </div>
      </div>

      <div>
        {loader ? (
          <SkeletonCard />
        ) : (
          <ClientTable
            refreshData={refreshData}
            allEmp={allEmp}
            currentPage={currentPage}
            totalPages={totalPages}
            totalClients={totalClients}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <AddCLient
        open={empModal}
        handleClose={() => setEmpModal(false)}
        addEmp={(data) => addEmp(data)}
        edit={false}
      />
    </main>
  );
}

export default ClientPage;
