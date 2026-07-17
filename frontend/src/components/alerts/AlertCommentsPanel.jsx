"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getComments, postComment } from "@/app/services/commentService";
import { formatRelativeTime } from "@/lib/utils";
import { Send, Loader2, Lock } from "lucide-react";

export default function AlertCommentsPanel({ alertId, alertStatus }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const isLocked = alertStatus === "resolved" || alertStatus === "false_report";

  useEffect(() => {
    if (!alertId) return;
    setLoading(true);
    getComments(alertId)
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [alertId]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim() || isLocked) return;

    try {
      setPosting(true);
      const comment = await postComment(alertId, text.trim());
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
    <div className="mt-5 rounded-xl border border-border-subtle bg-surface-elevated p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Incident Timeline</h3>
        <span className="text-xs text-muted-foreground">
          {comments.length} update{comments.length !== 1 && "s"}
        </span>
      </div>

      <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading activity...
          </div>
        )}

        {!loading && comments.length === 0 && (
          <div className="rounded-lg border border-dashed border-border-subtle p-4 text-center text-xs text-muted-foreground">
            No updates yet.
          </div>
        )}

        {comments.map((comment) => (
          <div
            key={comment.id}
            className="rounded-lg border border-border-subtle bg-surface p-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{comment.author_name}</span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(comment.created_at)}
              </span>
            </div>
            <p className="mt-2 text-sm whitespace-pre-wrap">{comment.comment}</p>
          </div>
        ))}
      </div>

      {isLocked ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-border-subtle bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <Lock className="size-4 shrink-0" />
          Comments are locked for this incident.
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
            disabled={posting}
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