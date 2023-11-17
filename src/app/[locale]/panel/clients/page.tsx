"use client";
import React from "react";
import { useRouter } from "next/navigation";
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
import { Button } from "@nextui-org/button";
import { Select, SelectSection, SelectItem } from "@nextui-org/select";
import { Pagination } from "@nextui-org/pagination";
import { BiLinkExternal, BiPlus, BiSearch } from "react-icons/bi";
import BoolChip from "@/components/BoolChip";
import PageHeader from "@/components/PageHeader";

export default function ClientsPage() {
    const t = useTranslations("General");
    const router = useRouter();

    //#region Table Design
    const columns = [
        {
            key: "name",
            label: t("name"),
            width: 200,
        },
        {
            key: "kind",
            label: t("kind"),
            width: 200,
        },
        {
            key: "mfa_status",
            label: t("mfaStatus"),
            width: 75,
        },
        {
            key: "enabled",
            label: t("enabled"),
            width: 75,
        },
        {
            key: "usage",
            label: t("usage"),
            width: 100,
        },
        {
            key: "actions",
            label: t("actions"),
            width: 75,
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
                                    ? t("partner")
                                    : t("customer")
                                : "-"}
                        </h6>
                    );
                case "mfa_status":
                    return <BoolChip value={cellValue == "enabled"} />;
                case "enabled":
                    return <BoolChip value={cellValue} />;
                case "actions":
                    return (
                        <div className="relative flex justify-start items-center">
                            <Tooltip key={client.id} content={t("openDetail")}>
                                <span className="text-xl text-blue-400 active:opacity-50">
                                    <BiLinkExternal
                                        onClick={() =>
                                            router.push("clients/" + client.id)
                                        }
                                    />
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
    //#endregion

    //#region Fetch Data
    const { data, error } = useSWR(
        "/api/acronis/tenant/children/28a5db46-58eb-4a61-b064-122f07ddac6a",
    );

    if (error) return <div>failed to load</div>;
    if (!data)
        return (
            <div className="flex flex-col gap-4">
                <PageHeader title={t("clients")} />
                <Skeleton>
                    <TableSkeleton />
                </Skeleton>
            </div>
        );
    //#endregion

    //#region Table Content
    const topContent = (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between gap-2">
                <div className="relative rounded-xl shadow-sm w-full sm:max-w-[40%]">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <BiSearch className="text-xl text-zinc-500" />
                    </div>
                    {/* <Input
                        isClearable
                        className="w-full sm:max-w-[44%]"
                        placeholder="Arama Yap"
                        startContent={
                            <BiSearch className="text-2xl text-zinc-500" />
                        }
                        value=""
                    /> */}

                    <input
                        type="text"
                        name="search"
                        id="search"
                        placeholder={t("search")}
                        className="block w-full rounded-xl border-0 py-2 pl-10 pr-3.5 bg-zinc-50 text-zinc-700 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 outline-none"
                    />
                </div>
                <div className="flex w-full sm:max-w-[50%] gap-2">
                    <Select
                        // label="Favorite Animal"
                        placeholder={t("enabled")}
                        labelPlacement="outside"
                        // className="max-w-xs"
                        // disableSelectorIconRotation
                        // selectorIcon={<SelectorIcon />}
                    >
                        <SelectItem key="true" value={1}>
                            {t("yes")}
                        </SelectItem>
                        <SelectItem key="false" value={0}>
                            {t("no")}
                        </SelectItem>
                    </Select>
                    <Select
                        placeholder={t("kind")}
                        labelPlacement="outside"
                        className="max-w-xs"
                        // selectorIcon={<SelectorIcon />}
                    >
                        <SelectItem key="partner" value="partner">
                            {t("partner")}
                        </SelectItem>
                        <SelectItem key="customer" value="customer">
                            {t("customer")}
                        </SelectItem>
                    </Select>
                    <Button
                        color="primary"
                        // onPress={onOpen}
                        endContent={<BiPlus className="text-xl text-white" />}
                        className="min-w-fit bg-blue-400"
                    />
                </div>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-small">
                    Total {data.children.items.length} clients
                </span>
            </div>
        </div>
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
    //#endregion

    return (
        <div className="flex flex-col gap-4">
            <PageHeader title={t("clients")} />
            <Table
                isStriped
                isCompact
                fullWidth
                selectionMode="single"
                color="primary"
                topContent={topContent}
                topContentPlacement="outside"
                // bottomContent={bottomContent}
                aria-label="Client Table"
            >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn
                            key={column.key}
                            width={column.width ? column.width : null}
                            // align=""
                        >
                            {column.label}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody
                    items={data.children.items || []}
                    emptyContent={t("emptyContent")}
                    loadingContent={<Loader />}
                >
                    {(client: Tenant) => (
                        <TableRow
                            key={client.id}
                            className="cursor-pointer"
                            onDoubleClick={() => {
                                router.push("clients/" + client.id);
                            }}
                        >
                            {(columnKey) => (
                                <TableCell>
                                    {renderCell(client, columnKey)}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
