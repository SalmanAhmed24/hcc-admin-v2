"use client";
import React, { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { REMOVE_TICKET, UPDATE_TICKET } from "@/graphql/contactMutations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  AlertCircle,
  Clock,
  MoreVertical,
  Trash2,
  Edit,
  CheckCircle,
  Edit2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import AddTicketDrawer from "./AddTicketDrawer";
import Swal from "sweetalert2";

export default function TicketsSection({ contact, onUpdate }) {
  const [addTicketOpen, setAddTicketOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [ticket, setTicket] = useState({});

  const tickets = contact.ticket || [];

  const [removeTicket] = useMutation(REMOVE_TICKET, {
    onCompleted: (result) => {
      if (result.removeTicket.success) {
        Swal.fire("Deleted", "Ticket removed successfully", "success");
        onUpdate();
      }
    },
    onError: (err) => {
      Swal.fire("Error", err.message || "Failed to remove ticket", "error");
    },
  });

  const [updateTicket] = useMutation(UPDATE_TICKET, {
    onCompleted: (result) => {
      if (result.updateTicket.success) {
        Swal.fire("Updated", "Ticket updated successfully", "success");
        onUpdate();
      }
    },
    onError: (err) => {
      Swal.fire("Error", err.message || "Failed to update ticket", "error");
    },
  });

  const getStatusColor = (status) => {
    const colors = {
      new: "bg-blue-500",
      inProgress: "bg-yellow-500",
      waiting: "bg-orange-500",
      resolved: "bg-green-500",
      closed: "bg-gray-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-gray-600",
      medium: "bg-blue-600",
      high: "bg-orange-600",
      urgent: "bg-red-600",
    };
    return colors[priority] || "bg-gray-600";
  };

  const handleDeleteTicket = async (ticketId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will remove the ticket from this contact.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7C3AED",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, remove it",
    });

    if (result.isConfirmed) {
      removeTicket({
        variables: {
          contactId: contact._id,
          ticketId,
        },
      });
    }
  };

  const handleQuickStatusUpdate = async (ticketId, newStatus, currentTicket) => {
    updateTicket({
      variables: {
        contactId: contact._id,
        ticketId,
        ticket: {
          subject: currentTicket.subject,
          content: currentTicket.content,
          status: newStatus,
          priority: currentTicket.priority,
          category: currentTicket.category,
          assignedTo: currentTicket.assignedTo?._id || undefined,
        },
      },
    });
  };

  const handleQuickPriorityUpdate = async (ticketId, newPriority, currentTicket) => {
    updateTicket({
      variables: {
        contactId: contact._id,
        ticketId,
        ticket: {
          subject: currentTicket.subject,
          content: currentTicket.content,
          status: currentTicket.status,
          priority: newPriority,
          category: currentTicket.category,
          assignedTo: currentTicket.assignedTo?._id || undefined,
        },
      },
    });
  };

  const handleEditTicket = async(ticket) => {
  setEdit(true);
  setTicket(ticket);
  setAddTicketOpen(true);
}

  return (
    <div className="bg-[#231C46] rounded-lg border border-[#2D2640] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Tickets</h2>
          <p className="text-sm text-gray-400 mt-1">
            {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
          </p>
        </div>
        <Button
          onClick={() => setAddTicketOpen(true)}
          className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Ticket
        </Button>
      </div>

      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No tickets yet</p>
            <Button
              onClick={() => setAddTicketOpen(true)}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Ticket
            </Button>
          </div>
        ) : (
          tickets.map((ticket, index) => (
            <Card
              key={ticket._id || index}
              className="bg-[#0F0A1F] border-[#2D2640] p-4 hover:border-[#7C3AED] transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-white font-semibold">{ticket.subject}</h3>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Select
                      value={ticket.status}
                      onValueChange={(value) =>
                        handleQuickStatusUpdate(ticket.ticketId, value, ticket)
                      }
                    >
                      <SelectTrigger
                        className={`w-32 h-7 text-xs ${getStatusColor(
                          ticket.status
                        )} text-white border-0`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="inProgress">In Progress</SelectItem>
                        <SelectItem value="waiting">Waiting</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={ticket.priority}
                      onValueChange={(value) =>
                        handleQuickPriorityUpdate(ticket.ticketId, value, ticket)
                      }
                    >
                      <SelectTrigger
                        className={`w-28 h-7 text-xs ${getPriorityColor(
                          ticket.priority
                        )} text-white border-0`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>

                    {ticket.category && (
                      <Badge
                        variant="outline"
                        className="text-gray-300 border-gray-600"
                      >
                        {ticket.category}
                      </Badge>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white h-auto p-1"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        handleQuickStatusUpdate(ticket.ticketId, "resolved", ticket)
                      }
                    >
                      <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                      Mark Resolved
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteTicket(ticket.ticketId)}
                      className="text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleEditTicket(ticket)}
                      className="text-gray-600"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {ticket.content && (
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {ticket.content}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm border-t border-[#2D2640] pt-3">
                {ticket.assignedTo && (
                  <div>
                    <p className="text-gray-400 mb-1">Assigned To</p>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-[#7C3AED] flex items-center justify-center text-white text-xs">
                        {ticket.assignedTo.firstName?.charAt(0)}
                        {ticket.assignedTo.secondName?.charAt(0)}
                      </div>
                      <p className="text-white text-sm">
                        {ticket.assignedTo.firstName} {ticket.assignedTo.secondName}
                      </p>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 mb-1">Created</p>
                  <div className="flex items-center text-white">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    {formatDistanceToNow(new Date(ticket.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>

              {ticket.resolvedAt && (
                <div className="mt-3 pt-3 border-t border-[#2D2640]">
                  <p className="text-xs text-green-400 flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    Resolved{" "}
                    {formatDistanceToNow(new Date(ticket.resolvedAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      <AddTicketDrawer
        edit={edit}
        ticket={ticket}
        open={addTicketOpen}
        onClose={() => setAddTicketOpen(false)}
        contactId={contact._id}
        onSuccess={() => {
          setAddTicketOpen(false);
          onUpdate();
        }}
      />
    </div>
  );
}