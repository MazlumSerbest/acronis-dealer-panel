import React, { Key, ReactNode } from "react";
import { useRouter } from "next/navigation";

import { SortDescriptor } from "@nextui-org/table";

import DataTable from "@/components/DataTable";

export default function GeneralTab(
    t: Function,
    renderCell: (item: any, columnKey: Key) => ReactNode,
    children: Tenant[],
) {
    const router = useRouter();

    //#region Table
    const visibleColumns = ["name", "kind", "mfa_status", "enabled", "actions"];

    const sort: SortDescriptor = {
        column: "createdAt",
        direction: "descending",
    };

    const columns: Column[] = [
        {
            key: "name",
            name: t("name"),
            width: 200,
            searchable: true,
            sortable: true,
        },
        {
            key: "kind",
            name: t("kind"),
            width: 200,
        },
        {
            key: "mfa_status",
            name: t("mfaStatus"),
            width: 75,
        },
        {
            key: "enabled",
            name: t("enabled"),
            width: 75,
        },
        {
            key: "created_at",
            name: t("createdAt"),
            width: 150,
            sortable: true,
        },
        {
            key: "updated_at",
            name: t("updatedAt"),
            width: 150,
            sortable: true,
        },
        {
            key: "actions",
            name: t("actions"),
            width: 75,
        },
    ];
    //#endregion

    return (
        <>
            <DataTable
                isCompact
                isStriped
                data={children ?? []}
                columns={columns}
                renderCell={renderCell}
                defaultRowsPerPage={20}
                emptyContent={t("emptyContent")}
                sortOption={sort}
                initialVisibleColumNames={visibleColumns}
                activeOptions={[]}
                onDoubleClick={(item) => {
                    router.push("/panel/clients/" + item.id);
                }}
            />
        </>
    );
}
