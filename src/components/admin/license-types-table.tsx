"use client";

import { useState } from "react";
import type {
  LicenseType,
  LicenseSubtype,
  LicenseOffering,
  Category,
} from "@prisma/client";
import { ChevronRight } from "lucide-react";
import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table";
import { DataCell } from "./data-cell";
import { DataHead } from "./data-head";
import { LicenseStateBadge } from "./license-state-badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { LicenseTypeActions } from "./license-type-actions-menu";
import { DetailSections } from "./license-type-detail-sections";
import { TruncatedCell } from "./truncated-cell";

/* 12px grey, no fill band, like every other table in the panel. */

export type SubtypeWithCount = LicenseSubtype & {
  _count: { memberships: number };
};

export type CategoryWithCount = Category & {
  _count: { memberships: number };
};

export type OfferingWithCategory = LicenseOffering & {
  category: Category;
};

export type LicenseTypeWithRelations = LicenseType & {
  _count: { memberships: number };
  subtypes: SubtypeWithCount[];
  offerings: OfferingWithCategory[];
};

type Props = {
  licenseTypes: LicenseTypeWithRelations[];
  categories: CategoryWithCount[];
  seasonId: string;
  seasonName: string;
};

export function LicenseTypesTable({
  licenseTypes,
  categories,
  seasonId,
  seasonName,
}: Props) {
  if (licenseTypes.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No hay tipos de federativa. Crea el primero.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4 md:hidden">
        {licenseTypes.map((lt) => (
          <MobileCard
            key={lt.id}
            licenseType={lt}
            categories={categories}
            seasonId={seasonId}
            seasonName={seasonName}
          />
        ))}
      </div>
      <div className="hidden md:block space-y-6">
        {licenseTypes.map((lt) => (
          <DesktopRow
            key={lt.id}
            licenseType={lt}
            categories={categories}
            seasonId={seasonId}
            seasonName={seasonName}
          />
        ))}
      </div>
    </div>
  );
}

type RowProps = {
  licenseType: LicenseTypeWithRelations;
  categories: CategoryWithCount[];
  seasonId: string;
  seasonName: string;
};

function DesktopRow({
  licenseType: lt,
  categories,
  seasonId,
  seasonName,
}: RowProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <DataHead className="w-8" />
              <DataHead className="w-48 min-w-48">Nombre</DataHead>
              {/* The only column whose content is a sentence, so it takes
                  whatever the fixed ones leave instead of truncating at a
                  width of its own while they sit half empty. */}
              <DataHead className="w-full">Descripción</DataHead>
              <DataHead kind="center" className="w-px whitespace-nowrap">
                Estado
              </DataHead>
              <DataHead kind="number" className="w-px whitespace-nowrap">
                Registros
              </DataHead>
              {/* Room for the four buttons and the air RowActions puts
                  before them, held even on a row that shows three, so the
                  column cannot collapse under them and every row ends at the
                  same edge. */}
              <DataHead kind="actions" className="min-w-48">
                <span className="sr-only">Acciones</span>
              </DataHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <DataCell>
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-muted"
                    aria-label={isOpen ? "Colapsar" : "Expandir"}
                  >
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
                    />
                  </button>
                </CollapsibleTrigger>
              </DataCell>
              <DataCell className="w-48 min-w-48">
                <TruncatedCell
                  text={lt.name}
                  className="font-medium max-w-48"
                />
              </DataCell>
              {/* w-full with max-w-0 is what lets a table cell both fill the
                  row and cut its text off: without it the sentence sets the
                  column's width instead of the other way round. */}
              <DataCell className="w-full max-w-0">
                <TruncatedCell
                  text={lt.description}
                  className="text-muted-foreground"
                />
              </DataCell>
              <DataCell kind="center" className="w-px whitespace-nowrap">
                <LicenseStateBadge license={lt} />
              </DataCell>
              <DataCell kind="number" className="w-px whitespace-nowrap">
                {lt._count.memberships}
              </DataCell>
              <DataCell kind="actions">
                <LicenseTypeActions
                  licenseType={lt}
                  membershipCount={lt._count.memberships}
                  categories={categories}
                  seasonName={seasonName}
                />
              </DataCell>
            </TableRow>
          </TableBody>
        </Table>
        <CollapsibleContent>
          <DetailSections
            licenseType={lt}
            categories={categories}
            seasonId={seasonId}
          />
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function MobileCard({
  licenseType: lt,
  categories,
  seasonId,
  seasonName,
}: RowProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 min-w-0"
              aria-label={isOpen ? "Colapsar" : "Expandir"}
            >
              <ChevronRight
                className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
              />
              <div className="min-w-0 text-left">
                <p className="font-medium">{lt.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {lt.description}
                </p>
              </div>
            </button>
          </CollapsibleTrigger>
          <LicenseStateBadge license={lt} />
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{lt._count.memberships} registros</span>
        </div>
        <LicenseTypeActions
          licenseType={lt}
          membershipCount={lt._count.memberships}
          categories={categories}
          seasonName={seasonName}
        />
        <CollapsibleContent>
          <DetailSections
            licenseType={lt}
            categories={categories}
            seasonId={seasonId}
          />
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
