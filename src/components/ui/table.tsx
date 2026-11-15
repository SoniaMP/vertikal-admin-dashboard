"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { TruncatedText } from "@/components/ui/truncated-text"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 max-w-[120px] truncate px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

/**
 * The readable text of a cell, or null when it holds anything else.
 *
 * `<TableCell>{first} {last}</TableCell>` arrives as a list of pieces rather
 * than one string, and that is exactly the long-name case worth a tooltip, so
 * an all-text list is joined instead of skipped.
 */
function plainText(children: React.ReactNode): string | null {
  const parts = React.Children.toArray(children)
  if (parts.length === 0) return null

  const isText = parts.every(
    (part) => typeof part === "string" || typeof part === "number"
  )
  return isText ? parts.join("") : null
}

/**
 * Cells clip to a fixed width so the columns stay aligned. Plain text goes
 * through `TruncatedText`, which hands back whatever the clipping hides. Cells
 * holding elements -- badges, buttons, menus -- are left alone: they are not
 * text to read, and wrapping them would put a tooltip on every action.
 */
function TableCell({ className, children, ...props }: React.ComponentProps<"td">) {
  const text = plainText(children)

  return (
    <td
      data-slot="table-cell"
      className={cn(
        "max-w-[120px] truncate p-2 text-left align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    >
      {text === null ? children : <TruncatedText text={text} />}
    </td>
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
