"use client";

import React, { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  RefreshCw,
  Loader2,
  Link2,
  Unlink,
  ExternalLink,
} from "lucide-react";
import { useTaskClientInfo, disconnectTaskFromClient } from "@/hooks/useTaskClient";
import ConnectClientDrawer from "../drawers/ConnectClientDrawer";
import Swal from "sweetalert2";

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="w-4 h-4 text-[#7C3AED] mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] text-gray-600 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-white mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

export default function TaskClientTab({ item }) {
  const taskId = item?._id;
  const { connected, client, isLoading, mutate } = useTaskClientInfo(taskId);
  const [connectOpen, setConnectOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const refresh = useCallback(() => mutate(), [mutate]);

  const handleDisconnect = async () => {
    const result = await Swal.fire({
      icon: "warning",
      text: "Disconnect this client from the task?",
      showCancelButton: true,
      confirmButtonText: "Yes, disconnect",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;

    setDisconnecting(true);
    try {
      await disconnectTaskFromClient(taskId);
      Swal.fire({ icon: "success", text: "Client disconnected.", timer: 1500, showConfirmButton: false });
      refresh();
    } catch {
      Swal.fire({ icon: "error", text: "Failed to disconnect." });
    } finally {
      setDisconnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 text-[#7C3AED] animate-spin" />
        <p className="text-gray-400 text-sm">Loading client info...</p>
      </div>
    );
  }

  if (!connected || !client) {
    return (
      <div className="bg-[#231C46] rounded-lg border border-[#2D2640] p-6">
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[rgba(127,86,217,0.12)] flex items-center justify-center">
            <Building2 className="w-7 h-7 text-[#7C3AED]" />
          </div>
          <div className="text-center">
            <h3 className="text-white font-semibold text-lg">No Client Connected</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-xs">
              Connect this task to a client to track it under their profile.
            </p>
          </div>
          <Button
            onClick={() => setConnectOpen(true)}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white mt-2"
          >
            <Link2 className="h-4 w-4 mr-2" /> Connect Client
          </Button>
        </div>

        <ConnectClientDrawer
          open={connectOpen}
          onClose={() => setConnectOpen(false)}
          taskId={taskId}
          onConnected={refresh}
        />
      </div>
    );
  }

  // Client is connected — show info card
  const initials = (client.clientName || "?")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const location = [client.city, client.state, client.zipCode].filter(Boolean).join(", ");

  return (
    <div className="bg-[#231C46] rounded-lg border border-[#2D2640] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-white">Connected Client</h2>
        <div className="flex items-center gap-2">
          <Button onClick={refresh} size="sm" variant="outline" className="border-[#2D2640] text-gray-400 hover:bg-[#2D2640] hover:text-white bg-transparent">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Card className="bg-[#0F0A1F] border-[#2D2640] p-5">
        {/* Company header */}
        <div className="flex items-center gap-4 mb-5 pb-4 border-b border-[#2D2640]">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center text-white font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-lg truncate">{client.clientName}</h3>
            {client.industry && (
              <p className="text-xs text-gray-500 mt-0.5">{client.industry}</p>
            )}
          </div>
          {client.status && (
            <span className="text-[11px] px-3 py-1 rounded-full bg-[rgba(127,86,217,0.15)] border border-[rgba(127,86,217,0.35)] text-[#B797FF] flex-shrink-0">
              {client.status}
            </span>
          )}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <InfoRow icon={Building2} label="Contact" value={client.clientName} />
          <InfoRow icon={Mail} label="Email" value={client.email} />
          <InfoRow icon={Phone} label="Phone" value={client.phone} />
          <InfoRow icon={MapPin} label="Location" value={location} />
          <InfoRow icon={Globe} label="Website" value={client.websiteAddress} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[#2D2640]">
          <Button
            onClick={handleDisconnect}
            disabled={disconnecting}
            size="sm"
            variant="outline"
            className="border-red-800 text-red-400 hover:bg-red-900/20 hover:text-red-300 bg-transparent"
          >
            {disconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Unlink className="h-3.5 w-3.5 mr-1.5" />}
            Disconnect
          </Button>
        </div>
      </Card>
    </div>
  );
}
