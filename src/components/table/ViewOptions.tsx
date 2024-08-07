import { useTranslations } from "next-intl";

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ViewOptionsProps<TData> {
    table: Table<TData>;
}

export default function ViewOptions<TData>({ table }: ViewOptionsProps<TData>) {
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
                        {/* <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator /> */}
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
