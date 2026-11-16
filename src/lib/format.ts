import type { Deal } from "./types";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const moneyFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function formatMoney(value: number) {
  return `Rs. ${moneyFormatter.format(Math.round(value))}`;
}

export function formatNumber(value: number) {
  return moneyFormatter.format(value);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** ISO string -> value for `<input type="datetime-local">` in local time. */
export function toDatetimeLocal(iso: string) {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

/** `<input type="datetime-local">` value (local time) -> ISO string. */
export function fromDatetimeLocal(value: string) {
  return new Date(value).toISOString();
}

export type DealStatus = "Active" | "Scheduled" | "Expired" | "Disabled";

export function getDealStatus(deal: Pick<Deal, "isActive" | "startsAt" | "endsAt">): DealStatus {
  if (!deal.isActive) return "Disabled";
  const now = Date.now();
  if (now < new Date(deal.startsAt).getTime()) return "Scheduled";
  if (now > new Date(deal.endsAt).getTime()) return "Expired";
  return "Active";
}

export function formatDealValue(deal: Pick<Deal, "type" | "value">) {
  return deal.type === "PERCENT" ? `${deal.value}% off` : `${formatMoney(deal.value)} off`;
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}
