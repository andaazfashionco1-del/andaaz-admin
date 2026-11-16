"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/input";
import { SheetActions } from "@/components/ui/sheet-actions";
import { useUpdateReview } from "@/lib/queries";
import type { Review } from "@/lib/types";
import { Stars } from "./stars";

export function ReplyForm({ review, onDone }: { review: Review; onDone: () => void }) {
  const update = useUpdateReview();
  const [text, setText] = useState(review.reply?.text ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const reply = text.trim() || null;
    update.mutate(
      { id: review.id, data: { reply } },
      {
        onSuccess: () => {
          toast.success(reply ? "Reply saved" : "Reply removed");
          onDone();
        },
      },
    );
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <blockquote className="rounded-2xl border border-line bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">{review.customerName}</p>
          <Stars value={review.rating} />
        </div>
        {review.title && <p className="mt-2 font-semibold">{review.title}</p>}
        <p className="mt-1 text-sm whitespace-pre-line text-ink/80">{review.comment}</p>
      </blockquote>
      <Field
        label="Store reply"
        htmlFor="review-reply"
        hint="Shown publicly under the review. Leave empty and save to remove the reply."
      >
        <Textarea
          id="review-reply"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Thanks for shopping with Andaaz!"
          maxLength={1000}
        />
      </Field>
      <SheetActions
        onCancel={onDone}
        saving={update.isPending}
        submitLabel={!text.trim() && review.reply ? "Remove reply" : "Save reply"}
      />
    </form>
  );
}
