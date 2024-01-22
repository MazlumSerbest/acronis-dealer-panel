import React, { Key, ReactNode } from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Selection,
    SortDescriptor,
} from "@nextui-org/table";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
} from "@nextui-org/dropdown";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Pagination } from "@nextui-org/pagination";
import { BiPlus, BiSearch, BiChevronDown } from "react-icons/bi";
import Loader from "./loaders/Loader";

type Props = {
    columns: Column[];
    data: any;
    emptyContent?: ReactNode;
    defaultRowsPerPage?: 10 | 20 | 50;
    isCompact: boolean;
    isStriped: boolean;
    className?: string;
    activeOptions?: ActiveOption[];
    renderCell: (item: any, columnKey: Key) => ReactNode;
    sortOption: SortDescriptor;
    initialVisibleColumNames: string[];
    onDoubleClick?: (item: any) => any;
    onAddNew?: () => void;
};

export default function DataTable(props: Props) {
    const {
        columns,
        data,
        emptyContent,
        defaultRowsPerPage,
        isCompact,
        isStriped,
        className,
        activeOptions,
        onAddNew,
    } = props;

    type DataType = (typeof props.data)[0];
    const [filterValue, setFilterValue] = React.useState("");
    // const [selectedKeys, setSelectedKeys] = React.useState<Selection>(
    //     new Set([]),
    // );
    const [visibleColumns, setVisibleColumns] = React.useState<Selection>(
        new Set(props.initialVisibleColumNames),
    );
    const [activeFilter, setActiveFilter] = React.useState<Selection>("all");
    const [rowsPerPage, setRowsPerPage] = React.useState<number>(
        defaultRowsPerPage || 10,
    );
    const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
        column: props.sortOption.column,
        direction: props.sortOption.direction,
    });
    const [page, setPage] = React.useState(1);

    // const pages = Math.ceil(data.length / rowsPerPage);

    const hasSearchFilter = Boolean(filterValue);

    const headerColumns = React.useMemo(() => {
        if (visibleColumns === "all") return columns;

        return columns.filter((column) =>
            Array.from(visibleColumns).includes(column.key),
        );
    }, [columns, visibleColumns]);

    const filteredItems = React.useMemo(() => {
        let filteredItems = [...data];

        if (hasSearchFilter) {
            filteredItems = filteredItems.filter((fitem) => {
                const filterColumns = columns.filter((e) => e.searchable);

                return filterColumns.some((e) =>
                    fitem[e.key]
                        ?.toLowerCase()
                        .includes(filterValue.toLowerCase()),
                );
            });
        }
        if (
            activeFilter !== "all" &&
            Array.from(activeFilter).length !== activeOptions?.length
        ) {
            filteredItems = filteredItems.filter((item) =>
                Array.from(activeFilter).includes(
                    item.active ? "true" : "false",
                ),
            );
        }

        return filteredItems;
    }, [
        hasSearchFilter,
        activeOptions?.length,
        data,
        filterValue,
        activeFilter,
        columns,
    ]);

    // const items = React.useMemo(() => {
    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    const sortedItems = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        //     return filteredItems.slice(start, end);
        // }, [page, filteredItems, rowsPerPage]);

        // const sortedItems = React.useMemo(() => {
        //     return [...items].sort((a: DataType, b: DataType) => {
        return [...filteredItems]
            .sort((a: DataType, b: DataType) => {
                const first = a[
                    sortDescriptor.column as keyof DataType
                ] as number;
                const second = b[
                    sortDescriptor.column as keyof DataType
                ] as number;
                const cmp = first < second ? -1 : first > second ? 1 : 0;

                return sortDescriptor.direction === "descending" ? -cmp : cmp;
                // });
                // }, [sortDescriptor, items]);
            })
            .slice(start, end);
    }, [sortDescriptor, page, filteredItems, rowsPerPage]);

    const onRowsPerPageChange = React.useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setRowsPerPage(Number(e.target.value));
            setPage(1);
        },
        [],
    );

    const onSearchChange = React.useCallback((value?: string) => {
        if (value) {
            setFilterValue(value);
            setPage(1);
        } else {
            setFilterValue("");
        }
    }, []);

    //#region Top Content
    const topContent = React.useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        classNames={{
                            base: "w-full sm:max-w-[44%]",
                            inputWrapper:
                                "border-0 ring-1 ring-inset ring-zinc-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-sky-500",
                            clearButton: "text-xl text-zinc-500",
                            input: "placeholder:italic placeholder:text-zinc-400",
                        }}
                        placeholder="Arama Yap..."
                        size="sm"
                        startContent={
                            <BiSearch className="text-2xl text-zinc-300" />
                        }
                        value={filterValue}
                        variant="bordered"
                        onClear={() => setFilterValue("")}
                        onValueChange={onSearchChange}
                    />
                    <div className="flex gap-3">
                        {activeOptions?.length ? (
                            <Dropdown>
                                <DropdownTrigger className="hidden sm:flex">
                                    <Button
                                        endContent={
                                            <BiChevronDown className="text-sm" />
                                        }
                                        size="sm"
                                        variant="flat"
                                    >
                                        Aktif
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    disallowEmptySelection
                                    aria-label="Table Columns"
                                    closeOnSelect={false}
                                    selectedKeys={activeFilter}
                                    selectionMode="multiple"
                                    onSelectionChange={setActiveFilter}
                                >
                                    {(activeOptions || []).map((active) => (
                                        <DropdownItem
                                            key={active.key}
                                            className="capitalize"
                                        >
                                            {active.name}
                                        </DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </Dropdown>
                        ) : (
                            <></>
                        )}
                        <Dropdown>
                            <DropdownTrigger className="hidden sm:flex">
                                <Button
                                    endContent={
                                        <BiChevronDown className="text-sm" />
                                    }
                                    size="sm"
                                    variant="flat"
                                >
                                    Kolonlar
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Table Columns"
                                closeOnSelect={false}
                                selectedKeys={visibleColumns}
                                selectionMode="multiple"
                                onSelectionChange={setVisibleColumns}
                            >
                                {columns.map((column) => (
                                    <DropdownItem
                                        key={column.key}
                                        className="capitalize"
                                    >
                                        {column.name}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                        {onAddNew ? (
                            <Button
                                color="primary"
                                className="bg-sky-500"
                                endContent={<BiPlus />}
                                size="sm"
                                onPress={onAddNew}
                            >
                                Ekle
                            </Button>
                        ) : (
                            <></>
                        )}
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-sm">
                        Toplam satır: {data.length}
                    </span>
                    <label className="flex items-center text-zinc-400 text-sm">
                        Sayfa satır sayısı:
                        <select
                            className="bg-transparent outline-none text-zinc-400 text-sm ml-2"
                            onChange={onRowsPerPageChange}
                        >
                            <option
                                value="10"
                                selected={defaultRowsPerPage == 10}
                            >
                                10
                            </option>
                            <option
                                value="20"
                                selected={defaultRowsPerPage == 20}
                            >
                                20
                            </option>
                            <option
                                value="50"
                                selected={defaultRowsPerPage == 50}
                            >
                                50
                            </option>
                        </select>
                    </label>
                </div>
            </div>
        );
    }, [
        columns,
        activeOptions,
        filterValue,
        activeFilter,
        visibleColumns,
        onSearchChange,
        onRowsPerPageChange,
        onAddNew,
        data.length,
        defaultRowsPerPage,
    ]);
    //#endregion

    //#region Bottom Content
    const bottomContent = React.useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-center items-center">
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    classNames={{
                        cursor: "bg-sky-500 text-white",
                    }}
                    color="default"
                    isDisabled={hasSearchFilter}
                    page={page}
                    total={pages}
                    onChange={setPage}
                />
                {/* <span className="text-sm text-zinc-400">
                    {selectedKeys === "all"
                        ? "All items selected"
                        : `${selectedKeys.size} of ${items.length} selected`}
                </span> */}
            </div>
        );
    }, [, /*selectedKeys*/ page, pages, hasSearchFilter]);
    //#endregion

    return (
        <Table
            isCompact={isCompact}
            isStriped={isStriped}
            aria-label="Table component with custom cells, pagination and sorting"
            className={className ?? ""}
            topContent={topContent}
            topContentPlacement="outside"
            bottomContent={data.length > rowsPerPage ? bottomContent : <></>}
            bottomContentPlacement="outside"
            // checkboxesProps={{
            //     classNames: {
            //         wrapper:
            //             "after:bg-foreground after:text-background text-background",
            //     },
            // }}
            selectionMode="single"
            // selectedKeys={selectedKeys}
            // onSelectionChange={setSelectedKeys}
            onSortChange={setSortDescriptor}
            sortDescriptor={sortDescriptor}
        >
            <TableHeader columns={headerColumns}>
                {(column) => (
                    <TableColumn
                        key={column.key}
                        allowsSorting={column.sortable}
                    >
                        {column.name}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody
                emptyContent={emptyContent}
                items={sortedItems}
                loadingContent={<Loader />}
            >
                {(item) => (
                    <TableRow
                        key={item.id}
                        className={props.onDoubleClick ? "cursor-pointer" : ""}
                        onDoubleClick={() =>
                            props.onDoubleClick
                                ? props.onDoubleClick(item)
                                : undefined
                        }
                    >
                        {(columnKey) => (
                            <TableCell>
                                {props.renderCell(item, columnKey)}
                            </TableCell>
                        )}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
