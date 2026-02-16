"use client";

import React, { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_CONTACTS } from "@/graphql/contactQueries";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ContactsTable from "../../../components/contactComponents/ContactsTable";
import AddContactDrawer from "../../../components/contactComponents/AddContactDrawer";
import ContactFilters from "../../../components/contactComponents/ContactsFilter";

export default function ContactsPage() {
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    lifecycleStage: [],
    leadStatus: [],
    owner: "",
  });
  const [page, setPage] = useState(1);
  const limit = 25;
  const { data, loading, error, refetch } = useQuery(GET_CONTACTS, {
    variables: {
      filter: {
        search: filters.search || undefined,
        lifecycleStages:
          filters.lifecycleStage.length > 0 ? filters.lifecycleStage : undefined,
        leadStatuses:
          filters.leadStatus.length > 0 ? filters.leadStatus : undefined,
        owner: filters.owner || undefined,
      },
      sort: { field: "createdAt", order: "desc" },
      pagination: { page, limit },
    },
    fetchPolicy: "cache-and-network",
  });

  const contacts = data?.contacts?.edges?.map((edge) => edge.node) || [];
  const pageInfo = data?.contacts?.pageInfo || {};
  const totalCount = data?.contacts?.totalCount || 0;

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#191526] p-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Contacts</h1>
            <p className="text-gray-400 mt-1">
              Manage your Sales Contacts and Leads
            </p>
          </div>
          <Button
            onClick={() => setAddDrawerOpen(true)}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>
        <ContactFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          totalContacts={totalCount}
        />
        <ContactsTable
          contacts={contacts}
          loading={loading}
          pagination={{
            page,
            totalPages: pageInfo.totalPages || 1,
            totalItems: totalCount,
          }}
          onPageChange={setPage}
          onRefresh={() => refetch()}
        />
        <AddContactDrawer
          open={addDrawerOpen}
          onClose={() => setAddDrawerOpen(false)}
          onSuccess={() => {
            setAddDrawerOpen(false);
            refetch();
          }}
        />
      </div>
    </div>
  );
}