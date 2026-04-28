// "use client";

// import React, { useState, useEffect, useCallback } from "react";
// import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   Mail,
//   Phone,
//   Video,
//   MessageSquare,
//   FileText,
//   CheckSquare,
//   User,
//   RefreshCw,
//   AlertCircle,
//   Loader2,
// } from "lucide-react";
// import { formatDistanceToNow } from "date-fns";
// import moment from "moment";
// import axios from "axios";
// import { apiPath } from "@/utils/routes";

// export default function ClientActivityTimeline({ item }) {
//   const [activities, setActivities] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [totalContacts, setTotalContacts] = useState(0);
//   const [filterType, setFilterType] = useState("all");

//   const fetchClientActivities = useCallback(async () => {
//     if (!item?._id) {
//       setLoading(false); // ← this was missing, causing infinite loading
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const res = await axios.get(
//         `${apiPath.prodPath}/api/clients/${item._id}/activities`
//       );

//       if (res.status === 200) {
//         setActivities(res.data.activities || []);
//         setTotalContacts(res.data.totalContacts || 0);
//       }
//     } catch (err) {
//       console.error("Failed to fetch client activities:", err);
//       setError(
//         err.response?.data?.message || err.message || "Failed to fetch activities"
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [item?._id]);

//   useEffect(() => {
//     fetchClientActivities();
//   }, [fetchClientActivities]);

//   const getActivityIcon = (type) => {
//     const icons = {
//       note: FileText,
//       call: Phone,
//       email: Mail,
//       meeting: Video,
//       task: CheckSquare,
//       linkedin_message: MessageSquare,
//       sms: MessageSquare,
//       whatsapp: MessageSquare,
//     };
//     const Icon = icons[type] || FileText;
//     return <Icon className="h-4 w-4" />;
//   };

//   const getActivityColor = (type) => {
//     const colors = {
//       note: "bg-blue-500",
//       call: "bg-green-500",
//       email: "bg-purple-500",
//       meeting: "bg-orange-500",
//       task: "bg-yellow-500",
//       linkedin_message: "bg-blue-600",
//       sms: "bg-pink-500",
//       whatsapp: "bg-green-600",
//     };
//     return colors[type] || "bg-gray-500";
//   };

//   const activityTypes = ["all", ...new Set(activities.map((a) => a.type))];

//   const filteredActivities =
//     filterType === "all"
//       ? activities
//       : activities.filter((a) => a.type === filterType);

//   const getActivityCount = (type) => {
//     if (type === "all") return activities.length;
//     return activities.filter((a) => a.type === type).length;
//   };

//   const getContactLabel = () => {
//     const contactWord = totalContacts === 1 ? "contact" : "contacts";
//     const activityWord = activities.length === 1 ? "activity" : "activities";
//     return `${activities.length} ${activityWord} across ${totalContacts} ${contactWord}`;
//   };

