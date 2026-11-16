"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "./api";
import { errorMessage } from "./format";
import type {
  AdminStats,
  Banner,
  BannerInput,
  Category,
  CategoryInput,
  Deal,
  DealInput,
  MediaAsset,
  MediaType,
  Order,
  OrderStatus,
  Paginated,
  Product,
  ProductInput,
  Review,
} from "./types";

export const queryKeys = {
  stats: ["stats"] as const,
  categories: ["categories"] as const,
  products: ["products"] as const,
  product: (id: string) => ["products", "detail", id] as const,
  deals: ["deals"] as const,
  banners: ["banners"] as const,
  orders: ["orders"] as const,
  order: (id: string) => ["orders", "detail", id] as const,
  media: ["media"] as const,
  reviews: ["reviews"] as const,
};

/** Wraps useMutation with success toast, error toast and cache invalidation. */
function useAdminMutation<TVars, TResult>(
  mutationFn: (vars: TVars) => Promise<TResult>,
  options: { success?: string; invalidate: readonly (readonly unknown[])[] },
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      if (options.success) toast.success(options.success);
      await Promise.all(
        options.invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

// Dashboard
export function useStats() {
  return useQuery({ queryKey: queryKeys.stats, queryFn: () => api<AdminStats>("/admin/stats") });
}

// Categories
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => api<Category[]>("/admin/categories"),
  });
}

export function useSaveCategory() {
  return useAdminMutation(
    ({ id, data }: { id?: string; data: CategoryInput }) =>
      id
        ? api<Category>(`/admin/categories/${id}`, { method: "PATCH", body: data })
        : api<Category>("/admin/categories", { method: "POST", body: data }),
    { success: "Category saved", invalidate: [queryKeys.categories, queryKeys.stats] },
  );
}

export function useDeleteCategory() {
  return useAdminMutation(
    (id: string) => api<void>(`/admin/categories/${id}`, { method: "DELETE" }),
    { success: "Category deleted", invalidate: [queryKeys.categories, queryKeys.stats] },
  );
}

// Products
export type ProductFilters = {
  search?: string;
  category?: string;
  status?: "" | "active" | "inactive" | "lowstock";
  page?: number;
  limit?: number;
};

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: [...queryKeys.products, "list", filters],
    queryFn: () => api<Paginated<Product>>("/admin/products", { query: filters }),
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.product(id ?? ""),
    queryFn: () => api<Product>(`/admin/products/${id}`),
    enabled: Boolean(id),
  });
}

export function useSaveProduct() {
  return useAdminMutation(
    ({ id, data }: { id?: string; data: Partial<ProductInput> }) =>
      id
        ? api<Product>(`/admin/products/${id}`, { method: "PATCH", body: data })
        : api<Product>("/admin/products", { method: "POST", body: data }),
    { invalidate: [queryKeys.products, queryKeys.stats, queryKeys.categories] },
  );
}

export function useDeleteProduct() {
  return useAdminMutation(
    (id: string) => api<void>(`/admin/products/${id}`, { method: "DELETE" }),
    {
      success: "Product deleted",
      invalidate: [queryKeys.products, queryKeys.stats, queryKeys.categories],
    },
  );
}

// Deals
export function useDeals() {
  return useQuery({ queryKey: queryKeys.deals, queryFn: () => api<Deal[]>("/admin/deals") });
}

export function useSaveDeal() {
  return useAdminMutation(
    ({ id, data }: { id?: string; data: Partial<DealInput> }) =>
      id
        ? api<Deal>(`/admin/deals/${id}`, { method: "PATCH", body: data })
        : api<Deal>("/admin/deals", { method: "POST", body: data }),
    { success: "Deal saved", invalidate: [queryKeys.deals, queryKeys.products] },
  );
}

export function useDeleteDeal() {
  return useAdminMutation((id: string) => api<void>(`/admin/deals/${id}`, { method: "DELETE" }), {
    success: "Deal deleted",
    invalidate: [queryKeys.deals, queryKeys.products],
  });
}

// Banners
export function useBanners() {
  return useQuery({ queryKey: queryKeys.banners, queryFn: () => api<Banner[]>("/admin/banners") });
}

export function useSaveBanner() {
  return useAdminMutation(
    ({ id, data }: { id?: string; data: Partial<BannerInput> }) =>
      id
        ? api<Banner>(`/admin/banners/${id}`, { method: "PATCH", body: data })
        : api<Banner>("/admin/banners", { method: "POST", body: data }),
    { success: "Banner saved", invalidate: [queryKeys.banners] },
  );
}

export function useDeleteBanner() {
  return useAdminMutation((id: string) => api<void>(`/admin/banners/${id}`, { method: "DELETE" }), {
    success: "Banner deleted",
    invalidate: [queryKeys.banners],
  });
}

// Orders
export type OrderFilters = { status?: OrderStatus | ""; search?: string; page?: number; limit?: number };

export function useOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: [...queryKeys.orders, "list", filters],
    queryFn: () => api<Paginated<Order>>("/admin/orders", { query: filters }),
    placeholderData: keepPreviousData,
  });
}

export function useOrder(id: string) {
  return useQuery({ queryKey: queryKeys.order(id), queryFn: () => api<Order>(`/admin/orders/${id}`) });
}

export function useUpdateOrderStatus() {
  return useAdminMutation(
    ({ id, status, note }: { id: string; status: OrderStatus; note?: string }) =>
      api<Order>(`/admin/orders/${id}/status`, { method: "PATCH", body: { status, note } }),
    {
      success: "Order status updated",
      invalidate: [queryKeys.orders, queryKeys.stats, queryKeys.products],
    },
  );
}

// Media library
export type MediaFilters = { type?: MediaType | ""; page?: number; limit?: number };

export function useMediaLibrary(filters: MediaFilters) {
  return useQuery({
    queryKey: [...queryKeys.media, filters],
    queryFn: () => api<Paginated<MediaAsset>>("/admin/media", { query: filters }),
    placeholderData: keepPreviousData,
  });
}

export function useDeleteMedia() {
  return useAdminMutation((id: string) => api<void>(`/admin/media/${id}`, { method: "DELETE" }), {
    success: "File deleted",
    invalidate: [queryKeys.media],
  });
}

// Reviews
export type ReviewFilters = {
  status?: "" | "visible" | "hidden";
  rating?: number | "";
  search?: string;
  page?: number;
  limit?: number;
};

export function useReviews(filters: ReviewFilters) {
  return useQuery({
    queryKey: [...queryKeys.reviews, filters],
    queryFn: () => api<Paginated<Review>>("/admin/reviews", { query: filters }),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateReview() {
  return useAdminMutation(
    ({ id, data }: { id: string; data: { isApproved?: boolean; reply?: string | null } }) =>
      api<Review>(`/admin/reviews/${id}`, { method: "PATCH", body: data }),
    { invalidate: [queryKeys.reviews, queryKeys.products] },
  );
}

export function useDeleteReview() {
  return useAdminMutation((id: string) => api<void>(`/admin/reviews/${id}`, { method: "DELETE" }), {
    success: "Review deleted",
    invalidate: [queryKeys.reviews, queryKeys.products],
  });
}
