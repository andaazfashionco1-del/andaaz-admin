import {
  Film,
  FolderTree,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquare,
  type LucideIcon,
  Package,
  ShoppingBag,
  TicketPercent,
} from "lucide-react";

export const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: FolderTree },
  { href: "/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/deals", label: "Deals", icon: TicketPercent },
  { href: "/banners", label: "Banners", icon: Film },
  { href: "/media", label: "Media", icon: ImageIcon },
];
