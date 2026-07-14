"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getComments, postComment } from "@/app/services/commentService";
import { formatRelativeTime } from "@/lib/utils";
import { Send } from "lucide-react";

export default function AlertCommentsPanel({ alertId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!alertId) return;
    getComments(alertId)
      .then(setComments)
      .catch(() => toast.error("Couldn't load comments."))
      .finally(() => setLoading(false));
  }, [alertId]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setPosting(true);
    try {
      const newComment = await postComment(alertId, text.trim());
      setComments((prev) => [...prev, newComment]);
      setText("");
    } catch {
      toast.error("Couldn't post comment.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mt-4 border-t border-border-subtle pt-4">
      <h3 className="text-sm font-medium">Activity timeline</h3>

      <div className="mt-3 max-h-56 space-y-3 overflow-y-auto pr-1">
        {loading && <p className="text-xs text-muted-foreground">Loading...</p>}
        {!loading && comments.length === 0 && (
          <p className="text-xs text-muted-foreground">No activity yet.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="rounded-xl bg-surface-elevated p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">{c.author_name}</span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(c.created_at)}
              </span>
            </div>
            <p className="mt-1 text-sm">{c.comment}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handlePost} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add an update..."
          className="flex-1 rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm outline-none focus:border-border-strong"
        />
        <button
          type="submit"
          disabled={posting}
          className="flex items-center justify-center rounded-xl bg-foreground px-3 py-2 text-background disabled:opacity-50"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}