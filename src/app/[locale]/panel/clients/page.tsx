"use client";
import React from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import Loader from "@/components/loaders/Loader";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
} from "@nextui-org/table";
import { Tooltip } from "@nextui-org/tooltip";
import { Input } from "@nextui-org/input";
import { Pagination } from "@nextui-org/pagination";
import BoolChip from "@/components/BoolChip";
import { BiEdit, BiLinkExternal } from "react-icons/bi";

export default function ClientsPage() {
    const t = useTranslations("Clients");
    const g = useTranslations("General");

    const columns = [
        {
            key: "name",
            label: g("name"),
            width: 200,
        },
        {
            key: "kind",
            label: g("kind"),
            width: 200,
        },
        {
            key: "mfa_status",
            label: g("mfaStatus"),
            width: 75,
        },
        {
            key: "enabled",
            label: g("enabled"),
            width: 75,
        },
        {
            key: "usage",
            label: g("usage"),
            width: 100,
        },
        {
            key: "actions",
            label: "Actions",
            width: 150,
        },
    ];

    const renderCell = React.useCallback(
        (client: Tenant, columnKey: React.Key) => {
            const cellValue: any = client[columnKey as keyof typeof client];

            switch (columnKey) {
                case "kind":
                    return (
                        <h6>
                            {cellValue
                                ? cellValue == "partner"
                                    ? g("partner")
                                    : g("customer")
                                : "-"}
                        </h6>
                    );
                case "mfa_status":
                    return <BoolChip value={cellValue == "enabled"} />;
                case "enabled":
                    return <BoolChip value={cellValue} />;
                case "actions":
                    return (
                        <div className="relative flex justify-start items-center gap-2">
                            <Tooltip key={client.id} content="Edit Client">
                                <span className="text-xl text-green-600 active:opacity-50">
                                    <BiEdit
                                        onClick={() => {}}
                                        onDoubleClick={() => {}}
                                    />
                                </span>
                            </Tooltip>
                            <Tooltip key={client.id} content="Open Detail">
                                <span className="text-xl text-blue-400 active:opacity-50">
                                    <BiLinkExternal onClick={() => {}} />
                                </span>
                            </Tooltip>
                        </div>
                    );
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
    if (!data)
        return (
            <Skeleton>
                <TableSkeleton />
            </Skeleton>
        );

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
                emptyContent={g("emptyContent")}
                loadingContent={<Loader />}
            >
                {(item: Tenant) => (
                    <TableRow
                        key={item.id}
                        className="cursor-pointer"
                        onDoubleClick={() => {}}
                    >
                        {(columnKey) => (
                            <TableCell>{renderCell(item, columnKey)}</TableCell>
                        )}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
