"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Filter, X } from "lucide-react";

export default function ContactFilters({ filters, onFilterChange, totalContacts }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== localFilters.search) {
        const newFilters = { ...localFilters, search: searchTerm };
        setLocalFilters(newFilters);
        onFilterChange(newFilters);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleLifecycleToggle = (stage) => {
    const newStages = localFilters.lifecycleStage.includes(stage)
      ? localFilters.lifecycleStage.filter((s) => s !== stage)
      : [...localFilters.lifecycleStage, stage];
    
    const newFilters = { ...localFilters, lifecycleStage: newStages };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleLeadStatusToggle = (status) => {
    const newStatuses = localFilters.leadStatus.includes(status)
      ? localFilters.leadStatus.filter((s) => s !== status)
      : [...localFilters.leadStatus, status];
    
    const newFilters = { ...localFilters, leadStatus: newStatuses };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      search: "",
      lifecycleStage: [],
      leadStatus: [],
      owner: "",
    };
    setSearchTerm("");
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const activeFilterCount = 
    (localFilters.lifecycleStage?.length || 0) + 
    (localFilters.leadStatus?.length || 0) + 
    (localFilters.owner ? 1 : 0);

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search contacts by name, email, company..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 bg-[#1A1625] border-[#2D2640] text-white placeholder:text-gray-500"
          />
        </div>
        <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-[#7C3AED] text-gray-100 hover:bg-[#1F1833]"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-[#7C3AED] text-white">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-[#1A1625] border-[#2D2640] text-white p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filter Contacts</h3>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-gray-400 hover:text-white h-auto p-1"
                  >
                    Clear all
                  </Button>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-2 block">
                  Lifecycle Stage
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "subscriber",
                    "lead",
                    "marketingQualifiedLead",
                    "salesQualifiedLead",
                    "opportunity",
                    "customer",
                  ].map((stage) => (
                    <Badge
                      key={stage}
                      onClick={() => handleLifecycleToggle(stage)}
                      className={`cursor-pointer ${
                        localFilters.lifecycleStage.includes(stage)
                          ? "bg-[#7C3AED] text-white"
                          : "bg-[#2D2640] text-gray-300"
                      }`}
                    >
                      {stage.replace(/([A-Z])/g, " $1").trim()}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-2 block">
                  Lead Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "new",
                    "open",
                    "inProgress",
                    "connected",
                    "unqualified",
                    "attemptedToContact",
                  ].map((status) => (
                    <Badge
                      key={status}
                      onClick={() => handleLeadStatusToggle(status)}
                      className={`cursor-pointer ${
                        localFilters.leadStatus.includes(status)
                          ? "bg-[#7C3AED] text-white"
                          : "bg-[#2D2640] text-gray-300"
                      }`}
                    >
                      {status.replace(/([A-Z])/g, " $1").trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-400">Active filters:</span>
          
          {localFilters.lifecycleStage.map((stage) => (
            <Badge
              key={`lifecycle-${stage}`}
              className="bg-[#2D2640] text-gray-300 pr-1"
            >
              Lifecycle: {stage.replace(/([A-Z])/g, " $1").trim()}
              <button
                onClick={() => handleLifecycleToggle(stage)}
                className="ml-1 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {localFilters.leadStatus.map((status) => (
            <Badge
              key={`status-${status}`}
              className="bg-[#2D2640] text-gray-300 pr-1"
            >
              Status: {status.replace(/([A-Z])/g, " $1").trim()}
              <button
                onClick={() => handleLeadStatusToggle(status)}
                className="ml-1 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}