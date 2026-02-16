"use client";

import React, { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { DELETE_ACTIVITY } from "@/graphql/contactMutations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Mail,
  Phone,
  Video,
  MessageSquare,
  FileText,
  CheckSquare,
  MoreVertical,
  Trash2,
  Edit2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import AddActivityDrawer from "./AddActivityDrawer";
import Swal from "sweetalert2";

export default function ActivityTimeline({ contact, onUpdate }) {
  const [addActivityOpen, setAddActivityOpen] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState("note");
  const [edit, SetEdit] = useState(false);
  const [activity, setActivity] =useState({});

  let activities = contact.activity || [];
  let sortedActivities = [...activities].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const [deleteActivity] = useMutation(DELETE_ACTIVITY, {
    onCompleted: (result) => {
      if (result.deleteActivity.success) {
        Swal.fire("Deleted", "Activity deleted successfully", "success");
        onUpdate();
      }
    },
    onError: (err) => {
      Swal.fire("Error", err.message || "Failed to delete activity", "error");
    },
  });

  const getActivityIcon = (type) => {
    const icons = {
      note: FileText,
      call: Phone,
      email: Mail,
      meeting: Video,
      task: CheckSquare,
      linkedin_message: MessageSquare,
      sms: MessageSquare,
      whatsapp: MessageSquare,
    };
    const Icon = icons[type] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  const getActivityColor = (type) => {
    const colors = {
      note: "bg-blue-500",
      call: "bg-green-500",
      email: "bg-purple-500",
      meeting: "bg-orange-500",
      task: "bg-yellow-500",
      linkedin_message: "bg-blue-600",
      sms: "bg-pink-500",
      whatsapp: "bg-green-600",
    };
    return colors[type] || "bg-gray-500";
  };

  const handleAddActivity = (type) => {
    setSelectedActivityType(type);
    setAddActivityOpen(true);
  };

  const handleDeleteActivity = async (activityId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the activity.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7C3AED",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it",
    });
    if (result.isConfirmed) {
      deleteActivity({
        variables: {
          contactId: contact._id,
          activityId,
        },
      });
    }
  };

  const handleEditActivity = async(activity) => {
    console.log(activity.type);
    setSelectedActivityType(activity.type);
    SetEdit(true);
    setActivity(activity);
    setAddActivityOpen(true);
  }

  return (
    <div className="bg-[#231C46] rounded-lg border border-[#2D2640] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Activity</h2>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleAddActivity("note")}
            size="sm"
            variant="outline"
            className="border-[#2D2640] text-gray-300 hover:bg-[#6D28D9] bg-[#7C3AED]"
          >
            <FileText className="h-4 w-4 mr-2" />
            Note
          </Button>
          <Button
            onClick={() => handleAddActivity("call")}
            size="sm"
            variant="outline"
            className="border-[#2D2640] text-gray-300 hover:bg-[#6D28D9] bg-[#7C3AED]"
          >
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
          <Button
            onClick={() => handleAddActivity("email")}
            size="sm"
            variant="outline"
            className="border-[#2D2640] text-gray-300 hover:bg-[#6D28D9] bg-[#7C3AED]"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button
            onClick={() => handleAddActivity("meeting")}
            size="sm"
            variant="outline"
            className="border-[#2D2640] text-gray-300 hover:bg-[#6D28D9] bg-[#7C3AED]"
          >
            <Video className="h-4 w-4 mr-2" />
            Meeting
          </Button>
          <Button
            onClick={() => handleAddActivity("task")}
            size="sm"
            className="border-[#2D2640] text-gray-300 hover:bg-[#6D28D9] bg-[#7C3AED] hover:text-black"
          >
            <Plus className="h-4 w-4 mr-2" />
            Activity
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No activities yet</p>
            <Button
              onClick={() => setAddActivityOpen(true)}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Activity
            </Button>
          </div>
        ) : (
         
            sortedActivities.map((activity, index) => (
              <Card
                key={activity._id || index}
                className="bg-[#0F0A1F] border-[#2D2640] p-4"
              >
                <div className="flex gap-4">
                  <div
                    className={`h-10 w-10 rounded-full ${getActivityColor(
                      activity.type
                    )} flex items-center justify-center text-white flex-shrink-0`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className="text-gray-300 border-gray-600 text-xs"
                          >
                            {activity.type}
                          </Badge>
                          {activity.direction && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                activity.direction === "inbound"
                                  ? "text-green-400 border-green-600"
                                  : "text-blue-400 border-blue-600"
                              }`}
                            >
                              {activity.direction}
                            </Badge>
                          )}
                          {activity.status && (
                            <Badge
                              variant="outline"
                              className="text-gray-400 border-gray-600 text-xs"
                            >
                              {activity.status}
                            </Badge>
                          )}
                        </div>

                        {activity.subject && (
                          <h4 className="text-white font-medium mb-1">
                            {activity.subject}
                          </h4>
                        )}

                        {activity.body && (
                          <p className="text-gray-400 text-sm whitespace-pre-wrap line-clamp-3">
                            {activity.body}
                          </p>
                        )}
                        {activity.type === "call" && activity.callDuration && (
                          <p className="text-gray-500 text-xs mt-2">
                            Duration: {Math.floor(activity.callDuration / 60)} min{" "}
                            {activity.callDuration % 60} sec
                            {activity.callOutcome &&
                              ` • Outcome: ${activity.callOutcome}`}
                          </p>
                        )}
                        {activity.type === "meeting" &&
                          activity.meetingLocation && (
                            <p className="text-gray-500 text-xs mt-2">
                              Location: {activity.meetingLocation}
                            </p>
                          )}
                        {activity.type === "task" && activity.taskDueDate && (
                          <p className="text-gray-500 text-xs mt-2">
                            Due:{" "}
                            {new Date(activity.taskDueDate).toLocaleDateString()}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span>
                            {formatDistanceToNow(new Date(activity.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                          {activity.createdBy && (
                            <>
                              <span>•</span>
                              <span>
                                {activity.createdBy.firstName}{" "}
                                {activity.createdBy.lastName}
                              </span>
                            </>
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
                            onClick={() => handleDeleteActivity(activity._id)}
                            className="text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditActivity(activity)}
                            className="text-gray-600"
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {activity.attachments && activity.attachments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#2D2640]">
                        <p className="text-xs text-gray-400 mb-2">
                          Attachments ({activity.attachments.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {activity.attachments.map((file, idx) => (
                            <a
                              key={idx}
                              href={file.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-[#2D2640] text-gray-300 px-2 py-1 rounded hover:bg-[#3D3350] transition-colors"
                            >
                              {file.fileName}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
        )}
      </div>
      <AddActivityDrawer
        edit={edit}
        activity = {activity}
        open={addActivityOpen}
        onClose={() => setAddActivityOpen(false)}
        contactId={contact._id}
        activityType={selectedActivityType}
        onSuccess={() => {
          setAddActivityOpen(false);
          onUpdate();
        }}
      />
    </div>
  );
}