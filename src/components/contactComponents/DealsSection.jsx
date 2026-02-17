"use client";

import React, { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { REMOVE_DEAL } from "@/graphql/contactMutations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  DollarSign,
  Calendar,
  TrendingUp,
  MoreVertical,
  Trash2,
  Edit,
  Edit2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import AddDealDrawer from "./AddDealDrawer";
import Swal from "sweetalert2";
import moment from "moment";

export default function DealsSection({ contact, onUpdate }) {
  const [addDealOpen, setAddDealOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [deal, setDeal] = useState({});

  const deals = contact.deal || [];

  const [removeDeal] = useMutation(REMOVE_DEAL, {
    onCompleted: (result) => {
      if (result.removeDeal.success) {
        Swal.fire("Deleted", "Deal removed successfully", "success");
        onUpdate();
      }
    },
    onError: (err) => {
      Swal.fire("Error", err.message || "Failed to remove deal", "error");
    },
  });

  const getDealStageColor = (stage) => {
    const colors = {
      appointmentScheduled: "bg-blue-500",
      qualifiedToBuy: "bg-indigo-500",presentationScheduled: "bg-purple-500",
      decisionMakerBoughtIn: "bg-pink-500",
      contractSent: "bg-orange-500",
      closedWon: "bg-green-500",
      closedLost: "bg-red-500",
      };
return colors[stage] || "bg-gray-500";
};
const formatCurrency = (amount, currency = "USD") => {
return new Intl.NumberFormat("en-US", {
style: "currency",
currency: currency,
}).format(amount);
};
const handleDeleteDeal = async (dealId) => {
const result = await Swal.fire({
title: "Are you sure?",
text: "This will remove the deal from this contact.",
icon: "warning",
showCancelButton: true,
confirmButtonColor: "#7C3AED",
cancelButtonColor: "#6B7280",
confirmButtonText: "Yes, remove it",
});
if (result.isConfirmed) {
  removeDeal({
    variables: {
      contactId: contact._id,
      dealId,
    },
  });
}}

const handleEditDeal = async(deal) => {
  setEdit(true);
  setDeal(deal);
  setAddDealOpen(true);
}

return (
      <div className="bg-[#231C46] rounded-lg border border-[#2D2640] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Deals</h2>
            <p className="text-sm text-gray-400 mt-1">
              {deals.length} {deals.length === 1 ? "deal" : "deals"}
            </p>
          </div>
        <Button
          onClick={() => setAddDealOpen(true)}
          className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
          >
          <Plus className="h-4 w-4 mr-2" />
            Add Deal
        </Button>
    </div>
  <div className="space-y-4">
    {deals.length === 0 ? (
      <div className="text-center py-12">
        <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 mb-4">No deals yet</p>
        <Button
          onClick={() => setAddDealOpen(true)}
          className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create First Deal
        </Button>
      </div>
    ) : (
      deals.map((deal, index) => (
        <Card
          key={deal.dealId || index}
          className="bg-[#0F0A1F] border-[#2D2640] p-4 hover:border-[#7C3AED] transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">{deal.name}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  className={`${getDealStageColor(deal.stage)} text-white`}
                >
                  {deal.stage.replace(/([A-Z])/g, " $1").trim()}
                </Badge>
                {deal.isPrimary && (
                  <Badge
                    variant="outline"
                    className="text-yellow-400 border-yellow-600"
                  >
                    Primary
                  </Badge>
                )}
                {deal.role && (
                  <Badge
                    variant="outline"
                    className="text-gray-300 border-gray-600"
                  >
                    {deal.role}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="flex items-center text-white font-bold text-lg">
                  {formatCurrency(deal.amount, deal.currency)}
                </div>
                {deal.probability && (
                  <p className="text-xs text-gray-400">
                    {deal.probability}% probability
                  </p>
                )}
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
                    onClick={() => handleDeleteDeal(deal.dealId)}
                    className="text-red-400"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleEditDeal(deal)}
                    className="text-gray-600"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 mb-1">Close Date</p>
              <div className="flex items-center text-white">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                {moment(deal.closeDate).format("MM-DD-YYYY")}
              </div>
            </div>
          </div>

          {deal.createdAt && (
            <p className="text-xs text-gray-500 mt-3">
              Created{" "}
              {formatDistanceToNow(new Date(deal.createdAt), {
                addSuffix: true,
              })}
            </p>
          )}
        </Card>
      ))
    )}
  </div>

  <AddDealDrawer
    edit={edit}
    deal={deal}
    open={addDealOpen}
    onClose={() => setAddDealOpen(false)}
    contactId={contact._id}
    onSuccess={() => {
      setAddDealOpen(false);
      onUpdate();
    }}
  />
</div>
);
}