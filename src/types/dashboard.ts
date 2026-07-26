import type { LucideIcon } from "lucide-react";

export type DashboardModule = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  badge: string;
  accent: "blue" | "green" | "orange" | "purple";
};
