"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

import {
    ColumnDef,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Pagination from "./Pagination";
import ViewOptions from "./ViewOptions";
import { cn } from "@/lib/utils";
import Loader from "../loaders/Loader";
import { LuPlus } from "react-icons/lu";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    visibleColumns?: VisibilityState;
    basic?: boolean;
    zebra?: boolean;
    isLoading?: boolean;
    defaultPageIndex?: number;
    defaultPageSize?: 10 | 20 | 30 | 40 | 50;
    onAddNew?: () => any;
    onClick?: (item: any) => any;
    onDoubleClick?: (item: any) => any;
}

export default function DataTable<TData, TValue>(
    props: DataTableProps<TData, TValue>,
) {
    const {
        columns,
        data = [],
        visibleColumns = {},
        basic = false,
        zebra = false,
        isLoading = false,
        defaultPageIndex = 0,
        defaultPageSize = 10,
        onAddNew,
        onClick,
        onDoubleClick,
    } = props;

    const tc = useTranslations("Components");

    const [sorting, setSorting] = useState<SortingState>([]);
    // const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>(visibleColumns);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        // onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        initialState: {
            columnVisibility: columnVisibility,
            pagination: {
                pageIndex: defaultPageIndex,
                pageSize: defaultPageSize,
            },
        },
        state: {
            sorting,
            // columnFilters,
            globalFilter,
            columnVisibility,
        },
        autoResetPageIndex: false,
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 justify-between">
                <Input
                    placeholder={tc("searchPlaceholder")}
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="max-w-sm"
                />

                <div className="flex gap-2">
                    <ViewOptions table={table} />

                    {onAddNew && (
                        <Button
                            size="sm"
                            className="flex gap-2 bg-blue-400 hover:bg-blue-400/90"
                            onClick={onAddNew}
                        >
                            <span className="sr-only lg:not-sr-only">
                                {tc("add")}
                            </span>
                            <LuPlus className="size-4" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 justify-center"
                                >
                                    <Loader />
                                </TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={
                                                row.getIsSelected() &&
                                                "selected"
                                            }
                                            className={cn(
                                                "select-none",
                                                zebra && "odd:bg-zinc-100/50",
                                                (onClick || onDoubleClick) &&
                                                    "cursor-pointer",
                                            )}
                                            onClick={() => {
                                                onClick
                                                    ? onClick(row)
                                                    : undefined;
                                            }}
                                            onDoubleClick={() =>
                                                onDoubleClick
                                                    ? onDoubleClick(row)
                                                    : undefined
                                            }
                                        >
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </TableCell>
                                                ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            {tc("noResults")}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </>
                        )}
                    </TableBody>
                </Table>
            </div>

            {data.length < 10 || !data.length ? null : (
                <Pagination table={table} />
            )}
        </div>
    );
}
