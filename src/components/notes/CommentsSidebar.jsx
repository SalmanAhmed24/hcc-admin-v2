
"use client";

import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Trash2,
  CornerDownRight,
  PenLine,
  Link as LinkIcon,
  Paperclip,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useComments } from "@/hooks/useNotes";
import { useNoteStore } from "@/store/noteStore";
import MentionInput from "./MentionInput";
import { parseMentionBody } from "@/hooks/useMentions";
import { AtSign } from "lucide-react";

const AnchorBadge = ({ anchorType, anchorId }) => {
  if (!anchorType || anchorType === "general") return null;

  const config = {
    text:       { icon: <PenLine size={9} />,   label: "In text",      color: "#38bdf8" },
    canvas:     { icon: <PenLine size={9} />,   label: "On canvas",    color: "#a78bfa" },
    attachment: { icon: <Paperclip size={9} />, label: "On file",      color: "#34d399" },
  }[anchorType] || {};

  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs mb-2"
      style={{
        background: config.color + "15",
        border: `1px solid ${config.color}30`,
        color: config.color,
        fontSize: "10px",
      }}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

const Avatar = ({ user, size = 22 }) => {
  const fullName = user?.firstName && user?.secondName
    ? `${user.firstName} ${user.secondName}`
    : user?.name || "Unknown User";
  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const hues = [210, 160, 280, 30, 340, 190];
  const hue = user?.id
    ? hues[user.id.charCodeAt(0) % hues.length]
    : 210;

  return (
    <div
      className="flex-shrink-0 flex items-center justify-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `hsl(${hue} 60% 25% / 0.8)`,
        border: `1px solid hsl(${hue} 50% 40% / 0.4)`,
        color: `hsl(${hue} 80% 70%)`,
      }}
    >
      {initials}
    </div>
  );
};

const ReplyInput = ({ onSubmit, onCancel, isSubmitting }) => {
  const [text, setText] = useState("");
  const ref = useRef(null);
 
  useEffect(() => ref.current?.focus(), []);
 
  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  };
 
  return (
    <div className="mt-2 pl-6">
      <MentionInput
        ref={ref}
        value={text}
        onChange={setText}
        placeholder="Write a reply… @ to mention"
        rows={2}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
          if (e.key === "Escape") onCancel();
        }}
      />
      <div className="flex gap-2 mt-1.5">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!text.trim() || isSubmitting}
          style={{
            height: 26,
            fontSize: "11px",
            background: "#d97706",
            color: "#000",
            border: "none",
          }}
        >
          {isSubmitting ? "Sending…" : "Reply"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          style={{ height: 26, fontSize: "11px", color: "#475569" }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

const MentionBody = ({ body }) => {
  const segments = parseMentionBody(body);
  return (
    <>
      {segments.map((seg, i) =>
        seg.type === "mention" ? (
          <span
            key={i}
            className="inline-flex items-center gap-0.5 font-semibold rounded px-1"
            style={{
              background: "#d9770618",
              border:     "1px solid #d9770630",
              color:      "#d97706",
              fontSize:   "11px",
              lineHeight: 1.6,
            }}
          >
            <AtSign size={9} />
            {seg.name}
          </span>
        ) : (
          <span key={i}>{seg.value}</span>
        )
      )}
    </>
  );
};

const CommentItem = ({ comment, noteId, currentUserId, noteOwnerId }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const { addReply, resolveComment, deleteComment, isSubmitting } = useComments(noteId);
  const { activeCommentId, setActiveCommentId } = useNoteStore();
  const isActive = activeCommentId === comment.id;
  const ref = useRef(null);
  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isActive]);

  const canDelete =
    comment.author?.id === currentUserId || noteOwnerId === currentUserId;

  const timeAgo = comment.createdAt
    ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
    : "";

  return (
    <div
      ref={ref}
      className="rounded-xl transition-all duration-200"
      style={{
        background: isActive ? "#1a1f2e" : "#111520",
        border: isActive ? "1px solid #d9770640" : "1px solid #1a2035",
        padding: "10px 12px",
        opacity: comment.resolved ? 0.55 : 1,
      }}
      onClick={() => setActiveCommentId(isActive ? null : comment.id)}
    >
      <div className="flex items-start gap-2 mb-1.5">
        <Avatar user={comment.author} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold" style={{ color: "#cbd5e1" }}>
              {comment.author?.firstName + " " + comment.author?.secondName || "Unknown"}
            </span>
            <span className="text-xs" style={{ color: "#334155" }}>
              {timeAgo}
            </span>
            {comment.resolved && (
              <span
                className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                style={{ background: "#34d39918", color: "#34d399", fontSize: "10px" }}
              >
                <CheckCircle2 size={9} /> Resolved
              </span>
            )}
          </div>
          <AnchorBadge anchorType={comment.anchorType} anchorId={comment.anchorId} />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!comment.resolved && (
            <button
              type="button"
              title="Mark resolved"
              onClick={(e) => {
                e.stopPropagation();
                resolveComment(comment.id);
              }}
              className="p-1 rounded transition-colors hover:bg-white/5"
              style={{ color: "#334155" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#34d399")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#334155")}
            >
              <CheckCircle2 size={13} />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              title="Delete comment"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Delete this comment?")) deleteComment(comment._id, currentUserId);
              }}
              className="p-1 rounded transition-colors hover:bg-white/5"
              style={{ color: "#334155" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#334155")}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="text-xs leading-relaxed mb-2" style={{ color: "#94a3b8" }}>
        <MentionBody body={comment.body} />
      </div>
 
      {/* Replies toggle */}
      {comment.replies?.length > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowReplies((v) => !v);
          }}
          className="flex items-center gap-1 text-xs mb-2"
          style={{ color: "#475569" }}
        >
          {showReplies ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
        </button>
      )}
 
      {/* Replies list */}
      {showReplies && comment.replies?.map((reply) => (
        <div
          key={reply.id}
          className="flex gap-2 mt-1.5 pl-4"
          style={{ borderLeft: "2px solid #1e2538" }}
        >
          <Avatar user={reply.author} size={18} />
          <div className="flex-1">
            <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>
              {reply.author?.name}
            </span>
            <span className="text-xs ml-2" style={{ color: "#334155" }}>
              {reply.createdAt
                ? formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })
                : ""}
            </span>
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#64748b" }}>
              <MentionBody body={reply.body} />
            </p>
          </div>
        </div>
      ))}
 
      {/* Reply input */}
      {isReplying ? (
        <ReplyInput
          isSubmitting={isSubmitting}
          onSubmit={async (text) => {
            await addReply(comment._id, currentUserId, text);
            setIsReplying(false);
          }}
          onCancel={() => setIsReplying(false)}
        />
      ) : (
        !comment.resolved && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsReplying(true);
            }}
            className="flex items-center gap-1 text-xs mt-1"
            style={{ color: "#334155" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#64748b")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#334155")}
          >
            <CornerDownRight size={11} />
            Reply
          </button>
        )
      )}
    </div>
  );
};

