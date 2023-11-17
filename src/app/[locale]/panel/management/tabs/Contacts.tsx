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
import BoolChip from "@/components/BoolChip";
import { BiEdit, BiTrash } from "react-icons/bi";

export default function ContactsTab() {
    const t = useTranslations("General");

    //#region Table Content
    const columns = [
        {
            key: "fullname",
            label: "Name",
            width: 200,
        },
        {
            key: "email",
            label: "Email",
            width: 200,
        },
        {
            key: "phone",
            label: "Phone",
            width: 150,
        },
        {
            key: "title",
            label: "Job Title",
            width: 150,
        },
        {
            key: "types",
            label: "Types",
        },
        {
            key: "user",
            label: "User",
        },
        {
            key: "actions",
            label: "Actions",
            width: 150,
        },
    ];

    const renderCell = React.useCallback(
        (contact: TenantContact, columnKey: React.Key) => {
            let cellValue: any = contact[columnKey as keyof typeof contact];

            switch (columnKey) {
                case "fullname":
                    return (
                        <h6>
                            {
                                (cellValue =
                                    contact.firstname + " " + contact.lastname)
                            }
                        </h6>
                    );
                case "types":
                    return <h6>{(cellValue = contact.types.join(", "))}</h6>;
                case "user":
                    return <BoolChip value={!cellValue} />;
                case "actions":
                    return (
                        <div className="relative flex justify-start items-center gap-2">
                            <Tooltip key={contact.id} content="Edit Contact">
                                <span className="text-xl text-green-600 active:opacity-50">
                                    <BiEdit
                                        onClick={() => {}}
                                        onDoubleClick={() => {}}
                                    />
                                </span>
                            </Tooltip>
                            <Tooltip key={contact.id} content="Delete Contact">
                                <span className="text-xl text-red-500 active:opacity-50">
                                    <BiTrash onClick={() => {}} />
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

    //#region Data Fetch
    const { data, error } = useSWR(
        "/api/acronis/tenant/contacts/28a5db46-58eb-4a61-b064-122f07ddac6a",
    );

    if (error) return <div>failed to load</div>;
    if (!data)
        return (
            <Skeleton>
                <TableSkeleton />
            </Skeleton>
        );
    //#endregion

    return (
        <Table
            // isStriped
            fullWidth
            selectionMode="single"
            color="primary"
            aria-label="Contact Table"
        >
            <TableHeader columns={columns}>
                {(column) => (
                    <TableColumn
                        key={column.key}
                        minWidth={column.width ? column.width : null}
                        // align={
                        //     column.align &&
                        //     (column.align === "center" ||
                        //         column.align === "start" ||
                        //         column.align === "end")
                        //         ? column.align
                        //         : "start"
                        // }
                    >
                        {column.label}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody
                items={data.contacts.items.filter(
                    (c: TenantContact) => !c.types.includes("legal"),
                )}
                emptyContent={t("emptyContent")}
                loadingContent={<Loader />}
            >
                {(item: TenantContact) => (
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
