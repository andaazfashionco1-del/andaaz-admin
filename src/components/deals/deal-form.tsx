"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { MediaField } from "@/components/media/media-field";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SheetActions } from "@/components/ui/sheet-actions";
import { Switch } from "@/components/ui/switch";
import { Tabs } from "@/components/ui/tabs";
import { fromDatetimeLocal, toDatetimeLocal } from "@/lib/format";
import { useCategories, useSaveDeal } from "@/lib/queries";
import type { Deal } from "@/lib/types";
import { ProductMultiSelect } from "./product-multi-select";

const schema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(120),
    description: z.string().max(1000),
    code: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9_-]*$/, "Letters, numbers, - and _ only")
      .max(32),
    type: z.enum(["PERCENT", "FIXED"]),
    value: z.number({ error: "Enter a value" }).int("Whole numbers only").positive("Must be more than 0"),
    scope: z.enum(["ALL", "CATEGORY", "PRODUCTS"]),
    categoryId: z.string(),
    productIds: z.array(z.string()),
    minOrderAmount: z.number().int().min(0).nullable(),
    startsAt: z.string().min(1, "Start date is required"),
    endsAt: z.string().min(1, "End date is required"),
    isActive: z.boolean(),
    showOnHome: z.boolean(),
    bannerUrl: z.string().nullable(),
  })
  .superRefine((v, ctx) => {
    if (v.type === "PERCENT" && v.value > 100)
      ctx.addIssue({ code: "custom", path: ["value"], message: "Percent cannot exceed 100" });
    if (v.scope === "CATEGORY" && !v.categoryId)
      ctx.addIssue({ code: "custom", path: ["categoryId"], message: "Choose a category" });
    if (v.scope === "PRODUCTS" && v.productIds.length === 0)
      ctx.addIssue({ code: "custom", path: ["productIds"], message: "Select at least one product" });
    if (v.startsAt && v.endsAt && new Date(v.endsAt) <= new Date(v.startsAt))
      ctx.addIssue({ code: "custom", path: ["endsAt"], message: "Must be after the start date" });
  });

type FormValues = z.infer<typeof schema>;

const toNullableNumber = (v: unknown) => (v === "" || v === null || v === undefined ? null : Number(v));

function defaults(deal: Deal | null): FormValues {
  const now = new Date();
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    title: deal?.title ?? "",
    description: deal?.description ?? "",
    code: deal?.code ?? "",
    type: deal?.type ?? "PERCENT",
    value: deal?.value ?? Number.NaN,
    scope: deal?.scope ?? "ALL",
    categoryId: deal?.categoryId ?? "",
    productIds: deal?.productIds ?? [],
    minOrderAmount: deal?.minOrderAmount ?? null,
    startsAt: toDatetimeLocal(deal?.startsAt ?? now.toISOString()),
    endsAt: toDatetimeLocal(deal?.endsAt ?? weekLater.toISOString()),
    isActive: deal?.isActive ?? true,
    showOnHome: deal?.showOnHome ?? false,
    bannerUrl: deal?.bannerUrl ?? null,
  };
}