const NewCommentInput = ({ noteId, currentUserId }) => {
  const [text, setText] = useState("");
  const { addComment, isSubmitting } = useComments(noteId);
  const handleSubmit = async () => {
    if (!text.trim()) return;
    await addComment({ body: text.trim(), anchorType: "general", currentUserId: currentUserId });
    setText("");
  };

  return (
    <div className="p-3" style={{ borderTop: "1px solid #1a2035" }}>
      <MentionInput
        value={text}
        onChange={setText}
        placeholder="Add a comment… ⌘↵ to post, @ to mention"
        rows={3}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
        }}
        style={{ marginBottom: "8px" }}
      />
      <Button
        onClick={handleSubmit}
        disabled={!text.trim() || isSubmitting}
        className="w-full"
        style={{
          height:     32,
          fontSize:   "12px",
          background: text.trim() ? "#d97706" : "#1e2538",
          color:      text.trim() ? "#000"    : "#334155",
          border:     "none",
          transition: "background 0.2s",
        }}
      >
        {isSubmitting ? "Posting…" : "Post Comment"}
      </Button>
    </div>
  );
};

export default function CommentsSidebar({
  note,
  currentUserId,
  isOpen,
  onClose,
}) {
  const [filter, setFilter] = useState("open"); // "all" | "open" | "resolved"
  const comments = note?.comments || [];
  const filtered = comments.filter((c) => {
    if (filter === "open") return !c.resolved;
    if (filter === "resolved") return c.resolved;
    return true;
  });

  const openCount = comments.filter((c) => !c.resolved).length;

  return (
    <div
      className="flex flex-col h-full transition-all duration-300"
      style={{
        width: isOpen ? 280 : 0,
        minWidth: isOpen ? 280 : 0,
        overflow: "hidden",
        borderLeft: "1px solid #1a2035",
        background: "#0d1120",
      }}
    >
      {isOpen && (
        <>
        <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ borderBottom: "1px solid #1a2035" }}
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={14} style={{ color: "#d97706" }} />
              <span className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
                Comments
              </span>
              {openCount > 0 && (
                <Badge
                  variant="secondary"
                  className="h-4 text-xs px-1.5 font-normal"
                  style={{ background: "#d9770620", color: "#d97706", border: "1px solid #d9770640" }}
                >
                  {openCount}
                </Badge>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded transition-colors hover:bg-white/5"
              style={{ color: "#334155" }}
            >
              <X size={14} />
            </button>
          </div>
          <div
            className="flex gap-1 px-3 py-2 flex-shrink-0"
            style={{ borderBottom: "1px solid #1a2035" }}
          >
            {["open", "resolved", "all"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className="px-2.5 py-1 rounded-md text-xs capitalize transition-colors"
                style={{
                  background: filter === f ? "#1e2538" : "transparent",
                  color: filter === f ? "#e2e8f0" : "#475569",
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {filtered.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center flex-1 py-12 text-center"
                style={{ color: "#334155" }}
              >
                <MessageSquare size={24} strokeWidth={1.5} className="mb-2 opacity-40" />
                <p className="text-xs">
                  {filter === "open"
                    ? "No open comments"
                    : filter === "resolved"
                    ? "No resolved comments"
                    : "No comments yet"}
                </p>
              </div>
            ) : (
              filtered.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  noteId={note.id}
                  currentUserId={currentUserId}
                  noteOwnerId={note.createdBy?.id}
                />
              ))
            )}
          </div>
          <NewCommentInput 
          noteId={note?.id}
          currentUserId={currentUserId}
          />
        </>
      )}
    </div>
  );
}