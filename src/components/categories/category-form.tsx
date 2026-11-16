"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { MediaField } from "@/components/media/media-field";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SheetActions } from "@/components/ui/sheet-actions";
import { Switch } from "@/components/ui/switch";
import { useSaveCategory } from "@/lib/queries";
import type { Category } from "@/lib/types";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  description: z.string().max(1000),
  image: z.string().nullable(),
  parentId: z.string(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  sortOrder: z.number({ error: "Enter a number" }).int(),
});

type FormValues = z.infer<typeof schema>;

/** Ids of `id` and all of its descendants (cannot be chosen as parent). */
function descendantIds(categories: Category[], id: string): Set<string> {
  const ids = new Set([id]);
  let added = true;
  while (added) {
    added = false;
    for (const c of categories) {
      if (c.parentId && ids.has(c.parentId) && !ids.has(c.id)) {
        ids.add(c.id);
        added = true;
      }
    }
  }
  return ids;
}

export function CategoryForm({
  category,
  categories,
  onDone,
}: {
  category: Category | null;
  categories: Category[];
  onDone: () => void;
}) {
  const save = useSaveCategory();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
      image: category?.image ?? null,
      parentId: category?.parentId ?? "",
      isActive: category?.isActive ?? true,
      isFeatured: category?.isFeatured ?? false,
      sortOrder: category?.sortOrder ?? 0,
    },
  });

  const excluded = category ? descendantIds(categories, category.id) : new Set<string>();
  const parentOptions = categories.filter((c) => !excluded.has(c.id));

  const onSubmit = handleSubmit((values) => {
    save.mutate(
      {
        id: category?.id,
        data: {
          ...values,
          description: values.description.trim() || null,
          parentId: values.parentId || null,
        },
      },
      { onSuccess: onDone },
    );
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Field label="Name" htmlFor="cat-name" error={errors.name?.message} required>
        <Input id="cat-name" aria-invalid={Boolean(errors.name)} {...register("name")} />
      </Field>
      <Field label="Description" htmlFor="cat-desc" error={errors.description?.message}>
        <Textarea id="cat-desc" rows={3} {...register("description")} />
      </Field>
      <Field label="Parent category" htmlFor="cat-parent" hint="Leave empty for a top-level category.">
        <Select id="cat-parent" {...register("parentId")}>
          <option value="">None (top level)</option>
          {parentOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Image">
        <Controller
          control={control}
          name="image"
          render={({ field }) => (
            <MediaField
              label="Category image"
              value={field.value ? { url: field.value, type: "IMAGE" } : null}
              onChange={(media) => field.onChange(media?.url ?? null)}
            />
          )}
        />
      </Field>
      <Field label="Sort order" htmlFor="cat-sort" error={errors.sortOrder?.message} hint="Lower numbers show first.">
        <Input id="cat-sort" type="number" className="max-w-32" {...register("sortOrder", { valueAsNumber: true })} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <Switch label="Active" description="Visible on the store" checked={field.value} onChange={field.onChange} />
          )}
        />
        <Controller
          control={control}
          name="isFeatured"
          render={({ field }) => (
            <Switch label="Featured" description="Shown on the home page" checked={field.value} onChange={field.onChange} />
          )}
        />
      </div>
      <SheetActions onCancel={onDone} saving={save.isPending} submitLabel={category ? "Save changes" : "Create category"} />
    </form>
  );
}
