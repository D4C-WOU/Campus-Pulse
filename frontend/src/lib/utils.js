import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Backend returns naive UTC timestamps with no timezone suffix. Appending "Z"
// tells the browser to parse it as UTC -- without this, IST users see times
// ~5.5 hours off ("5h ago" instead of "just now").
export function formatRelativeTime(isoString) {
  if (!isoString) return "";
  const utcString = isoString.endsWith("Z") ? isoString : `${isoString}Z`;
  return formatDistanceToNow(new Date(utcString), { addSuffix: true });
}
