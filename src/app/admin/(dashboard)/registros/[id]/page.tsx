import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { MembershipDetail } from "@/components/admin/membership-detail";
import { MembershipDetailMeta } from "@/components/admin/membership-detail-meta";

type Props = { params: Promise<{ id: string }> };

export default async function MembershipDetailPage({ params }: Props) {
  const { id } = await params;

  const membership = await prisma.membership.findUnique({
    where: { id },
    include: {
      member: true,
      season: true,
      type: true,
      subtype: true,
      supplements: { include: { supplement: true } },
    },
  });

  if (!membership) notFound();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft aria-hidden="true" />
              Volver
            </Link>
          </Button>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {membership.member.firstName} {membership.member.lastName}
          </h1>
        </div>
        <MembershipDetailMeta membership={membership} />
      </div>
      <MembershipDetail membership={membership} />
    </div>
  );
}
