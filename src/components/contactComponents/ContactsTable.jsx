"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Mail, Phone, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Select } from "../ui/select";
import { Checkbox } from "../ui/checkbox";

export default function ContactsTable({
  contacts,
  loading,
  pagination,
  onPageChange,
  onRefresh,
}) {
  const router = useRouter();
  const [selectedContacts, setSelectedContacts] = React.useState([]);

  const getLifecycleBadgeColor = (stage) => {
    const colors = {
      lead: "bg-blue-500",
      marketingQualifiedLead: "bg-purple-500",
      salesQualifiedLead: "bg-orange-500",
      opportunity: "bg-yellow-500",
      customer: "bg-green-500",
      subscriber: "bg-gray-500",
    };
    return colors[stage] || "bg-gray-500";
  };

  const handleRowClick = (contactId) => {
    router.push(`/contacts/${contactId}`);
  };

  if (loading) {
    return (
      <div className="bg-[#1A1625] rounded-lg border border-[#2D2640] p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-[#7C3AED]" />
          <span className="ml-2 text-gray-400">Loading contacts...</span>
        </div>
      </div>
    );
  }

  const handleCheckboxChange = (contactId) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  return (
    <div className="bg-[#231C46] rounded-lg border border-[#2D2640]">
      <div className="flex items-center justify-between p-4 border-b border-[#2D2640]">
        <div className="text-sm text-gray-400">
          Showing {contacts.length} of {pagination.totalItems} contacts
        </div>
        <Button
          onClick={onRefresh}
          variant="ghost"
          size="sm"
          className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table className="bg-[#231C46] rounded-[12px] font-satoshi">
          <TableHeader>
            <TableRow className="w-fit, h-[58px] font-satoshi text-lg text-[#E1C9FF]">
              <TableHead className="text-[#E1C9FF]">Select Item</TableHead>
              <TableHead className="text-[#E1C9FF]">Name</TableHead>
              <TableHead className="text-[#E1C9FF]">Email</TableHead>
              <TableHead className="text-[#E1C9FF]">Phone</TableHead>
              <TableHead className="text-[#E1C9FF]">Company</TableHead>
              <TableHead className="text-[#E1C9FF]">Lifecycle Stage</TableHead>
              <TableHead className="text-[#E1C9FF]">Lead Status</TableHead>
              <TableHead className="text-[#E1C9FF]">Last Activity</TableHead>
              <TableHead className="text-[#E1C9FF]">Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-12 text-gray-400"
                >
                  No contacts found. Add your first contact to get started.
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => (
                <TableRow
                  key={contact._id}
                  onClick={() => handleRowClick(contact._id)}
                  className="border-[#2D2640] hover:bg-[#1F1833] cursor-pointer transition-colors"
                > 
                  <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox 
                    checked={selectedContacts.includes(contact._id)}
                    onCheckedChange={() => handleCheckboxChange(contact._id)}
                    className="cursor-pointer border-white text-lg" 
                  />
                </TableCell>
                  <TableCell className="font-medium text-white">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-[#7C3AED] flex items-center justify-center text-white text-sm font-semibold">
                        {contact.basicInfo?.firstName?.charAt(0)}
                        {contact.basicInfo?.lastName?.charAt(0)}
                      </div>
                      <div>
                        <div>
                          {contact.basicInfo?.firstName}{" "}
                          {contact.basicInfo?.lastName}
                        </div>
                        <div className="text-xs text-gray-400">
                          {contact.professional?.jobTitle || "No title"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      {contact.basicInfo?.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      {contact.basicInfo?.phone || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      {contact.professional?.company?.name || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${getLifecycleBadgeColor(
                        contact.lifecycle?.stage
                      )} text-white border-0`}
                    >
                      {contact.lifeCycle?.stage?.replace(/([A-Z])/g, " $1") ||
                        "Lead"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-gray-300 border-gray-600">
                      {contact.lifeCycle?.leadStatus || "New"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300 text-sm">
                    {contact.intelligence?.lastActivityDate
                      ? formatDistanceToNow(
                          new Date(contact.intelligence.lastActivityDate),
                          { addSuffix: true }
                        )
                      : "No activity"}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {contact.metadata?.owner?.firstName}{" "}
                    {contact.metadata?.owner?.lastName}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-[#2D2640]">
          <div className="text-sm text-gray-400">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              variant="outline"
              size="sm"
              className="border-[#2D2640] text-gray-300 hover:bg-[#1F1833]"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              variant="outline"
              size="sm"
              className="border-[#2D2640] text-gray-300 hover:bg-[#1F1833]"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}