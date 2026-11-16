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
  "flex h-8 items-center gap-2.5 rounded-md px-2 text-sm text-sidebar-foreground/80 [&_svg]:size-4 [&_svg]:shrink-0";
const INACTIVE_CLASSES = "hover:bg-white/8 hover:text-sidebar-foreground";
const ACTIVE_CLASSES =
  "bg-sidebar-accent font-medium text-sidebar-accent-foreground";

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
