import { CalendarDays, CircleUser, ClipboardList, Settings, Shield, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: string[];
};

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Miembros", icon: ClipboardList, roles: ["ADMIN"] },
  { href: "/admin/tipos-federacion", label: "Federativas", icon: Shield, roles: ["ADMIN"] },
  { href: "/admin/cursos", label: "Cursos", icon: CalendarDays },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users, roles: ["ADMIN"] },
  { href: "/admin/cuenta", label: "Mi cuenta", icon: CircleUser },
  { href: "/admin/ajustes", label: "Ajustes", icon: Settings, roles: ["ADMIN"] },
];

export function getNavItemsForRole(role: string): NavItem[] {
  return ADMIN_NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role),
  );
}
