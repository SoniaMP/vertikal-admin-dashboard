"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getActiveNavHref } from "@/helpers/admin-nav";

type Props = {
  href: string;
  label: string;
  icon: ReactNode;
  navHrefs: ReadonlyArray<string>;
  onClick?: () => void;
};

const BASE_CLASSES =
  "flex items-center gap-2 rounded-md border-l-2 px-3 py-2 text-sm font-medium";
const INACTIVE_CLASSES = "border-transparent hover:bg-secondary/20";
const ACTIVE_CLASSES =
  "border-transparent bg-sidebar-accent text-sidebar-accent-foreground";

export function NavLink({ href, label, icon, navHrefs, onClick }: Props) {
  const pathname = usePathname();
  const activeHref = getActiveNavHref(pathname ?? "", navHrefs);
  const isActive = activeHref === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(BASE_CLASSES, isActive ? ACTIVE_CLASSES : INACTIVE_CLASSES)}
    >
      {icon}
      {label}
    </Link>
  );
}
