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
    MagnifyingGlassIcon,
} from "@radix-ui/react-icons";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    visibleColumns?: VisibilityState;
    basic?: boolean;
    zebra?: boolean;
    isLoading?: boolean;
    defaultSearch?: string;
    defaultPageIndex?: number;
    defaultPageSize?: 10 | 20 | 30 | 40 | 50;
    defaultSort?: string;
    defaultSortDirection?: "asc" | "desc";
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
    onSearchEnter?: (
        table: any,
        value: string,
        setValue: (value: string) => void,
    ) => any;
}

export function DataTable<TData, TValue>({
    columns,
    data = [],
    visibleColumns = {},
    basic = false,
    zebra = false,
    isLoading = false,
    defaultSearch = "",
    defaultPageIndex = 0,
    defaultPageSize = 20,
    defaultSort = "",
    defaultSortDirection = "asc",
    selectable = false,
    facetedFilters,
    actions,
    onAddNew,
    selectOnClick,
    onClick,
    onDoubleClick,
    onSearchEnter,
}: DataTableProps<TData, TValue>) {
    const tc = useTranslations("Components");

    const [rowSelection, setRowSelection] = useState({});
    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>(visibleColumns);
    // const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState(defaultSearch || "");
    const [sorting, setSorting] = useState<SortingState>([
        { id: defaultSort, desc: defaultSortDirection === "desc" },
    ]);

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
            sorting: sorting,
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
            <div className="flex md:items-center justify-between gap-2">
                <div className="flex flex-1 items-center gap-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-2 top-2 size-5 text-muted-foreground" />
                            <Input
                                className="w-full pl-8"
                                placeholder={tc("searchPlaceholder")}
                                value={globalFilter ?? ""}
                                onChange={(e) =>
                                    setGlobalFilter(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (
                                        e.key === "Enter" &&
                                        selectable &&
                                        onSearchEnter
                                    ) {
                                        onSearchEnter(
                                            table,
                                            globalFilter,
                                            setGlobalFilter,
                                        );
                                    }
                                }}
                            />
                        </div>

                        <div className="flex gap-2 items-center">
                            {facetedFilters?.map(
                                (filter) =>
                                    table.getColumn(filter.column) && (
                                        <DataTableFacetedFilter
                                            key={filter.column}
                                            column={table.getColumn(
                                                filter.column,
                                            )}
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
                    </div>
                </div>

                <div className="flex flex-row gap-2 justify-end h-full">
                    {actions && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-2 flex"
                                >
                                    <MagicWandIcon className="size-4" />
                                    <span className="sr-only lg:not-sr-only">
                                        {tc("actions")}
                                    </span>
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
                            <span className="sr-only lg:not-sr-only">
                                {tc("add")}
                            </span>
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
                                                row?.getIsSelected() &&
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
                                                    <TableCell
                                                        key={cell.id}
                                                        className="select-all"
                                                    >
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
