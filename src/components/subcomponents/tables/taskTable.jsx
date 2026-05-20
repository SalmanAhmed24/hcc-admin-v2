import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import moment from "moment";
import axios from "axios";
import { apiPath } from "@/utils/routes";
import Swal from "sweetalert2";
import React, { useEffect, useState } from "react";
import AddTask from "../drawers/addTask";
import TaskDetails from "../drawers/taskOpen";
import ConnectClientDrawer from "../drawers/ConnectClientDrawer";
import useAuthStore from "@/store/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Building2,
  Link2,
} from "lucide-react";

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #FBBF24, #B45309)",
  "linear-gradient(135deg, #60A5FA, #1D4ED8)",
  "linear-gradient(135deg, #34D399, #047857)",
  "linear-gradient(135deg, #F472B6, #BE185D)",
  "linear-gradient(135deg, #C084FC, #7E22CE)",
  "linear-gradient(135deg, #FB7185, #BE123C)",
  "linear-gradient(135deg, #2DD4BF, #0F766E)",
  "linear-gradient(135deg, #FB923C, #C2410C)",
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getAvatarGradient(name) {
  return AVATAR_GRADIENTS[hashString(name || "") % AVATAR_GRADIENTS.length];
}

function getStatusChipClass(status) {
  const s = (status || "").toLowerCase();
  if (s === "completed" || s === "done") return "chip-success";
  if (s === "in progress" || s === "in-progress") return "chip-info";
  if (s === "open" || s === "new") return "chip-violet";
  if (s === "on hold" || s === "paused") return "chip-paused";
  if (s === "cancelled" || s === "blocked") return "chip-danger";
  return "chip-neutral";
}

function getPriorityLevel(priority) {
  const p = (priority || "").toLowerCase();
  if (p === "critical" || p === "urgent") return "urgent";
  if (p === "high") return "high";
  if (p === "medium") return "medium";
  return "low";
}

function getDueDateStyle(dueDate) {
  if (!dueDate) return {};
  const now = moment();
  const due = moment(dueDate);
  const daysUntil = due.diff(now, "days");
  if (daysUntil < 0) return { color: "#FCA5A5" };
  if (daysUntil <= 7) return { color: "#FCD34D" };
  return {};
}

function formatRelativeDate(date) {
  if (!date) return "";
  const now = moment();
  const d = moment(date);
  const diff = d.diff(now, "days");
  if (diff < -1) return `${Math.abs(diff)} days ago`;
  if (diff === -1) return "yesterday";
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  if (diff <= 7) return `in ${diff} days`;
  if (diff <= 30) return `in ${Math.ceil(diff / 7)} weeks`;
  return d.format("MMM D");
}

