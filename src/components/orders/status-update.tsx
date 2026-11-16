"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useUpdateOrderStatus } from "@/lib/queries";
import type { Order, OrderStatus } from "@/lib/types";
import { orderStatusLabel } from "./order-status-badge";

/** Forward-only transitions enforced by the API (it rejects anything else with a 400). */
const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "PROCESSING", "SHIPPED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "SHIPPED", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function StatusUpdate({ order }: { order: Order }) {
  const update = useUpdateOrderStatus();
  const options = NEXT_STATUSES[order.status];
  const [status, setStatus] = useState<OrderStatus | undefined>(options[0]);
  const [note, setNote] = useState("");

  if (!status) {
    return (
      <p className="text-sm text-muted">
        This order is {orderStatusLabel[order.status].toLowerCase()} — its status can no longer change.
      </p>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate({ id: order.id, status, note: note.trim() || undefined });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Field label="New status" htmlFor="o-status">
        <Select id="o-status" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
          {options.map((s) => (
            <option key={s} value={s}>
              {orderStatusLabel[s]}
            </option>
          ))}
        </Select>
      </Field>
      <Field
        label="Note"
        htmlFor="o-note"
        hint={status === "CANCELLED" ? "Cancelling restores product stock." : "Optional, saved in the history."}
      >
        <Textarea
          id="o-note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Courier tracking number"
        />
      </Field>
      <Button type="submit" loading={update.isPending} variant={status === "CANCELLED" ? "danger" : "primary"}>
        {status === "CANCELLED" ? "Cancel order" : `Mark as ${orderStatusLabel[status].toLowerCase()}`}
      </Button>
    </form>
  );
}
