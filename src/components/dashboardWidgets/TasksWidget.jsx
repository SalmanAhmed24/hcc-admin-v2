"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { apiPath } from "@/utils/routes";
import useAuthStore from "@/store/store";
import moment from "moment";
import Swal from "sweetalert2";
import { ChevronDown, Plus, ArrowRight, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddTask from "@/components/subcomponents/drawers/addTask";
import TaskDetails from "@/components/subcomponents/drawers/taskOpen";
import { useRouter } from "next/navigation";

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

function getPriorityLevel(priority) {
  const p = (priority || "").toLowerCase();
  if (p === "critical" || p === "urgent") return "urgent";
  if (p === "high") return "high";
  if (p === "medium") return "medium";
  return "low";
}

function isDueToday(dueDate) {
  if (!dueDate) return false;
  return moment(dueDate).isSame(moment(), "day");
}

function isDueSoon(dueDate) {
  if (!dueDate) return false;
  const diff = moment(dueDate).diff(moment(), "days");
  return diff >= 0 && diff <= 7;
}

function isOverdue(dueDate) {
  if (!dueDate) return false;
  return moment(dueDate).isBefore(moment(), "day");
}

function formatDueLabel(dueDate) {
  if (!dueDate) return "";
  const now = moment();
  const due = moment(dueDate);
  const diff = due.diff(now, "days");
  if (diff < -1) return `${Math.abs(diff)}d ago`;
  if (diff === -1) return "yesterday";
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  if (diff <= 7) return due.format("ddd");
  return due.format("MMM D");
}

function AccordionSection({ label, count, markerClass, defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="tw-section">
      <button className="tw-sec-head" onClick={() => setOpen(!open)}>
        <span className={`tw-sec-marker ${markerClass}`} />
        <span className="tw-sec-label">{label}</span>
        <span className="tw-sec-count">{count}</span>
        <span className="tw-sec-spacer" />
        <span className={`tw-sec-chev ${open ? "open" : ""}`}>
          <ChevronDown size={14} />
        </span>
      </button>
      <div className={`tw-sec-body ${open ? "open" : ""}`}>
        <div className="tw-sec-body-inner">{children}</div>
      </div>
    </div>
  );
}

function TaskRow({ task, onOpen, onStatusChange, isDue }) {
  const priorityLevel = getPriorityLevel(task.taskPriority);
  const completed = (task.taskStatus || "").toLowerCase() === "completed";
  const dueLabel = formatDueLabel(task.dueDate);
  const overdue = isOverdue(task.dueDate);
  const dueToday = isDueToday(task.dueDate);
  const ownerName = task.assignedTo?.length > 0 ? task.assignedTo[0].fullname : null;

  const rowClass = [
    "tw-task-row",
    completed ? "done" : "",
    isDue && !completed ? "due-highlight" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={rowClass} onClick={() => onOpen(task)}>
      <div className={`tw-task-bar ${priorityLevel}`} />
      <div className="tw-task-content">
        <div className="tw-task-desc">{task.taskDescription}</div>
        <div className="tw-task-meta">
          <span className="tw-task-cat">{task.taskCategory}</span>
          {!completed && (
            <span className={`tw-task-prio ${priorityLevel}`}>
              {task.taskPriority || "Low"}
            </span>
          )}
        </div>
      </div>
      {ownerName && (
        <div
          className="tw-task-owner"
          style={{ background: getAvatarGradient(ownerName) }}
        >
          {getInitials(ownerName)}
        </div>
      )}
      <div className={`tw-task-due ${dueToday || overdue ? "today" : isDueSoon(task.dueDate) ? "soon" : ""}`}>
        {dueLabel}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="tw-task-action" onClick={(e) => e.stopPropagation()}>
            <MoreVertical size={13} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onOpen(task); }}>
            Open
          </DropdownMenuItem>
          {!completed && (
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(task._id, "Completed"); }}>
              Mark Complete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function TasksWidget() {
  const user = useAuthStore((state) => state.user);
  const username = user?.user?.username;
  const router = useRouter();

  const [pendingTasks, setPendingTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [pendingPage, setPendingPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [pendingHasMore, setPendingHasMore] = useState(true);
  const [completedHasMore, setCompletedHasMore] = useState(true);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingCompleted, setLoadingCompleted] = useState(false);
  const [totalOpen, setTotalOpen] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);

  const [taskModal, setTaskModal] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const pendingRef = useRef(null);
  const completedRef = useRef(null);
  const LIMIT = 8;

  const fetchPendingTasks = useCallback(async (page = 1, append = false) => {
    if (!username) return;
    setLoadingPending(true);
    try {
      const res = await axios.get(
        `${apiPath.prodPath}/api/tasks/user/assignedTo/${username}/?page=${page}&limit=${LIMIT}`
      );
      const allTasks = res.data.tasks || [];
      const tasks = allTasks.filter(
        (t) => (t.taskStatus || "").toLowerCase() !== "completed"
      );
      if (append) {
        setPendingTasks((prev) => [...prev, ...tasks]);
      } else {
        setPendingTasks(tasks);
      }
      setTotalOpen(res.data.total || 0);
      setPendingHasMore(allTasks.length >= LIMIT);
    } catch (err) {
      console.error("Failed to fetch pending tasks:", err);
    } finally {
      setLoadingPending(false);
    }
  }, [username]);

  const fetchCompletedTasks = useCallback(async (page = 1, append = false) => {
    if (!username) return;
    setLoadingCompleted(true);
    try {
      const res = await axios.get(
        `${apiPath.prodPath}/api/tasks/user/assignedTo/${username}/?page=${page}&limit=${LIMIT}&filterBy=taskStatus&searchTerm=Completed`
      );
      const tasks = res.data.tasks || [];
      if (append) {
        setCompletedTasks((prev) => [...prev, ...tasks]);
      } else {
        setCompletedTasks(tasks);
      }
      setTotalCompleted(append ? completedTasks.length + tasks.length : tasks.length);
      setCompletedHasMore(tasks.length >= LIMIT);
    } catch (err) {
      console.error("Failed to fetch completed tasks:", err);
    } finally {
      setLoadingCompleted(false);
    }
  }, [username, completedTasks.length]);

  useEffect(() => {
    if (username) {
      fetchPendingTasks(1);
      fetchCompletedTasks(1);
    }
  }, [username, fetchPendingTasks, fetchCompletedTasks]);

  const handlePendingScroll = useCallback(() => {
    const el = pendingRef.current;
    if (!el || loadingPending || !pendingHasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      const nextPage = pendingPage + 1;
      setPendingPage(nextPage);
      fetchPendingTasks(nextPage, true);
    }
  }, [loadingPending, pendingHasMore, pendingPage, fetchPendingTasks]);

  const handleCompletedScroll = useCallback(() => {
    const el = completedRef.current;
    if (!el || loadingCompleted || !completedHasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      const nextPage = completedPage + 1;
      setCompletedPage(nextPage);
      fetchCompletedTasks(nextPage, true);
    }
  }, [loadingCompleted, completedHasMore, completedPage, fetchCompletedTasks]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const updateData = { taskStatus: newStatus };
      if (newStatus === "Completed") updateData.completedDate = new Date();
      await axios.patch(`${apiPath.prodPath}/api/tasks/${taskId}/status`, updateData);
      refreshAll();
    } catch (err) {
      Swal.fire({ icon: "error", text: "Error updating task status" });
    }
  };

  const refreshAll = () => {
    setPendingPage(1);
    setCompletedPage(1);
    fetchPendingTasks(1);
    fetchCompletedTasks(1);
  };

  const handleOpenTask = (task) => {
    setSelectedTask(task);
    setOpenModal(true);
  };

  const addTask = (data) => {
    axios
      .post(`${apiPath.prodPath}/api/tasks/addTask`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        Swal.fire({ icon: "success", text: "Task Added Successfully" });
        setTaskModal(false);
        refreshAll();
      })
      .catch((err) => {
        setTaskModal(false);
        Swal.fire({ icon: "error", text: `${err.message}` });
      });
  };

  const dueTodayTasks = pendingTasks.filter((t) => isDueToday(t.dueDate) || isOverdue(t.dueDate));
  const upcomingTasks = pendingTasks.filter((t) => !isDueToday(t.dueDate) && !isOverdue(t.dueDate));
  const dueTodayCount = dueTodayTasks.length;

  return (
    <>
      <style jsx global>{`
        .tw-section { border-bottom: 1px solid rgba(69,44,149,.12); }
        .tw-section:last-of-type { border-bottom: 0; }
        .tw-sec-head {
          width: 100%; background: transparent; border: 0; cursor: pointer;
          display: flex; align-items: center; gap: 12px;
          padding: 12px 20px; font-family: inherit; color: inherit; text-align: left;
          transition: background .15s;
        }
        .tw-sec-head:hover { background: rgba(69,44,149,.08); }
        .tw-sec-marker {
          width: 8px; height: 8px; border-radius: 9999px; flex-shrink: 0;
          background: #6F618F;
        }
        .tw-sec-marker.urgent { background: #F87171; box-shadow: 0 0 0 3px rgba(248,113,113,.15); }
        .tw-sec-marker.warn   { background: #FCD34D; box-shadow: 0 0 0 3px rgba(252,211,77,.15); }
        .tw-sec-marker.success{ background: #86EFAC; box-shadow: 0 0 0 3px rgba(134,239,172,.15); }
        .tw-sec-marker.neutral{ background: #6F618F; }
        .tw-sec-label { font-weight: 600; font-size: 14px; color: #fff; white-space: nowrap; }
        .tw-sec-count { font-size: 11px; color: #6F618F; font-family: monospace; }
        .tw-sec-spacer { flex: 1; }
        .tw-sec-chev {
          color: #6F618F; display: inline-flex;
          transition: transform .25s cubic-bezier(.4,0,.2,1);
        }
        .tw-sec-chev.open { transform: rotate(180deg); color: #B797FF; }
        .tw-sec-body {
          overflow: hidden; transition: max-height .3s cubic-bezier(.4,0,.2,1);
          max-height: 0;
        }
        .tw-sec-body.open { max-height: 1200px; }
        .tw-sec-body-inner { padding: 2px 12px 12px 20px; display: flex; flex-direction: column; gap: 4px; }
        .tw-scroll-area { max-height: 320px; overflow-y: auto; }
        .tw-scroll-area::-webkit-scrollbar { width: 4px; }
        .tw-scroll-area::-webkit-scrollbar-track { background: transparent; }
        .tw-scroll-area::-webkit-scrollbar-thumb { background: rgba(127,86,217,.3); border-radius: 4px; }

        .tw-task-row {
          display: grid; grid-template-columns: 4px 1fr auto auto 24px;
          gap: 12px; align-items: center;
          padding: 10px 12px; border-radius: 10px;
          background: transparent; transition: background .15s; cursor: pointer;
        }
        .tw-task-row:hover { background: rgba(127,86,217,.1); }
        .tw-task-row.done { opacity: .5; }
        .tw-task-row.due-highlight {
          background: rgba(248,113,113,.08);
          border: 1px solid rgba(248,113,113,.25);
        }
        .tw-task-row.due-highlight:hover {
          background: rgba(248,113,113,.14);
        }
        .tw-task-bar { width: 3px; height: 26px; border-radius: 2px; align-self: center; }
        .tw-task-bar.urgent { background: #F87171; }
        .tw-task-bar.high   { background: #FCD34D; }
        .tw-task-bar.medium { background: #93C5FD; }
        .tw-task-bar.low    { background: #6F618F; }
        .tw-task-content { min-width: 0; line-height: 1.3; }
        .tw-task-desc {
          font-size: 13px; font-weight: 500; color: #fff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .tw-task-row.done .tw-task-desc { text-decoration: line-through; text-decoration-color: #6F618F; color: #A99BD4; }
        .tw-task-meta { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #6F618F; margin-top: 2px; }
        .tw-task-cat { color: #A99BD4; }
        .tw-task-prio {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 1px 7px; border-radius: 9999px;
          font-size: 10px; font-weight: 500;
          background: rgba(20,15,43,.65); border: 1px solid rgba(69,44,149,.3);
          color: #A99BD4;
        }
        .tw-task-prio.urgent { color: #FCA5A5; border-color: rgba(248,113,113,.35); }
        .tw-task-prio.high   { color: #FCD34D; border-color: rgba(252,211,77,.35); }
        .tw-task-prio.medium { color: #93C5FD; border-color: rgba(147,197,253,.35); }
        .tw-task-owner {
          width: 22px; height: 22px; border-radius: 9999px;
          display: inline-flex; align-items: center; justify-content: center;
          color: #fff; font-size: 9.5px; font-weight: 700; flex-shrink: 0;
        }
        .tw-task-due {
          font-family: monospace; font-size: 10.5px;
          color: #A99BD4; text-align: right; white-space: nowrap;
        }
        .tw-task-due.today { color: #F87171; font-weight: 600; }
        .tw-task-due.soon  { color: #FCD34D; font-weight: 500; }
        .tw-task-action {
          width: 24px; height: 24px; border-radius: 6px;
          background: transparent; border: 0; color: #6F618F;
          display: inline-flex; align-items: center; justify-content: center;
          opacity: 0; transition: all .15s; cursor: pointer;
        }
        .tw-task-row:hover .tw-task-action { opacity: 1; }
        .tw-task-action:hover { background: rgba(127,86,217,.2); color: #fff; }

        .tw-foot {
          padding: 10px 14px 14px;
          border-top: 1px solid rgba(69,44,149,.12);
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
        }
        .tw-foot-cta {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 12px; border-radius: 9px;
          background: rgba(127,86,217,.15); border: 1px solid rgba(69,44,149,.3);
          color: #B797FF; font-weight: 600; font-size: 12px;
          cursor: pointer; transition: all .15s;
        }
        .tw-foot-cta:hover { background: rgba(127,86,217,.28); color: #fff; }
        .tw-foot-link {
          background: transparent; border: 0; color: #6F618F;
          font-size: 12px; cursor: pointer;
          display: inline-flex; align-items: center; gap: 4px;
        }
        .tw-foot-link:hover { color: #B797FF; }
        .tw-loading-indicator {
          text-align: center; padding: 8px; font-size: 11px; color: #6F618F;
        }
      `}</style>

      {/* Due Today / Overdue section */}
      {dueTodayTasks.length > 0 && (
        <AccordionSection
          label="Due today"
          count={dueTodayCount}
          markerClass="urgent"
          defaultOpen={true}
        >
          <div>
            {dueTodayTasks.map((task) => (
              <TaskRow
                key={task._id}
                task={task}
                onOpen={handleOpenTask}
                onStatusChange={handleStatusChange}
                isDue={true}
              />
            ))}
          </div>
        </AccordionSection>
      )}

      {/* Upcoming section */}
      <AccordionSection
        label="Upcoming"
        count={upcomingTasks.length}
        markerClass={upcomingTasks.length > 0 ? "warn" : "neutral"}
        defaultOpen={true}
      >
        <div className="tw-scroll-area" ref={pendingRef} onScroll={handlePendingScroll}>
          {upcomingTasks.length > 0 ? (
            upcomingTasks.map((task) => (
              <TaskRow
                key={task._id}
                task={task}
                onOpen={handleOpenTask}
                onStatusChange={handleStatusChange}
                isDue={false}
              />
            ))
          ) : (
            <div style={{ padding: 14, color: "#6F618F", fontSize: "12.5px", textAlign: "center" }}>
              No upcoming tasks
            </div>
          )}
          {loadingPending && <div className="tw-loading-indicator">Loading...</div>}
        </div>
      </AccordionSection>

      {/* Completed section */}
      <AccordionSection
        label="Completed"
        count={totalCompleted}
        markerClass="success"
        defaultOpen={false}
      >
        <div className="tw-scroll-area" ref={completedRef} onScroll={handleCompletedScroll}>
          {completedTasks.length > 0 ? (
            completedTasks.map((task) => (
              <TaskRow
                key={task._id}
                task={task}
                onOpen={handleOpenTask}
                onStatusChange={handleStatusChange}
                isDue={false}
              />
            ))
          ) : (
            <div style={{ padding: 14, color: "#6F618F", fontSize: "12.5px", textAlign: "center" }}>
              No completed tasks
            </div>
          )}
          {loadingCompleted && <div className="tw-loading-indicator">Loading...</div>}
        </div>
      </AccordionSection>

      {/* Footer */}
      <div className="tw-foot">
        <button className="tw-foot-cta" onClick={() => setTaskModal(true)}>
          <Plus size={14} /> Add task
        </button>
        <button className="tw-foot-link" onClick={() => router.push("/tasks")}>
          View all tasks <ArrowRight size={14} />
        </button>
      </div>

      {/* Drawers */}
      <AddTask
        open={taskModal}
        handleClose={() => setTaskModal(false)}
        addTask={addTask}
        edit={false}
      />
      {openModal && selectedTask && (
        <TaskDetails
          open={openModal}
          handleClose={() => { setOpenModal(false); setSelectedTask(null); refreshAll(); }}
          item={selectedTask}
        />
      )}
    </>
  );
}
