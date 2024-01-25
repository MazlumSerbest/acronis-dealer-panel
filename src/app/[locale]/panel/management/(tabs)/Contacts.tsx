import React from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import { Tooltip } from "@nextui-org/tooltip";
import BoolChip from "@/components/BoolChip";
import { BiEdit, BiTrash } from "react-icons/bi";
import { SortDescriptor } from "@nextui-org/table";
import DataTable from "@/components/DataTable";

export default function ContactsTab() {
    const t = useTranslations("General");
    const [contacts, setContacts] = React.useState<TenantContact[]>([]);

    //#region Table
    const visibleColumns = [
        "fullname",
        "email",
        "phone",
        "title",
        "types",
        "user",
    ];

    const sort: SortDescriptor = {
        column: "created_at",
        direction: "descending",
    };

    const columns: Column[] = [
        {
            key: "fullname",
            name: t("fullName"),
            width: 200,
            searchable: true,
            sortable: true,
        },
        {
            key: "email",
            name: t("email"),
            width: 200,
            searchable: true,
        },
        {
            key: "phone",
            name: t("phone"),
            width: 150,
            searchable: true,
        },
        {
            key: "title",
            name: t("jobTitle"),
            width: 150,
            searchable: true,
        },
        {
            key: "types",
            name: t("types"),
        },
        {
            key: "user",
            name: t("user"),
            searchable: true,
        },
        // {
        //     key: "actions",
        //     label: t("actions"),
        //     width: 150,
        // },
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

    const { data, error } = useSWR(
        "/api/acronis/tenant/contacts/28a5db46-58eb-4a61-b064-122f07ddac6a",
        null,
        {
            onSuccess: (data) => {
                setContacts(
                    data.contacts.items.filter(
                        (c: TenantContact) => !c.types.includes("legal"),
                    ),
                );
            },
        },
    );

    if (error) return <div>failed to load</div>;
    if (!data)
        return (
            <Skeleton>
                <TableSkeleton />
            </Skeleton>
        );
    return (
        <DataTable
            isCompact={false}
            isStriped
            data={contacts ?? []}
            columns={columns}
            renderCell={renderCell}
            defaultRowsPerPage={10}
            emptyContent={t("emptyContent")}
            sortOption={sort}
            initialVisibleColumNames={visibleColumns}
            activeOptions={[]}
            // onDoubleClick={(item) => {
            //     router.push("/panel/licenses/" + item.id);
            // }}
        />
    );
}
