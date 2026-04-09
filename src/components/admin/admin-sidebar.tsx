import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
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

export function AdminSidebar({ userName, userRole }: Props) {
  const navItems = getNavItemsForRole(userRole);

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="p-4">
        <Link href="/admin">
          <Image
            src="/logo-horizontal-light.png"
            alt="Club Vertikal"
            width={160}
            height={40}
            priority
          />
        </Link>
        <p className="text-xs text-sidebar-foreground/70 mt-1">
          Administración
        </p>
      </div>
      <Separator />
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
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
    </aside>
  );
}
