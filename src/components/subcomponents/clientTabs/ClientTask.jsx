"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus,
  RefreshCw,
  Loader2,
  ClipboardList,
  MoreVertical,
  Trash2,
  ExternalLink,
  Pencil,
  UserPlus,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import moment from "moment";
import Swal from "sweetalert2";
import Select from "react-select";
import axios from "axios";
import { apiPath } from "@/utils/routes";
import {
  useTasksByClient,
  addTaskFromClient,
  deleteTaskById,
  updateTaskStatus,
  assignTaskToUsers,
} from "@/hooks/useTaskClient";
import useAuthStore from "@/store/store";
import TaskDetails from "../drawers/taskOpen";
import AddTask from "../drawers/addTask";

// ─── helpers ──────────────────────────────────────────────────────────────────

const selectStyles = {
  control: (p) => ({ ...p, backgroundColor: "#0F0A1F", borderRadius: "8px", padding: "2px", borderColor: "#452C95", "&:hover": { borderColor: "darkviolet" } }),
  menu: (p) => ({ ...p, backgroundColor: "#191526", borderRadius: "8px", zIndex: 9999 }),
  option: (p, s) => ({ ...p, backgroundColor: s.isSelected ? "darkviolet" : "#191526", color: "white", "&:hover": { backgroundColor: "darkviolet" }, borderRadius: "6px" }),
  singleValue: (p) => ({ ...p, color: "white" }),
  multiValue: (p) => ({ ...p, backgroundColor: "#452C95", borderRadius: "6px" }),
  multiValueLabel: (p) => ({ ...p, color: "#E1C9FF" }),
  multiValueRemove: (p) => ({ ...p, color: "#E1C9FF", "&:hover": { backgroundColor: "#7C3AED", color: "white" } }),
  placeholder: (p) => ({ ...p, color: "#6b7280" }),
  input: (p) => ({ ...p, color: "white" }),
};

function getPriorityColor(priority) {
  const p = (priority || "").toLowerCase();
  if (p === "critical" || p === "urgent") return { bg: "rgba(248,113,113,.12)", border: "rgba(248,113,113,.35)", text: "#FCA5A5" };
  if (p === "high") return { bg: "rgba(251,191,36,.12)", border: "rgba(251,191,36,.35)", text: "#FCD34D" };
  if (p === "medium") return { bg: "rgba(96,165,250,.12)", border: "rgba(96,165,250,.35)", text: "#93C5FD" };
  return { bg: "rgba(111,97,143,.2)", border: "rgba(111,97,143,.4)", text: "#A99BD4" };
}

function getStatusColor(status) {
  const s = (status || "").toLowerCase();
  if (s === "completed" || s === "done") return { bg: "rgba(74,222,128,.12)", border: "rgba(74,222,128,.35)", text: "#86EFAC" };
  if (s === "in progress" || s === "in-progress") return { bg: "rgba(96,165,250,.12)", border: "rgba(96,165,250,.35)", text: "#93C5FD" };
  if (s === "open" || s === "new") return { bg: "rgba(127,86,217,.15)", border: "rgba(127,86,217,.35)", text: "#E1C9FF" };
  return { bg: "rgba(111,97,143,.2)", border: "rgba(111,97,143,.4)", text: "#A99BD4" };
}

function formatDue(d) {
  if (!d) return null;
  const due = moment(d);
  const diff = due.diff(moment(), "days");
  const overdue = diff < 0;
  const label = overdue ? `${Math.abs(diff)}d overdue` : diff === 0 ? "Due today" : diff <= 7 ? `Due in ${diff}d` : due.format("MMM D");
  return { label, overdue };
}

// ─── add task form (inline) ──────────────────────────────────────────────────

