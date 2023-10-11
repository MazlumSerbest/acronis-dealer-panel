"use client";
import React from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import LoaderSpinner from "@/components/loader/LoaderSpinner";
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
} from "@nextui-org/table";
import { Input } from "@nextui-org/input";
import { Chip } from "@nextui-org/chip";
import { Pagination } from "@nextui-org/pagination";
import BoolChip from "@/components/BoolChip";

const columns = [
    {
        key: "id",
        label: "ID",
        width: 200,
    },
    {
        key: "name",
        label: "Name",
        width: 200,
    },
    {
        key: "kind",
        label: "Kind",
        width: 200,
    },
    {
        key: "enabled",
        label: "Enabled",
        width: 100,
    },
    // {
    //     key: "actions",
    //     label: "Actions",
    //     width: 150,
    // },
];

export default function ClientsPage() {
    const t = useTranslations("Clients");

    const renderCell = React.useCallback(
        (user: TenantUser, columnKey: React.Key) => {
            const cellValue: any = user[columnKey as keyof typeof user];

            switch (columnKey) {
                case "id":
                    return (
                        <h6 className="truncate">
                            {/* {cellValue.length > 28
                                ? cellValue.substring(0, 28) + "..."
                                : cellValue} */}
                            {cellValue}
                        </h6>
                    );
                case "name":
                    return (
                        <h6 className="text-clip">
                            {cellValue.length > 30
                                ? cellValue.substring(0, 30) + "..."
                                : cellValue}
                        </h6>
                    );
                case "kind":
                    return (
                        <h6 className="">
                            {cellValue
                                ? cellValue == "partner"
                                    ? "Partner"
                                    : "Customer"
                                : "-"}
                        </h6>
                    );
                case "enabled":
                    return <BoolChip value={cellValue} />;
                // case "actions":
                //     return (
                //         <div className="relative flex justify-start items-center gap-2">
                //             <Tooltip key={user.id} content="Copy Id">
                //                 <span className="text-xl text-blue-400 active:opacity-50">
                //                     <BiCopy
                //                         onClick={() =>
                //                             navigator.clipboard.writeText(
                //                                 user.id,
                //                             )
                //                         }
                //                     />
                //                 </span>
                //             </Tooltip>
                //             <Tooltip key={user.id} content="Edit User">
                //                 <span className="text-xl text-green-600 active:opacity-50">
                //                     <BiEdit
                //                         onClick={() => {}}
                //                         onDoubleClick={() => {}}
                //                     />
                //                 </span>
                //             </Tooltip>
                //             <Tooltip key={user.id} content="Delete User">
                //                 <span className="text-xl text-red-500 active:opacity-50">
                //                     <BiTrash onClick={() => {}} />
                //                 </span>
                //             </Tooltip>
                //         </div>
                //     );
                default:
                    return cellValue;
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    // const bottomContent = (
    //     <div className="flex w-full justify-center">
    //         <Pagination
    //             isCompact
    //             showControls
    //             showShadow
    //             color="primary"
    //             // page={page}
    //             total={1}
    //             // onChange={(page) => setPage(page)}
    //         />
    //     </div>
    // );

    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data, error } = useSWR(
        "/api/acronis/tenant/children/28a5db46-58eb-4a61-b064-122f07ddac6a",
        fetcher,
    );

    if (error) return <div>failed to load</div>;
    if (!data) return <LoaderSpinner />;

    return (
            <Table
                isStriped
                isCompact
                fullWidth
                selectionMode="single"
                color="primary"
                // topContent={topContent}
                // topContentPlacement="outside"
                // bottomContent={bottomContent}
                aria-label="Client Table"
            >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn
                            key={column.key}
                            width={column.width ? column.width : null}
                            align="center"
                        >
                            {column.label}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody
                    items={data.children.items}
                    emptyContent={<>There is no client</>}
                    loadingContent={<>Test</>}
                >
                    {(item: TenantUser) => (
                        <TableRow
                            key={item.id}
                            className="cursor-pointer"
                            onDoubleClick={() => {}}
                        >
                            {(columnKey) => (
                                <TableCell>
                                    {renderCell(item, columnKey)}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
    );
}
