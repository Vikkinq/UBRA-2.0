import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Briefcase, CalendarClock, UserRound, Settings } from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Job Applications", url: "/applications", icon: Briefcase },
  { title: "Job Interviews", url: "/interviews", icon: CalendarClock },
  { title: "Career Profile", url: "/profile", icon: UserRound },
  { title: "Settings", url: "/settings", icon: Settings },
];
