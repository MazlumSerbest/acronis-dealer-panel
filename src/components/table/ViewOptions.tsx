import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "../ui/button";
import {
    DropdownMenuTrigger,
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "../ui/dropdown-menu";

import { useTranslations } from "next-intl";

interface DataTableViewOptionsProps<TData> {
    table: Table<TData>;
}

export function DataTableViewOptions<TData>({
    table,
}: DataTableViewOptionsProps<TData>) {
    const tc = useTranslations("Components");
    const visibleColumns = table
        .getAllColumns()
        .filter(
            (column) =>
                typeof column.accessorFn !== "undefined" && column.getCanHide(),
        );

    return (
        <>
            {visibleColumns.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2 flex"
                        >
                            <MixerHorizontalIcon className="size-4" />
                            <span className="sr-only lg:not-sr-only">
                                {tc("columns")}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="max-w-[300px]">
                        <DropdownMenuLabel>{tc("toggleColumns")}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {visibleColumns.map((column) => {
                            return (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    className="capitalize"
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(value) =>
                                        column.toggleVisibility(!!value)
                                    }
                                >
                                    {column.columnDef.header as string}
                                </DropdownMenuCheckboxItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </>
    );
}
