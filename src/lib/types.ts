export type MediaType = "IMAGE" | "VIDEO";

export type Media = { id: string; url: string; type: MediaType; sortOrder: number };

export type MediaInput = { url: string; type: MediaType };

export type MediaAsset = {
  id: string;
  url: string;
  type: MediaType;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

export type CategoryRef = { id: string; name: string; slug: string };

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  productCount: number;
  children?: Category[];
  createdAt: string;
};

export type DealType = "PERCENT" | "FIXED";
export type DealScope = "ALL" | "CATEGORY" | "PRODUCTS";

export type DealRef = { id: string; title: string; type: DealType; value: number; endsAt: string };

export type ProductColor = { name: string; hex: string };

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  finalPrice: number;
  discountPercent: number;
  activeDeal: DealRef | null;
  category: CategoryRef;
  sizes: string[];
  colors: ProductColor[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  tags: string[];
  media: Media[];
  soldCount: number;
  rating: { average: number; count: number };
  createdAt: string;
};

export type Deal = {
  id: string;
  title: string;
  description: string | null;
  code: string | null;
  type: DealType;
  value: number;
  scope: DealScope;
  categoryId: string | null;
  category: CategoryRef | null;
  productIds: string[];
  minOrderAmount: number | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  showOnHome: boolean;
  bannerUrl: string | null;
  createdAt: string;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  mediaUrl: string;
  mediaType: MediaType;
  ctaText: string | null;
  ctaLink: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
};

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderItem = {
  id: string;
  productId: string | null;
  name: string;
  image: string | null;
  price: number;
  size: string | null;
  color: string | null;
  quantity: number;
  lineTotal: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
  notes: string | null;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode: string | null;
  paymentMethod: "COD";
  status: OrderStatus;
  statusHistory: { status: OrderStatus; note: string | null; createdAt: string }[];
  createdAt: string;
  updatedAt: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export type Review = {
  id: string;
  productId: string;
  product?: { id: string; name: string; slug: string; image: string | null };
  customerName: string;
  rating: ReviewRating;
  title: string | null;
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  reply: { text: string; createdAt: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminUser = { id: string; name: string; email: string; role: string };

export type LoginResponse = { accessToken: string; user: AdminUser };

export type AdminStats = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCategories: number;
  pendingOrders: number;
  lowStockProducts: Product[];
  recentOrders: Order[];
  salesByDay: { date: string; total: number; orders: number }[];
  topProducts: { id: string; name: string; image: string | null; soldCount: number; revenue: number }[];
  ordersByStatus: Record<OrderStatus, number>;
};

export type CategoryInput = {
  name: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

export type ProductInput = {
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  categoryId: string;
  sizes: string[];
  colors: ProductColor[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  tags: string[];
  media: MediaInput[];
};

export type DealInput = {
  title: string;
  description: string | null;
  code: string | null;
  type: DealType;
  value: number;
  scope: DealScope;
  categoryId: string | null;
  productIds: string[];
  minOrderAmount: number | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  showOnHome: boolean;
  bannerUrl: string | null;
};

export type BannerInput = {
  title: string;
  subtitle: string | null;
  mediaUrl: string;
  mediaType: MediaType;
  ctaText: string | null;
  ctaLink: string | null;
  sortOrder: number;
  isActive: boolean;
};
