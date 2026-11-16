"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { RatingSummary } from "@/components/reviews/stars";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ChipInput } from "@/components/ui/chip-input";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { formatMoney } from "@/lib/format";
import { useCategories, useSaveProduct } from "@/lib/queries";
import type { Product } from "@/lib/types";
import { ColorsInput } from "./colors-input";
import { MediaManager } from "./media-manager";

const SIZE_PRESETS = [
  { label: "Apparel", values: ["XS", "S", "M", "L", "XL", "XXL"] },
  { label: "Shoes", values: ["39", "40", "41", "42", "43", "44", "45"] },
  { label: "Other", values: ["Free Size"] },
];

const schema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(150),
    description: z.string().trim().min(1, "Description is required"),
    price: z.number({ error: "Enter a price" }).int("Whole rupees only").positive("Must be more than 0"),
    compareAtPrice: z.number().int("Whole rupees only").positive("Must be more than 0").nullable(),
    categoryId: z.string().min(1, "Choose a category"),
    sizes: z.array(z.string()),
    colors: z.array(z.object({ name: z.string(), hex: z.string() })),
    stock: z.number({ error: "Enter stock" }).int().min(0, "Cannot be negative"),
    tags: z.array(z.string()),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    isNew: z.boolean(),
    media: z.array(z.object({ url: z.string(), type: z.enum(["IMAGE", "VIDEO"]) })),
  })
  .refine((v) => v.compareAtPrice === null || Number.isNaN(v.price) || v.compareAtPrice > v.price, {
    path: ["compareAtPrice"],
    message: "Should be higher than the price",
  });

type FormValues = z.infer<typeof schema>;

const toNullableNumber = (v: unknown) => (v === "" || v === null || v === undefined ? null : Number(v));

function defaults(product?: Product): FormValues {
  return {
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? Number.NaN,
    compareAtPrice: product?.compareAtPrice ?? null,
    categoryId: product?.category?.id ?? "",
    sizes: product?.sizes ?? [],
    colors: product?.colors ?? [],
    stock: product?.stock ?? 0,
    tags: product?.tags ?? [],
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    isNew: product?.isNew ?? true,
    media: product?.media.map(({ url, type }) => ({ url, type })) ?? [],
  };
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const save = useSaveProduct();
  const { data: categories } = useCategories();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults(product) });

  const onSubmit = handleSubmit((values) => {
    save.mutate(
      { id: product?.id, data: values },
      {
        onSuccess: (saved) => {
          if (product) {
            toast.success("Product saved");
            reset(defaults(saved));
          } else {
            toast.success("Product created");
            router.push("/products");
          }
        },
      },
    );
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <ButtonLink href="/products" variant="secondary" size="icon" aria-label="Back to products">
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </ButtonLink>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold">{product ? product.name : "New product"}</h1>
            {product && (
              <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-muted">
                /{product.slug} · {product.soldCount} sold ·
                <Link
                  href={`/reviews?search=${encodeURIComponent(product.name)}`}
                  className="rounded-full hover:underline"
                  aria-label={`Reviews for ${product.name}`}
                >
                  <RatingSummary rating={product.rating} />
                </Link>
                {product.activeDeal && (
                  <Badge tone="pink">
                    {product.activeDeal.title} → {formatMoney(product.finalPrice)}
                  </Badge>
                )}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/products" variant="secondary">
            Cancel
          </ButtonLink>
          <Button type="submit" loading={save.isPending} disabled={product && !isDirty}>
            {product ? "Save changes" : "Create product"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader title="Details" />
            <div className="flex flex-col gap-4">
              <Field label="Name" htmlFor="p-name" error={errors.name?.message} required>
                <Input id="p-name" placeholder="e.g. Oversized Puffer Jacket" aria-invalid={Boolean(errors.name)} {...register("name")} />
              </Field>
              <Field label="Description" htmlFor="p-desc" error={errors.description?.message} required>
                <Textarea
                  id="p-desc"
                  rows={6}
                  placeholder="Fabric, fit, care instructions and what makes it special…"
                  aria-invalid={Boolean(errors.description)}
                  {...register("description")}
                />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader title="Media" />
            <Controller
              control={control}
              name="media"
              render={({ field }) => <MediaManager value={field.value} onChange={field.onChange} />}
            />
          </Card>

          <Card>
            <CardHeader title="Variants" />
            <div className="flex flex-col gap-4">
              <Field label="Sizes" htmlFor="p-sizes" hint="Type and press Enter, or tap a preset.">
                <Controller
                  control={control}
                  name="sizes"
                  render={({ field }) => (
                    <ChipInput
                      id="p-sizes"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Add size"
                      presets={SIZE_PRESETS}
                    />
                  )}
                />
              </Field>
              <Field label="Colors">
                <Controller
                  control={control}
                  name="colors"
                  render={({ field }) => <ColorsInput value={field.value} onChange={field.onChange} />}
                />
              </Field>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title="Pricing & stock" />
            <div className="flex flex-col gap-4">
              <Field label="Price (Rs.)" htmlFor="p-price" error={errors.price?.message} required>
                <Input
                  id="p-price"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="e.g. 4999"
                  aria-invalid={Boolean(errors.price)}
                  {...register("price", { valueAsNumber: true })}
                />
              </Field>
              <Field
                label="Compare-at price (Rs.)"
                htmlFor="p-compare"
                error={errors.compareAtPrice?.message}
                hint="Optional “was” price shown crossed out."
              >
                <Input
                  id="p-compare"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="e.g. 6499"
                  aria-invalid={Boolean(errors.compareAtPrice)}
                  {...register("compareAtPrice", { setValueAs: toNullableNumber })}
                />
              </Field>
              <Field label="Stock" htmlFor="p-stock" error={errors.stock?.message} required>
                <Input
                  id="p-stock"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="e.g. 25"
                  aria-invalid={Boolean(errors.stock)}
                  {...register("stock", { valueAsNumber: true })}
                />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader title="Organisation" />
            <div className="flex flex-col gap-4">
              <Field label="Category" htmlFor="p-category" error={errors.categoryId?.message} required>
                <Select id="p-category" aria-invalid={Boolean(errors.categoryId)} {...register("categoryId")}>
                  <option value="">Choose a category</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.isActive ? "" : " (inactive)"}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Tags" htmlFor="p-tags" hint="Used for search, e.g. summer, cotton.">
                <Controller
                  control={control}
                  name="tags"
                  render={({ field }) => (
                    <ChipInput
                      id="p-tags"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Add tag"
                      transform={(t) => t.toLowerCase()}
                    />
                  )}
                />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader title="Visibility" />
            <div className="flex flex-col gap-2">
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
                  <Switch label="Featured" description="Shown in featured sections" checked={field.value} onChange={field.onChange} />
                )}
              />
              <Controller
                control={control}
                name="isNew"
                render={({ field }) => (
                  <Switch label="New arrival" description="Shows a “New” tag" checked={field.value} onChange={field.onChange} />
                )}
              />
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