//   if (loading) {
//     return (
//       <div className="bg-[#231C46] rounded-lg border border-[#2D2640] p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-xl font-semibold text-white">Activity</h2>
//         </div>
//         <div className="flex flex-col items-center justify-center py-16 gap-3">
//           <Loader2 className="h-8 w-8 text-[#7C3AED] animate-spin" />
//           <p className="text-gray-400 text-sm">Loading activities...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-[#231C46] rounded-lg border border-[#2D2640] p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-xl font-semibold text-white">Activity</h2>
//         </div>
//         <div className="flex flex-col items-center justify-center py-16 gap-4">
//           <AlertCircle className="h-10 w-10 text-red-400" />
//           <p className="text-red-400 text-sm text-center">{error}</p>
//           <Button
//             onClick={fetchClientActivities}
//             size="sm"
//             className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
//           >
//             <RefreshCw className="h-4 w-4 mr-2" />
//             Retry
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[#231C46] rounded-lg border border-[#2D2640] p-6">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-4">
//         <div>
//           <h2 className="text-xl font-semibold text-white">Activity</h2>
//           {activities.length > 0 && (
//             <p className="text-xs text-gray-500 mt-0.5">
//               {getContactLabel()}
//             </p>
//           )}
//         </div>
//         <Button
//           onClick={fetchClientActivities}
//           size="sm"
//           variant="outline"
//           className="border-[#2D2640] text-gray-400 hover:bg-[#2D2640] hover:text-white bg-transparent"
//         >
//           <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
//           Refresh
//         </Button>
//       </div>

//       {/* Filter Pills */}
//       {activities.length > 0 && (
//         <div className="flex flex-wrap gap-2 mb-5">
//           {activityTypes.map((type) => (
//             <button
//               key={type}
//               onClick={() => setFilterType(type)}
//               className={[
//                 "px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize",
//                 filterType === type
//                   ? "bg-[#7C3AED] text-white"
//                   : "bg-[#0F0A1F] text-gray-400 border border-[#2D2640] hover:border-[#7C3AED] hover:text-gray-200",
//               ].join(" ")}
//             >
//               {type === "all" ? "All" : type} ({getActivityCount(type)})
//             </button>
//           ))}
//         </div>
//       )}

//       {/* Activities List */}
//       <div className="space-y-4">
//         {filteredActivities.length === 0 ? (
//           <div className="text-center py-12">
//             <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
//             <p className="text-gray-400 mb-1">
//               {activities.length === 0
//                 ? "No activities yet for this client"
//                 : "No " + filterType + " activities found"}
//             </p>
//             {activities.length === 0 && (
//               <p className="text-gray-600 text-sm">
//                 Activities will appear here once contacts linked to this client
//                 have logged interactions.
//               </p>
//             )}
//           </div>
//         ) : (
//           filteredActivities.map((activityItem, index) => (
//             <Card
//               key={activityItem._id || index}
//               className="bg-[#0F0A1F] border-[#2D2640] p-4"
//             >
//               <div className="flex gap-4">
//                 <div
//                   className={[
//                     "h-10 w-10 rounded-full flex items-center justify-center text-white flex-shrink-0",
//                     getActivityColor(activityItem.type),
//                   ].join(" ")}
//                 >
//                   {getActivityIcon(activityItem.type)}
//                 </div>

//                 <div className="flex-1 min-w-0">
//                   {/* Badges */}
//                   <div className="flex flex-wrap items-center gap-2 mb-2">
//                     <Badge
//                       variant="outline"
//                       className="text-gray-300 border-gray-600 text-xs capitalize"
//                     >
//                       {activityItem.type}
//                     </Badge>
//                     {activityItem.direction && (
//                       <Badge
//                         variant="outline"
//                         className={
//                           activityItem.direction === "inbound"
//                             ? "text-green-400 border-green-600 text-xs"
//                             : "text-blue-400 border-blue-600 text-xs"
//                         }
//                       >
//                         {activityItem.direction}
//                       </Badge>
//                     )}
//                     {activityItem.status && (
//                       <Badge
//                         variant="outline"
//                         className="text-gray-400 border-gray-600 text-xs"
//                       >
//                         {activityItem.status}
//                       </Badge>
//                     )}
//                   </div>

//                   {/* Subject */}
//                   {activityItem.subject && (
//                     <h4 className="text-white font-medium mb-1">
//                       {activityItem.subject}
//                     </h4>
//                   )}

//                   {/* Body */}
//                   {activityItem.body && (
//                     <p className="text-gray-400 text-sm whitespace-pre-wrap line-clamp-3">
//                       {activityItem.body}
//                     </p>
//                   )}

//                   {/* Type-specific metadata */}
//                   {activityItem.type === "call" && activityItem.callDuration && (
//                     <p className="text-gray-500 text-xs mt-2">
//                       {"Duration: " +
//                         Math.floor(activityItem.callDuration / 60) +
//                         " min " +
//                         (activityItem.callDuration % 60) +
//                         " sec" +
//                         (activityItem.callOutcome
//                           ? " • Outcome: " + activityItem.callOutcome
//                           : "")}
//                     </p>
//                   )}
//                   {activityItem.type === "meeting" && activityItem.meetingLocation && (
//                     <p className="text-gray-500 text-xs mt-2">
//                       {"Location: " + activityItem.meetingLocation}
//                     </p>
//                   )}
//                   {activityItem.type === "task" && activityItem.taskDueDate && (
//                     <p className="text-gray-500 text-xs mt-2">
//                       {"Due: " + moment(activityItem.taskDueDate).format("MM-DD-YYYY")}
//                     </p>
//                   )}

//                   {/* Footer: timestamp + contact chip */}
//                   <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2D2640]">
//                     <span className="text-xs text-gray-500">
//                       {formatDistanceToNow(new Date(activityItem.createdAt), {
//                         addSuffix: true,
//                       })}
//                       {activityItem.createdBy && (
//                         <span className="ml-2 text-gray-600">
//                           {"• " +
//                             activityItem.createdBy.firstName +
//                             " " +
//                             activityItem.createdBy.lastName}
//                         </span>
//                       )}
//                     </span>

//                     {/* Contact Chip */}
//                     {activityItem.contact && (
//                       <div className="flex items-center gap-1.5 bg-[#2D2640] rounded-full px-2.5 py-1 max-w-[200px]">
//                         <User className="h-3 w-3 text-[#7C3AED] flex-shrink-0" />
//                         <span
//                           className="text-xs text-gray-300 truncate"
//                           title={activityItem.contact.email}
//                         >
//                           {activityItem.contact.firstName + " " + activityItem.contact.lastName}
//                         </span>
//                       </div>
//                     )}
//                   </div>

//                   {/* Attachments */}
//                   {activityItem.attachments && activityItem.attachments.length > 0 && (
//                     <div className="mt-3 pt-3 border-t border-[#2D2640]">
//                       <p className="text-xs text-gray-400 mb-2">
//                         {"Attachments (" + activityItem.attachments.length + ")"}
//                       </p>
//                       <div className="flex flex-wrap gap-2">
//                         {activityItem.attachments.map((file, idx) => (
//                            <a
//                             key={idx}
//                             href={file.fileUrl}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="text-xs bg-[#2D2640] text-gray-300 px-2 py-1 rounded hover:bg-[#3D3350] transition-colors"
//                           >
//                             {file.fileName}
//                           </a>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </Card>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }