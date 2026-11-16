"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { MediaField } from "@/components/media/media-field";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SheetActions } from "@/components/ui/sheet-actions";
import { Switch } from "@/components/ui/switch";
import { useSaveBanner } from "@/lib/queries";
import type { Banner } from "@/lib/types";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  subtitle: z.string().max(200),
  media: z.object({ url: z.string(), type: z.enum(["IMAGE", "VIDEO"]) }).nullable().refine(Boolean, "Add an image or video"),
  ctaText: z.string().max(40),
  ctaLink: z.string().max(300),
  sortOrder: z.number({ error: "Enter a number" }).int(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function BannerForm({ banner, onDone }: { banner: Banner | null; onDone: () => void }) {
  const save = useSaveBanner();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: banner?.title ?? "",
      subtitle: banner?.subtitle ?? "",
      media: banner ? { url: banner.mediaUrl, type: banner.mediaType } : null,
      ctaText: banner?.ctaText ?? "",
      ctaLink: banner?.ctaLink ?? "",
      sortOrder: banner?.sortOrder ?? 0,
      isActive: banner?.isActive ?? true,
    },
  });

  const onSubmit = handleSubmit((v) => {
    if (!v.media) return;
    save.mutate(
      {
        id: banner?.id,
        data: {
          title: v.title,
          subtitle: v.subtitle.trim() || null,
          mediaUrl: v.media.url,
          mediaType: v.media.type,
          ctaText: v.ctaText.trim() || null,
          ctaLink: v.ctaLink.trim() || null,
          sortOrder: v.sortOrder,
          isActive: v.isActive,
        },
      },
      { onSuccess: onDone },
    );
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Field label="Image or video" error={errors.media?.message} required>
        <Controller
          control={control}
          name="media"
          render={({ field }) => (
            <MediaField label="Banner media" accept="ALL" value={field.value} onChange={field.onChange} />
          )}
        />
      </Field>
      <Field label="Title" htmlFor="b-title" error={errors.title?.message} required>
        <Input id="b-title" aria-invalid={Boolean(errors.title)} {...register("title")} />
      </Field>
      <Field label="Subtitle" htmlFor="b-subtitle">
        <Input id="b-subtitle" {...register("subtitle")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Button text" htmlFor="b-cta">
          <Input id="b-cta" placeholder="Shop now" {...register("ctaText")} />
        </Field>
        <Field label="Button link" htmlFor="b-link" hint="e.g. /shop?category=men">
          <Input id="b-link" placeholder="/shop" {...register("ctaLink")} />
        </Field>
      </div>
      <Field label="Sort order" htmlFor="b-sort" error={errors.sortOrder?.message} hint="Lower numbers show first.">
        <Input id="b-sort" type="number" className="max-w-32" {...register("sortOrder", { valueAsNumber: true })} />
      </Field>
      <Controller
        control={control}
        name="isActive"
        render={({ field }) => (
          <Switch label="Active" description="Show this banner on the home page" checked={field.value} onChange={field.onChange} />
        )}
      />
      <SheetActions onCancel={onDone} saving={save.isPending} submitLabel={banner ? "Save changes" : "Create banner"} />
    </form>
  );
}
