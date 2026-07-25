"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getComments, postComment } from "@/app/services/commentService";
import { formatRelativeTime } from "@/lib/utils";
import { Send, Loader2, Lock, RefreshCw } from "lucide-react";

export default function AlertCommentsPanel({ alertId, alertStatus }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(false);

  const isLocked = alertStatus === "resolved" || alertStatus === "false_report";

  const fetchComments = async () => {
    if (!alertId) return;
    setLoading(true);
    setError(false);
    try {
      const data = await getComments(alertId);
      setComments(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever the alert ID changes OR when status changes
  // This fixes the bug where comments posted in one status weren't
  // visible after the alert moved to the next status.
  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertId, alertStatus]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim() || isLocked) return;

    try {
      setPosting(true);
      const comment = await postComment(alertId, text.trim());
      // Append the new comment and re-fetch to pick up any system entries
      // added by the backend alongside the user comment
      setComments((prev) => [...prev, comment]);
      setText("");
      toast.success("Comment added.");
    } catch {
      toast.error("Couldn't post comment.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mt-2 rounded-xl border border-border-subtle bg-surface-elevated p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Incident Timeline</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {comments.length} update{comments.length !== 1 && "s"}
          </span>
          <button
            onClick={fetchComments}
            disabled={loading}
            className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-40"
            title="Refresh timeline"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
        {loading && (
          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading timeline...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-lg border border-dashed border-border-subtle p-4 text-center">
            <p className="text-xs text-muted-foreground">Couldn't load timeline.</p>
            <button
              onClick={fetchComments}
              className="mt-2 text-xs font-medium text-foreground underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && comments.length === 0 && (
          <div className="rounded-lg border border-dashed border-border-subtle p-4 text-center text-xs text-muted-foreground">
            No updates yet.
          </div>
        )}

        {comments.map((comment) => {
          // System entries (author_name === "System") get a subtly different style
          const isSystem = comment.author_name === "System" || !comment.user_id;

          return (
            <div
              key={comment.id}
              className={`rounded-lg border p-3 ${isSystem
                  ? "border-border-subtle bg-surface-elevated/60"
                  : "border-border-subtle bg-surface"
                }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-xs font-semibold ${isSystem ? "text-muted-foreground italic" : "text-foreground"
                    }`}
                >
                  {isSystem ? "System" : comment.author_name}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatRelativeTime(comment.created_at)}
                </span>
              </div>
              <p
                className={`mt-1.5 text-sm whitespace-pre-wrap leading-relaxed ${isSystem ? "text-muted-foreground" : ""
                  }`}
              >
                {comment.comment}
              </p>
            </div>
          );
        })}
      </div>

      {isLocked ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-border-subtle bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <Lock className="size-4 shrink-0" />
          Timeline is read-only for {alertStatus === "resolved" ? "resolved" : "false report"} alerts.
        </div>
      ) : (
        <form onSubmit={handlePost} className="mt-4 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add investigation notes..."
            className="flex-1 rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm outline-none focus:border-border-strong"
          />
          <button
            type="submit"
            disabled={posting || !text.trim()}
            className="flex items-center justify-center rounded-xl bg-foreground px-4 text-background disabled:opacity-50"
          >
            {posting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </button>
        </form>
      )}
    </div>
  );
}