export function DealForm({ deal, onDone }: { deal: Deal | null; onDone: () => void }) {
  const save = useSaveDeal();
  const { data: categories } = useCategories();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults(deal) });

  const [type, scope, code] = useWatch({ control, name: ["type", "scope", "code"] });
  const isCoupon = code.trim().length > 0;

  const onSubmit = handleSubmit((v) => {
    save.mutate(
      {
        id: deal?.id,
        data: {
          title: v.title,
          description: v.description.trim() || null,
          code: isCoupon ? v.code.trim().toUpperCase() : null,
          type: v.type,
          value: v.value,
          scope: v.scope,
          categoryId: v.scope === "CATEGORY" ? v.categoryId : null,
          productIds: v.scope === "PRODUCTS" ? v.productIds : [],
          minOrderAmount: isCoupon ? v.minOrderAmount : null,
          startsAt: fromDatetimeLocal(v.startsAt),
          endsAt: fromDatetimeLocal(v.endsAt),
          isActive: v.isActive,
          showOnHome: v.showOnHome,
          bannerUrl: v.bannerUrl,
        },
      },
      { onSuccess: onDone },
    );
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Field label="Title" htmlFor="d-title" error={errors.title?.message} required>
        <Input id="d-title" placeholder="e.g. Eid Sale" aria-invalid={Boolean(errors.title)} {...register("title")} />
      </Field>
      <Field label="Description" htmlFor="d-desc">
        <Textarea id="d-desc" rows={2} {...register("description")} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Discount type" htmlFor="d-type">
          <Select id="d-type" {...register("type")}>
            <option value="PERCENT">Percentage (%)</option>
            <option value="FIXED">Fixed amount (Rs.)</option>
          </Select>
        </Field>
        <Field label={type === "PERCENT" ? "Value (%)" : "Value (Rs.)"} htmlFor="d-value" error={errors.value?.message} required>
          <Input
            id="d-value"
            type="number"
            min={1}
            max={type === "PERCENT" ? 100 : undefined}
            aria-invalid={Boolean(errors.value)}
            {...register("value", { valueAsNumber: true })}
          />
        </Field>
      </div>

      <Field
        label="Coupon code"
        htmlFor="d-code"
        error={errors.code?.message}
        hint={
          isCoupon
            ? "Customers enter this code at checkout to get the discount."
            : "Leave empty for an automatic discount applied to product prices. Set a code to make it a checkout coupon."
        }
      >
        <Input
          id="d-code"
          placeholder="e.g. GENZ20"
          className="uppercase"
          aria-invalid={Boolean(errors.code)}
          {...register("code")}
        />
      </Field>

      <Field
        label="Minimum order amount (Rs.)"
        htmlFor="d-min"
        error={errors.minOrderAmount?.message}
        hint={isCoupon ? "Optional. Subtotal required for the coupon to apply." : "Only applies to coupon codes."}
      >
        <Input
          id="d-min"
          type="number"
          min={0}
          disabled={!isCoupon}
          {...register("minOrderAmount", { setValueAs: toNullableNumber })}
        />
      </Field>

      <Field label="Applies to">
        <Controller
          control={control}
          name="scope"
          render={({ field }) => (
            <Tabs
              label="Deal scope"
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: "ALL", label: "All products" },
                { value: "CATEGORY", label: "A category" },
                { value: "PRODUCTS", label: "Specific products" },
              ]}
            />
          )}
        />
      </Field>
      {scope === "CATEGORY" && (
        <Field label="Category" htmlFor="d-category" error={errors.categoryId?.message} required>
          <Select id="d-category" aria-invalid={Boolean(errors.categoryId)} {...register("categoryId")}>
            <option value="">Choose a category</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
      )}
      {scope === "PRODUCTS" && (
        <Field label="Products" error={errors.productIds?.message} required>
          <Controller
            control={control}
            name="productIds"
            render={({ field }) => <ProductMultiSelect value={field.value} onChange={field.onChange} />}
          />
        </Field>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Starts" htmlFor="d-start" error={errors.startsAt?.message} required>
          <Input id="d-start" type="datetime-local" {...register("startsAt")} />
        </Field>
        <Field label="Ends" htmlFor="d-end" error={errors.endsAt?.message} required>
          <Input id="d-end" type="datetime-local" aria-invalid={Boolean(errors.endsAt)} {...register("endsAt")} />
        </Field>
      </div>

      <Field label="Banner image" hint="Optional, shown with the deal on the storefront.">
        <Controller
          control={control}
          name="bannerUrl"
          render={({ field }) => (
            <MediaField
              label="Deal banner"
              value={field.value ? { url: field.value, type: "IMAGE" } : null}
              onChange={(media) => field.onChange(media?.url ?? null)}
            />
          )}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <Switch label="Enabled" description="Turn the deal on or off" checked={field.value} onChange={field.onChange} />
          )}
        />
        <Controller
          control={control}
          name="showOnHome"
          render={({ field }) => (
            <Switch label="Show on home" description="Feature on the home page" checked={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <SheetActions onCancel={onDone} saving={save.isPending} submitLabel={deal ? "Save changes" : "Create deal"} />
    </form>
  );
}
