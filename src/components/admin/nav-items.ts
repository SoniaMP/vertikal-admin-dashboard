import { CalendarDays, ClipboardList, Settings, Shield, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Miembros", icon: ClipboardList },
  { href: "/admin/tipos-federacion", label: "Federativas", icon: Shield },
  { href: "/admin/cursos", label: "Cursos", icon: CalendarDays },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/ajustes", label: "Ajustes", icon: Settings },
];
