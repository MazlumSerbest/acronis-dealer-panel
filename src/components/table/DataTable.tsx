import { ReactNode, useState } from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
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
} from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { Pagination } from "./Pagination";
import { DataTableViewOptions } from "./ViewOptions";
import { DataTableFacetedFilter } from "./FacetedFilter";
// import { Toolbar } from "./Toolbar";

import { useTranslations } from "next-intl";
import Loader from "../loaders/Loader";
import { cn } from "@/lib/utils";
import {
    Cross2Icon,
    MagicWandIcon,
    PlusIcon,
} from "@radix-ui/react-icons";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    visibleColumns?: VisibilityState;
    basic?: boolean;
    zebra?: boolean;
    isLoading?: boolean;
    defaultPageIndex?: number;
    defaultPageSize?: 10 | 20 | 30 | 40 | 50;
    selectable?: boolean;
    facetedFilters?: {
        column: string;
        title: string;
        options: { value: any; label: string }[];
    }[];
    actions?: any;
    onAddNew?: () => any;
    selectOnClick?: (table: any, item: any) => any;
    onClick?: (item: any) => any;
    onDoubleClick?: (item: any) => any;
}

export function DataTable<TData, TValue>({
    columns,
    data = [],
    visibleColumns = {},
    basic = false,
    zebra = false,
    isLoading = false,
    defaultPageIndex = 0,
    defaultPageSize = 20,
    selectable = false,
    facetedFilters,
    actions,
    onAddNew,
    selectOnClick,
    onClick,
    onDoubleClick,
}: DataTableProps<TData, TValue>) {
    const tc = useTranslations("Components");

    const [rowSelection, setRowSelection] = useState({});
    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>(visibleColumns);
    // const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState<SortingState>([]);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            globalFilter,
            // columnFilters,
        },
        initialState: {
            columnVisibility: columnVisibility,
            pagination: {
                pageIndex: defaultPageIndex,
                pageSize: defaultPageSize,
            },
        },
        autoResetPageIndex: false,
        enableRowSelection: selectable,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        // onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });

    let isFiltered =
        table.getState().columnFilters?.length > 0 ||
        table.getState().globalFilter?.length > 0;

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center justify-between gap-2">
                <div className="flex flex-1 items-center space-x-2">
                    <Input
                        placeholder={tc("searchPlaceholder")}
                        value={globalFilter ?? ""}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="max-w-sm min-w-max"
                    />

                    {facetedFilters?.map(
                        (filter) =>
                            table.getColumn(filter.column) && (
                                <DataTableFacetedFilter
                                    key={filter.column}
                                    column={table.getColumn(filter.column)}
                                    title={filter.title}
                                    options={filter.options}
                                />
                            ),
                    )}

                    {isFiltered && (
                        <Button
                            variant="ghost"
                            onClick={() => {
                                table.resetGlobalFilter();
                                table.resetColumnFilters();
                            }}
                            className="flex gap-2 h-8 px-2 lg:px-3"
                        >
                            <span className="sr-only lg:not-sr-only">
                                {tc("clear")}
                            </span>
                            <Cross2Icon className="size-4" />
                        </Button>
                    )}
                </div>

                <div className="flex flex-row gap-2 justify-end">
                    {actions && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-2 flex"
                                >
                                    <MagicWandIcon className="size-4" />
                                    <span className="">{tc("actions")}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="max-w-[300px]"
                            >
                                <DropdownMenuLabel>
                                    {tc("actions")}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {actions.map((action: ReactNode) => action)}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    <DataTableViewOptions table={table} />

                    {onAddNew && (
                        <Button
                            size="sm"
                            className="flex gap-2 bg-blue-400 hover:bg-blue-400/90"
                            onClick={onAddNew}
                        >
                            <span className="">{tc("add")}</span>
                            <PlusIcon className="size-4" />
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
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                        >
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
                                                (onClick ||
                                                    onDoubleClick ||
                                                    selectOnClick) &&
                                                    "cursor-pointer",
                                            )}
                                            onClick={() => {
                                                onClick
                                                    ? onClick(row)
                                                    : selectOnClick
                                                    ? selectOnClick(table, row)
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
            <Pagination table={table} />
        </div>
    );
}
