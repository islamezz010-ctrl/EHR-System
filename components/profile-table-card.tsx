"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ProfileTableCardProps<TData, TValue> = {
  title: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onBrowseAll?: () => void;
  emptyMessage?: string;
  className?: string;
};

export function ProfileTableCard<TData, TValue>({
  title,
  columns,
  data,
  onBrowseAll,
  emptyMessage,
  className,
}: ProfileTableCardProps<TData, TValue>) {
  const browseButton = (
    <Button
      size="sm"
      className="bg-teal-500 font-semibold text-white shadow-sm hover:bg-teal-600"
      onClick={onBrowseAll}
    >
      Browse All
    </Button>
  );

  return (
    <Card
      className={cn(
        "rounded-xl border border-slate-100 bg-white py-0 shadow-md dark:border-slate-800 dark:bg-card",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-5 py-4">
        <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </CardTitle>
        {onBrowseAll ? browseButton : null}
      </CardHeader>
      <CardContent className="px-3 pb-4 pt-0">
        <DataTable
          columns={columns}
          data={data}
          compact
          emptyMessage={emptyMessage ?? "No records."}
        />
      </CardContent>
    </Card>
  );
}