function AddTaskForm({ clientId, onSuccess, onCancel }) {
  const user = useAuthStore((s) => s.user);
  const fullname = user?.user?.firstName && user?.user?.secondName
    ? `${user.user.firstName} ${user.user.secondName}` : user?.user?.username || "";
  const username = user?.user?.username || "";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(null);
  const [priority, setPriority] = useState({ label: "Medium", value: "Medium" });
  const [status, setStatus] = useState({ label: "Open", value: "Open" });
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState([]);
  const [saving, setSaving] = useState(false);

  const [categoryOpt, setCategoryOpt] = useState([]);
  const [priorityOpt, setPriorityOpt] = useState([]);
  const [statusOpt, setStatusOpt] = useState([]);
  const [userOpt, setUserOpt] = useState([]);

  useEffect(() => {
    Promise.all([
      axios.get(`${apiPath.prodPath}/api/picklist/taskCategory/getAllTaskCategory`).catch(() => ({ data: { taskCategory: [] } })),
      axios.get(`${apiPath.prodPath}/api/picklist/taskPriority/getAlltaskPriority`).catch(() => ({ data: { taskPriority: [] } })),
      axios.get(`${apiPath.prodPath}/api/picklist/taskStatus/getAlltaskStatus`).catch(() => ({ data: { taskStatus: [] } })),
      axios.get(`${apiPath.prodPath}/api/users/allusers`).catch(() => ({ data: [] })),
    ]).then(([catRes, priRes, staRes, usrRes]) => {
      setCategoryOpt((catRes.data.taskCategory || []).map((c) => ({ label: c.categoryName, value: c.categoryName })));
      setPriorityOpt((priRes.data.taskPriority || []).map((p) => ({ label: p.priority, value: p.priority })));
      setStatusOpt((staRes.data.taskStatus || []).map((s) => ({ label: s.status, value: s.status })));
      setUserOpt((usrRes.data || []).map((u) => ({ label: `${u.firstName} ${u.secondName}`, value: u.username, fullname: `${u.firstName} ${u.secondName}`, username: u.username })));
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      Swal.fire({ icon: "warning", text: "Task description is required." });
      return;
    }
    setSaving(true);
    try {
      await addTaskFromClient(clientId, {
        taskTitle: title || description.slice(0, 50),
        taskDescription: description,
        taskCategory: category?.value || "General",
        taskPriority: priority?.value || "Medium",
        taskStatus: status?.value || "Open",
        dueDate: dueDate || undefined,
        createdBy: JSON.stringify({ fullname, username }),
        assignedTo: JSON.stringify(
          assignedTo.length > 0
            ? assignedTo.map((u) => ({ fullname: u.fullname || u.label, username: u.username || u.value }))
            : [{ fullname, username }],
        ),
        tags: JSON.stringify([]),
      });
      Swal.fire({ icon: "success", text: "Task created.", timer: 1500, showConfirmButton: false });
      onSuccess();
    } catch (err) {
      Swal.fire({ icon: "error", text: err.response?.data?.message || "Failed to create task." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#0F0A1F] border border-[#2D2640] rounded-lg p-4 mb-5 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-white">New Task</span>
        <button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-300">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 col-span-2">
          <label className="text-xs text-gray-400">Description *</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What needs to be done?"
            className="p-2 border border-[#452C95] rounded-lg bg-[#191526] text-white text-sm focus:outline-none focus:border-violet-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Category</label>
          <Select options={categoryOpt} value={category} onChange={setCategory} styles={selectStyles} placeholder="Category" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Due Date</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
            className="p-2 border border-[#452C95] rounded-lg bg-[#191526] text-white text-sm focus:outline-none focus:border-violet-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Priority</label>
          <Select options={priorityOpt} value={priority} onChange={setPriority} styles={selectStyles} placeholder="Priority" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Status</label>
          <Select options={statusOpt} value={status} onChange={setStatus} styles={selectStyles} placeholder="Status" />
        </div>
        <div className="flex flex-col gap-1 col-span-2">
          <label className="text-xs text-gray-400">Assign To</label>
          <Select options={userOpt} value={assignedTo} onChange={setAssignedTo} isMulti styles={selectStyles} placeholder="Assign to users..." />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="px-4 py-1.5 text-xs rounded-lg border border-[#2D2640] text-gray-400 hover:bg-[#2D2640]">Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-1.5 text-xs rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center gap-2">
          {saving && <Loader2 className="h-3 w-3 animate-spin" />} Create Task
        </button>
      </div>
    </form>
  );
}

// ─── assign drawer (inline) ──────────────────────────────────────────────────

function AssignForm({ task, onSuccess, onCancel }) {
  const [assignedTo, setAssignedTo] = useState(
    (task.assignedTo || []).map((u) => ({ label: u.fullname, value: u.username, fullname: u.fullname, username: u.username })),
  );
  const [userOpt, setUserOpt] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get(`${apiPath.prodPath}/api/users/allusers`)
      .then((res) => {
        setUserOpt((res.data || []).map((u) => ({
          label: `${u.firstName} ${u.secondName}`,
          value: u.username,
          fullname: `${u.firstName} ${u.secondName}`,
          username: u.username,
        })));
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (assignedTo.length === 0) {
      Swal.fire({ icon: "warning", text: "Select at least one user." });
      return;
    }
    setSaving(true);
    try {
      await assignTaskToUsers(
        task._id,
        assignedTo.map((u) => ({ fullname: u.fullname || u.label, username: u.username || u.value })),
      );
      Swal.fire({ icon: "success", text: "Task assigned.", timer: 1500, showConfirmButton: false });
      onSuccess();
    } catch (err) {
      Swal.fire({ icon: "error", text: "Failed to assign task." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#0F0A1F] border border-[#2D2640] rounded-lg p-4 mb-5 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-white">Assign Task</span>
        <button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-300"><X className="h-4 w-4" /></button>
      </div>
      <p className="text-xs text-gray-500 truncate">{task.taskDescription}</p>
      <Select options={userOpt} value={assignedTo} onChange={setAssignedTo} isMulti styles={selectStyles} placeholder="Select users..." />
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="px-4 py-1.5 text-xs rounded-lg border border-[#2D2640] text-gray-400 hover:bg-[#2D2640]">Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-1.5 text-xs rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center gap-2">
          {saving && <Loader2 className="h-3 w-3 animate-spin" />} Assign
        </button>
      </div>
    </form>
  );
}

// ─── task card ────────────────────────────────────────────────────────────────

function TaskCard({ task, onOpen, onEdit, onDelete, onAssign }) {
  const [expanded, setExpanded] = useState(false);
  const pColor = getPriorityColor(task.taskPriority);
  const sColor = getStatusColor(task.taskStatus);
  const due = formatDue(task.dueDate);
  const ownerName = task.assignedTo?.[0]?.fullname;
  const completed = (task.taskStatus || "").toLowerCase() === "completed";

  const handleCardClick = (e) => {
    // Don't open if clicking dropdown, expand button, or other interactive elements
    if (e.target.closest("[data-dropdown]") || e.target.closest("button")) return;
    onOpen(task);
  };

  return (
    <Card
      onClick={handleCardClick}
      className={`bg-[#0F0A1F] border-[#2D2640] p-4 transition-colors hover:border-[#452C95] cursor-pointer ${completed ? "opacity-50" : ""}`}
    >
      <div className="flex gap-3">
        {/* Priority bar */}
        <div className="w-1 rounded-full flex-shrink-0 mt-0.5" style={{ background: pColor.text, minHeight: 40 }} />
        <div className="flex-1 min-w-0">
          {/* Top: badges + actions */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] capitalize" style={{ background: sColor.bg, borderColor: sColor.border, color: sColor.text }}>
                {task.taskStatus || "Open"}
              </Badge>
              <Badge variant="outline" className="text-[10px] capitalize" style={{ background: pColor.bg, borderColor: pColor.border, color: pColor.text }}>
                {task.taskPriority || "Medium"}
              </Badge>
              {task.taskCategory && (
                <Badge variant="outline" className="text-gray-400 border-gray-700 text-[10px]">{task.taskCategory}</Badge>
              )}
            </div>
            <div data-dropdown>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded hover:bg-[#2D2640] text-gray-600 hover:text-gray-200 transition-colors">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44" style={{ background: "#1a1f2e", border: "1px solid #2a3045", borderRadius: "10px" }}>
                  <DropdownMenuItem onClick={() => onOpen(task)} className="gap-2 text-slate-300 focus:text-white focus:bg-white/5">
                    <ExternalLink className="h-3.5 w-3.5" /> Open
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(task)} className="gap-2 text-slate-300 focus:text-white focus:bg-white/5">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAssign(task)} className="gap-2 text-slate-300 focus:text-white focus:bg-white/5">
                    <UserPlus className="h-3.5 w-3.5" /> Assign
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(task)} className="gap-2 focus:bg-red-950/40" style={{ color: "#f87171" }}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Description */}
          <div className="mt-1.5">
            <p className={`text-white font-medium text-sm ${completed ? "line-through decoration-gray-600" : ""} ${!expanded ? "line-clamp-2" : ""}`}>
              {task.taskDescription}
            </p>
            {(task.taskDescription || "").length > 100 && (
              <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} className="flex items-center gap-0.5 text-[10px] text-violet-400 hover:text-violet-300 mt-0.5">
                {expanded ? <><ChevronUp className="h-3 w-3" /> Less</> : <><ChevronDown className="h-3 w-3" /> More</>}
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#2D2640]">
            <div className="flex items-center gap-3">
              {due && (
                <span className={`text-xs font-medium ${due.overdue ? "text-red-400" : "text-gray-500"}`}>
                  {due.label}
                </span>
              )}
              {ownerName && (
                <span className="text-xs text-gray-600">
                  {ownerName}
                </span>
              )}
            </div>
            {task.createdAt && (
              <span className="text-[10px] text-gray-600">
                {moment(task.createdAt).fromNow()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── main export ──────────────────────────────────────────────────────────────

const ClientTask = ({ item, open }) => {
  const clientId = item?._id;
  const [page, setPage] = useState(1);
  const { tasks, pagination, isLoading, isError, mutate } = useTasksByClient(clientId, page, 10);

  const [showForm, setShowForm] = useState(false);
  const [assigningTask, setAssigningTask] = useState(null);
  const [openTaskDrawer, setOpenTaskDrawer] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editTaskDrawer, setEditTaskDrawer] = useState(false);
  const [editTaskData, setEditTaskData] = useState(null);

  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleOpen = (task) => {
    setSelectedTask(task);
    setOpenTaskDrawer(true);
  };

  const handleEdit = (task) => {
    setEditTaskData(task);
    setEditTaskDrawer(true);
  };

  const handleDelete = (task) => {
    Swal.fire({
      icon: "warning",
      text: "Delete this task?",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteTaskById(task._id);
          Swal.fire({ icon: "success", text: "Task deleted.", timer: 1500, showConfirmButton: false });
          refresh();
        } catch {
          Swal.fire({ icon: "error", text: "Failed to delete task." });
        }
      }
    });
  };

  const handleEditSave = (data) => {
    const taskId = editTaskData?._id;
    if (!taskId) return;
    axios
      .patch(`${apiPath.prodPath}/api/tasks/modify/${taskId}`, data)
      .then(() => {
        Swal.fire({ icon: "success", text: "Task updated.", timer: 1500, showConfirmButton: false });
        setEditTaskDrawer(false);
        setEditTaskData(null);
        refresh();
      })
      .catch(() => {
        Swal.fire({ icon: "error", text: "Failed to update task." });
      });
  };

  return (
    <div className="bg-[#231C46] rounded-lg border border-[#2D2640] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Tasks</h2>
          {pagination.total > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">{pagination.total} task{pagination.total !== 1 ? "s" : ""} linked</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => { setShowForm((v) => !v); setAssigningTask(null); }} size="sm" className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add
          </Button>
          <Button onClick={refresh} size="sm" variant="outline" className="border-[#2D2640] text-gray-400 hover:bg-[#2D2640] hover:text-white bg-transparent">
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Add task form */}
      {showForm && (
        <AddTaskForm clientId={clientId} onSuccess={() => { setShowForm(false); refresh(); }} onCancel={() => setShowForm(false)} />
      )}

      {/* Assign form */}
      {assigningTask && (
        <AssignForm task={assigningTask} onSuccess={() => { setAssigningTask(null); refresh(); }} onCancel={() => setAssigningTask(null)} />
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-2 bg-red-900/20 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
          <AlertCircle className="h-4 w-4" /> Failed to load tasks
          <button onClick={refresh} className="ml-auto"><RefreshCw className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-3">
        {isLoading && tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-8 w-8 text-[#7C3AED] animate-spin" />
            <p className="text-gray-400 text-sm">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-1">No tasks linked to this client</p>
            <p className="text-gray-600 text-sm">Click "Add" to create one.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onOpen={handleOpen}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAssign={(t) => { setAssigningTask(t); setShowForm(false); }}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#2D2640]">
          <span className="text-xs text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="w-7 h-7 rounded-lg bg-[rgba(127,86,217,0.08)] border border-[rgba(127,86,217,0.3)] text-[#E1C9FF] flex items-center justify-center disabled:opacity-40">
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page === pagination.totalPages}
              className="w-7 h-7 rounded-lg bg-[rgba(127,86,217,0.08)] border border-[rgba(127,86,217,0.3)] text-[#E1C9FF] flex items-center justify-center disabled:opacity-40">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Task Open Drawer */}
      {openTaskDrawer && selectedTask && (
        <TaskDetails
          open={openTaskDrawer}
          handleClose={() => { setOpenTaskDrawer(false); setSelectedTask(null); refresh(); }}
          item={selectedTask}
        />
      )}

      {/* Edit Task Drawer */}
      {editTaskDrawer && editTaskData && (
        <AddTask
          open={editTaskDrawer}
          handleClose={() => { setEditTaskDrawer(false); setEditTaskData(null); }}
          edit={true}
          editData={editTaskData}
          editTask={handleEditSave}
        />
      )}
    </div>
  );
};

export default ClientTask;
