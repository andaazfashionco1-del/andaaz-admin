import { Badge, type BadgeTone } from "@/components/ui/badge";
import { type DealStatus, getDealStatus } from "@/lib/format";
import type { Deal } from "@/lib/types";

const tones: Record<DealStatus, BadgeTone> = {
  Active: "green",
  Scheduled: "blue",
  Expired: "neutral",
  Disabled: "pink",
};

export function DealStatusBadge({ deal }: { deal: Deal }) {
  const status = getDealStatus(deal);
  return <Badge tone={tones[status]}>{status}</Badge>;
}