function StatusChip({ status, taskId, options, onChange }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`modern-chip ${getStatusChipClass(status)}`}>
          {(status || "").toLowerCase() === "completed" ? (
            <CheckCircle2 size={11} />
          ) : (
            <span className="modern-chip-dot" />
          )}
          {status || "N/A"}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onChange(taskId, opt.value)}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PriorityPill({ priority, taskId, options, onChange }) {
  const level = getPriorityLevel(priority);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`modern-priority-pill ${level}`}>
          <span className="modern-priority-bar" />
          {priority || "N/A"}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onChange(taskId, opt.value)}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ModernPagination({ currentPage, totalPages, total, onPageChange, limit }) {
  if (totalPages <= 1) return null;
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  const pages = [];
  for (let i = 1; i <= Math.min(totalPages, 5); i++) pages.push(i);

  return (
    <div className="modern-pagination">
      <span>
        Showing <b style={{ color: "#fff" }}>{startItem}–{endItem}</b> of {total}
      </span>
      <div className="modern-page-controls">
        <button
          className="modern-page-btn"
          onClick={(e) => onPageChange(e, Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={12} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            className={`modern-page-btn ${p === currentPage ? "active" : ""}`}
            onClick={(e) => onPageChange(e, p)}
          >
            {p}
          </button>
        ))}
        <button
          className="modern-page-btn"
          onClick={(e) => onPageChange(e, Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

function TaskTable({ open, handleClose, filterBy, searchTerm }) {
  const [taskModal, setTaskModal] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [connectDrawerOpen, setConnectDrawerOpen] = useState(false);
  const [connectTaskId, setConnectTaskId] = useState(null);
  const user = useAuthStore((state) => state.user);
  const [taskCreatedBy, setTaskCreatedBy] = useState([]);
  const [pagesCB, setPagesCB] = useState(1);
  const [totalCB, setTotalCB] = useState(0);
  const [pageCB, setPageCB] = useState(1);
  const [taskAssignedTo, setTaskAssignedTo] = useState([]);
  const [pagesAT, setPagesAT] = useState(1);
  const [totalAT, setTotalAT] = useState(0);
  const [pageAT, setPageAT] = useState(1);
  const [taskStatusOpt, setTaskStatusOpt] = useState([]);
  const [taskPriorityOpt, setTaskPriorityOpt] = useState([]);

  const username = user?.user?.username;

  async function taskPriorityOptions() {
    const taskPriority = await axios
      .get(`${apiPath.prodPath}/api/picklist/taskPriority/getAlltaskPriority`)
      .then((res) => {
        const priorityArr = res.data.taskPriority;
        return priorityArr;
      });
    const options = taskPriority.map((item) => ({
      label: item.priority,
      value: item.priority,
    }));
    setTaskPriorityOpt(options);
  }

  async function taskStatusOptions() {
    const taskStatus = await axios
      .get(`${apiPath.prodPath}/api/picklist/taskStatus/getAlltaskStatus`)
      .then((res) => {
        const statusArr = res.data.taskStatus;
        return statusArr;
      });
    const options = taskStatus.map((item) => ({
      label: item.status,
      value: item.status,
    }));
    setTaskStatusOpt(options);
  }

  const getUserCreatedByTasks = async (page = 1) => {
    if (!filterBy || !searchTerm.trim()) {
      const res = await axios.get(
        `${apiPath.prodPath}/api/tasks/user/createdBy/${username}/?page=${page}&limit=8`
      );
      setTaskCreatedBy(res.data.tasks);
      setPagesCB(res.data.pages);
      setTotalCB(res.data.total);
    } else {
      const res = await axios.get(
        `${apiPath.prodPath}/api/tasks/user/createdBy/${username}/?filterBy=${filterBy}&searchTerm=${searchTerm}&page=${page}&limit=8`
      );
      setTaskCreatedBy(res.data.tasks);
      setPagesCB(res.data.pages);
      setTotalCB(res.data.total);
    }
  };

  const getUserAssignedToTasks = async (page = 1) => {
    if (!filterBy || !searchTerm.trim()) {
      const res = await axios.get(
        `${apiPath.prodPath}/api/tasks/user/assignedTo/${username}/?page=${page}&limit=8`
      );
      setTaskAssignedTo(res.data.tasks);
      setPagesAT(res.data.pages);
      setTotalAT(res.data.total);
    } else {
      const res = await axios.get(
        `${apiPath.prodPath}/api/tasks/user/assignedTo/${username}/?filterBy=${filterBy}&searchTerm=${searchTerm}&page=${page}&limit=8`
      );
      setTaskAssignedTo(res.data.tasks);
      setPagesAT(res.data.pages);
      setTotalAT(res.data.total);
    }
  };

  useEffect(() => {
    taskPriorityOptions();
    taskStatusOptions();
    getUserCreatedByTasks();
    getUserAssignedToTasks();
  }, [open, filterBy, searchTerm]);

  async function refreshData(page = 1) {
    getUserCreatedByTasks(page);
    getUserAssignedToTasks(page);
  }

  async function onChangePageAT(e, value) {
    setPageAT(value);
    await getUserAssignedToTasks(value);
  }

  async function onChangePageCB(e, value) {
    setPageCB(value);
    await getUserCreatedByTasks(value);
  }

  const handleEdit = (item) => {
    setTaskId(item._id);
    setTaskModal(true);
  };

  const handleOpenModal = (item) => {
    setTaskId(item._id);
    setOpenModal(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      icon: "warning",
      text: "Are you sure you want to delete this task?",
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${apiPath.prodPath}/api/tasks/${id}`)
          .then(() => refreshData())
          .catch((err) => console.log(err));
      }
    });
  };

  const editTask = (data) => {
    axios
      .patch(`${apiPath.prodPath}/api/tasks/modify/${taskId}`, data)
      .then(() => {
        refreshData();
        Swal.fire({ icon: "success", text: "Task updated successfully" });
      })
      .catch(() => {
        Swal.fire({ icon: "error", text: "Failed to update task" });
      });
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const updateData = { taskStatus: newStatus };
      if (newStatus === "Completed") {
        updateData.completedDate = new Date();
      } else {
        updateData.completedDate = null;
      }
      const res = await axios.patch(
        `${apiPath.prodPath}/api/tasks/${taskId}/status`,
        updateData
      );
      if (res.status === 200) {
        Swal.fire({ icon: "success", text: "Task status updated successfully" });
        refreshData();
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
      Swal.fire({ icon: "error", text: "Error updating task status" });
    }
  };

  const handlePriorityChange = async (taskId, newPriority) => {
    try {
      const updateData = { taskPriority: newPriority };
      const res = await axios.patch(
        `${apiPath.prodPath}/api/tasks/${taskId}/priority`,
        updateData
      );
      if (res.status === 200) {
        Swal.fire({ icon: "success", text: "Task priority updated successfully" });
        refreshData();
      }
    } catch (error) {
      console.error("Failed to update task priority:", error);
      Swal.fire({ icon: "error", text: "Error updating task priority" });
    }
  };

  const isCompleted = (status) => (status || "").toLowerCase() === "completed";

  const renderTaskRow = (task) => {
    const completed = isCompleted(task.taskStatus);
    const dueDateStyle = getDueDateStyle(task.dueDate);
    const ownerName =
      task.assignedTo?.length > 0 ? task.assignedTo[0].fullname : null;

    return (
      <TableRow
        className="modern-table-row"
        key={task._id}
        style={completed ? { opacity: 0.55 } : {}}
      >
        {/* Task description + category */}
        <TableCell>
          <div className="modern-id-stack" style={{ maxWidth: 360 }}>
            <div
              className="modern-id-name"
              style={
                completed
                  ? {
                      textDecoration: "line-through",
                      textDecorationColor: "rgba(169,155,212,0.5)",
                    }
                  : {}
              }
            >
              {task.taskDescription}
            </div>
            <div className="modern-id-meta">{task.taskCategory}</div>
          </div>
        </TableCell>

        {/* Status chip */}
        <TableCell>
          <StatusChip
            status={task.taskStatus}
            taskId={task._id}
            options={taskStatusOpt}
            onChange={handleStatusChange}
          />
        </TableCell>

        {/* Priority pill */}
        <TableCell>
          <PriorityPill
            priority={task.taskPriority}
            taskId={task._id}
            options={taskPriorityOpt}
            onChange={handlePriorityChange}
          />
        </TableCell>

        {/* Owner */}
        <TableCell>
          {ownerName ? (
            <div className="modern-owner-cell">
              <div
                className="modern-mini-avatar"
                style={{ background: getAvatarGradient(ownerName) }}
              >
                {getInitials(ownerName)}
              </div>
              <span className="modern-owner-name">
                {ownerName.split(" ")[0]}{" "}
                {ownerName.split(" ").length > 1
                  ? ownerName.split(" ").pop()[0] + "."
                  : ""}
              </span>
            </div>
          ) : (
            <span style={{ color: "rgba(169,155,212,0.5)", fontStyle: "italic", fontSize: "12.5px" }}>
              Unassigned
            </span>
          )}
        </TableCell>

        {/* Client */}
        <TableCell>
          {task.clientRef ? (
            <div className="modern-owner-cell">
              <Building2 size={14} style={{ color: "#7C3AED", flexShrink: 0 }} />
              <span className="modern-owner-name" style={{ fontSize: "12px" }}>
                {task.client || "Linked"}
              </span>
            </div>
          ) : (
            <button
              className="modern-chip chip-violet"
              style={{ fontSize: "10.5px", gap: 4 }}
              onClick={(e) => {
                e.stopPropagation();
                setConnectTaskId(task._id);
                setConnectDrawerOpen(true);
              }}
            >
              <Link2 size={11} /> Connect
            </button>
          )}
        </TableCell>

        {/* Due date */}
        <TableCell>
          {task.dueDate ? (
            <div className="modern-date-cell">
              <span className="modern-date-primary" style={dueDateStyle}>
                {moment(task.dueDate).format("MMM D")}
              </span>
              <span className="modern-date-relative" style={dueDateStyle}>
                {formatRelativeDate(task.dueDate)}
              </span>
            </div>
          ) : (
            <span style={{ color: "rgba(169,155,212,0.5)", fontSize: "12.5px" }}>
              No date
            </span>
          )}
        </TableCell>

        {/* Actions */}
        <TableCell>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="modern-icon-btn">
                  <MoreVertical size={15} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleOpenModal(task)}>
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEdit(task)}>
                  Edit
                </DropdownMenuItem>
                {!task.clientRef && (
                  <DropdownMenuItem onClick={() => { setConnectTaskId(task._id); setConnectDrawerOpen(true); }}>
                    Connect to Client
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleDelete(task._id)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {taskModal && taskId === task._id ? (
            <AddTask
              open={taskModal}
              handleClose={() => setTaskModal(false)}
              edit={true}
              editData={task}
              editTask={editTask}
            />
          ) : null}
          {openModal && taskId === task._id ? (
            <TaskDetails
              open={openModal}
              handleClose={() => setOpenModal(false)}
              item={task}
              refreshData={refreshData}
            />
          ) : null}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <>
      <style jsx global>{`
        /* ── Modern table tokens ────────────────────────────── */
        .modern-table-wrap {
          background: rgba(28,22,52,.85);
          border: 1px solid rgba(69,44,149,.22);
          border-radius: 16px;
          overflow: hidden;
        }
        .modern-table-wrap table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .modern-table-wrap thead th {
          text-align: left; padding: 10px 14px;
          font-family: inherit; font-weight: 600; font-size: 10.5px;
          text-transform: uppercase; letter-spacing: .12em;
          color: rgba(169,155,212,0.5);
          background: rgba(20,15,43,.55);
          border-bottom: 1px solid rgba(69,44,149,.22);
          position: sticky; top: 0; z-index: 1; white-space: nowrap;
        }
        .modern-table-row { transition: background .15s; cursor: pointer; }
        .modern-table-row:hover { background: rgba(127,86,217,.08) !important; }
        .modern-table-row td {
          padding: 14px 14px; vertical-align: middle;
          border-bottom: 1px solid rgba(69,44,149,.12);
          font-size: 13px; color: rgba(255,255,255,.87);
        }
        .modern-table-row:last-child td { border-bottom: 0; }

        /* ── ID stack ────────────────────────────────────────── */
        .modern-id-stack { min-width: 0; line-height: 1.3; }
        .modern-id-name { font-weight: 600; color: #fff; font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 360px; }
        .modern-id-meta { font-size: 11px; color: rgba(169,155,212,0.6); margin-top: 2px; }

        /* ── Chips ───────────────────────────────────────────── */
        .modern-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 2px 9px; border-radius: 9999px;
          font-size: 11px; font-weight: 500; border: 1px solid;
          white-space: nowrap; cursor: pointer; background: transparent;
          transition: filter .15s;
        }
        .modern-chip:hover { filter: brightness(1.2); }
        .modern-chip svg { width: 11px; height: 11px; }
        .modern-chip-dot { width: 6px; height: 6px; border-radius: 9999px; background: currentColor; }
        .chip-success { background: rgba(74,222,128,.12); border-color: rgba(74,222,128,.35); color: #86EFAC; }
        .chip-info    { background: rgba(96,165,250,.12); border-color: rgba(96,165,250,.35); color: #93C5FD; }
        .chip-warn    { background: rgba(251,191,36,.12); border-color: rgba(251,191,36,.35); color: #FCD34D; }
        .chip-danger  { background: rgba(248,113,113,.12); border-color: rgba(248,113,113,.35); color: #FCA5A5; }
        .chip-violet  { background: rgba(127,86,217,.15); border-color: rgba(127,86,217,.35); color: #E1C9FF; }
        .chip-neutral { background: rgba(111,97,143,.2);  border-color: rgba(111,97,143,.4);  color: #A99BD4; }
        .chip-paused  { background: rgba(251,146,60,.12); border-color: rgba(251,146,60,.35); color: #FDBA74; }

        /* ── Priority pill ───────────────────────────────────── */
        .modern-priority-pill {
          display: inline-flex; align-items: center; gap: 6px; padding: 3px 9px;
          border-radius: 9999px; font-size: 11px; font-weight: 500;
          background: rgba(20,15,43,.7); border: 1px solid rgba(69,44,149,.5);
          color: rgba(169,155,212,0.8); cursor: pointer; transition: filter .15s;
        }
        .modern-priority-pill:hover { filter: brightness(1.2); }
        .modern-priority-bar { width: 3px; height: 12px; border-radius: 2px; }
        .modern-priority-pill.urgent .modern-priority-bar { background: #F87171; }
        .modern-priority-pill.high   .modern-priority-bar { background: #FCD34D; }
        .modern-priority-pill.medium .modern-priority-bar { background: #93C5FD; }
        .modern-priority-pill.low    .modern-priority-bar { background: #A99BD4; }

        /* ── Owner cell ──────────────────────────────────────── */
        .modern-owner-cell { display: flex; align-items: center; gap: 8px; }
        .modern-mini-avatar {
          width: 26px; height: 26px; border-radius: 9999px;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; color: #fff; flex-shrink: 0;
        }
        .modern-owner-name { font-size: 12.5px; color: #E1C9FF; font-weight: 500; }

        /* ── Date cell ───────────────────────────────────────── */
        .modern-date-cell { display: flex; flex-direction: column; line-height: 1.25; }
        .modern-date-primary { color: #fff; font-size: 13px; }
        .modern-date-relative { color: rgba(169,155,212,0.5); font-size: 11px; }

        /* ── Icon button ─────────────────────────────────────── */
        .modern-icon-btn {
          width: 30px; height: 30px; border-radius: 8px;
          background: transparent; border: 1px solid transparent;
          color: rgba(169,155,212,0.6);
          display: inline-flex; align-items: center; justify-content: center;
          transition: all .15s; cursor: pointer;
        }
        .modern-icon-btn:hover { background: rgba(127,86,217,.18); color: #fff; border-color: rgba(127,86,217,.3); }

        /* ── Pagination ──────────────────────────────────────── */
        .modern-pagination {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 18px; border-top: 1px solid rgba(69,44,149,.12);
          font-size: 12px; color: rgba(169,155,212,0.5);
        }
        .modern-page-controls { display: flex; gap: 4px; align-items: center; }
        .modern-page-btn {
          width: 28px; height: 28px; border-radius: 8px;
          background: rgba(127,86,217,.08); border: 1px solid rgba(127,86,217,.3);
          color: #E1C9FF; display: inline-flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background .15s; font-size: 12px;
        }
        .modern-page-btn:hover { background: rgba(127,86,217,.2); }
        .modern-page-btn.active { background: #B797FF; color: #1C1633; border-color: #B797FF; font-weight: 700; }
        .modern-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      <div className="flex flex-wrap flex-row gap-10 justify-start ml-14">
        <div className="w-full h-2/4">
          <Tabs defaultValue="Assigned To" className="w-full">
            <TabsList className="cus-tab-wrap">
              <TabsTrigger value="Assigned To">User Tasks</TabsTrigger>
              <TabsTrigger value="Created By">Assigned Tasks</TabsTrigger>
            </TabsList>

            <TabsContent value="Assigned To">
              <div className="w-full h-full">
                {taskAssignedTo?.length ? (
                  <div className="modern-table-wrap">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Task</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Due</TableHead>
                          <TableHead style={{ textAlign: "right", paddingRight: 18 }} />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {taskAssignedTo.map((task) => renderTaskRow(task))}
                      </TableBody>
                    </Table>
                    <ModernPagination
                      currentPage={pageAT}
                      totalPages={pagesAT}
                      total={totalAT}
                      onPageChange={onChangePageAT}
                      limit={8}
                    />
                  </div>
                ) : (
                  <p className="text-xl">No Task Data found</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="Created By">
              <div>
                {taskCreatedBy?.length ? (
                  <div className="modern-table-wrap">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Task</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Due</TableHead>
                          <TableHead style={{ textAlign: "right", paddingRight: 18 }} />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {taskCreatedBy.map((task) => renderTaskRow(task))}
                      </TableBody>
                    </Table>
                    <ModernPagination
                      currentPage={pageCB}
                      totalPages={pagesCB}
                      total={totalCB}
                      onPageChange={onChangePageCB}
                      limit={8}
                    />
                  </div>
                ) : (
                  <p className="text-xl">No Task Data found</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Connect to Client Drawer */}
      <ConnectClientDrawer
        open={connectDrawerOpen}
        onClose={() => { setConnectDrawerOpen(false); setConnectTaskId(null); }}
        taskId={connectTaskId}
        onConnected={() => refreshData()}
      />
    </>
  );
}

export default TaskTable;
