import React, { Key, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { SortDescriptor } from "@nextui-org/table";

import DataTable from "@/components/DataTable";

export default function LicensesTab(
    t: Function,
    renderCell: (item: any, columnKey: Key) => ReactNode,
    tenant: Tenant,
) {
    const router = useRouter();

    //#region Table
    const visibleColumns = ["name", "serialNo", "duration", "quota", "type", "actions"];

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
            key: "serialNo",
            name: t("serialNo"),
            width: 200,
        },
        {
            key: "duration",
            name: t("duration"),
            width: 75,
        },
        {
            key: "quota",
            name: t("quota"),
            width: 75,
        },
        {
            key: "type",
            name: t("type"),
            width: 75,
        },
        {
            key: "actions",
            name: t("actions"),
            width: 75,
        },
    ];
    //#endregion

    return (
        <DataTable
            isCompact={false}
            isStriped
            data={[]}
            columns={columns}
            renderCell={renderCell}
            defaultRowsPerPage={20}
            emptyContent={t("emptyContent")}
            sortOption={sort}
            initialVisibleColumNames={visibleColumns}
            activeOptions={[]}
            onDoubleClick={(item) => {
                router.push("/panel/licenses/" + item.id);
            }}
        />
    );
}
