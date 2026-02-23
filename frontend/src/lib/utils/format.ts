/** Format a date as a relative time string (e.g. "5m ago", "2h ago"). */
export function formatRelativeTime(date: Date | string | null): string {
    if (!date) return "Never";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "Unknown";

    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
}

/** Format a Date object to locale date string. */
export function formatDate(date: Date | string | null): string {
    if (!date) return "N/A";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "Invalid date";
    return d.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

/** Format phone number for display (basic). */
export function formatPhone(phone: string): string {
    if (!phone) return "N/A";
    // simple: keep as-is but mask if longer than 4 chars
    return phone.length > 4 ? `***${phone.slice(-4)}` : phone;
}
