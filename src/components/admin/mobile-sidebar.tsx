"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { LogoutButton } from "./logout-button";
import { getNavItemsForRole } from "./nav-items";

type Props = {
  userName: string;
  userRole: string;
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  INSTRUCTOR: "Instructor",
};

export function MobileSidebar({ userName, userRole }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = getNavItemsForRole(userRole);

  return (
    <>
      <div className="flex items-center gap-3 border-b bg-sidebar p-3 md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir menu"
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Image
          src="/logo-horizontal-light.png"
          alt="Club Vertikal"
          width={140}
          height={28}
          priority
        />
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="left"
          className="w-56 bg-sidebar text-sidebar-foreground p-0"
        >
          <SheetHeader className="p-4">
            <SheetTitle className="flex">
              <Image
                src="/logo-horizontal-light.png"
                alt="Club Vertikal"
                width={140}
                height={28}
              />
            </SheetTitle>
            <p className="text-xs text-sidebar-foreground/70">Administración</p>
          </SheetHeader>
          <Separator />
          <nav className="flex-1 p-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <Separator />
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs text-sidebar-foreground/70 truncate">
                {userName}
              </p>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {ROLE_LABELS[userRole] ?? userRole}
              </Badge>
            </div>
            <LogoutButton />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
