"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { SortDescriptor } from "@nextui-org/table";

import DataTable from "@/components/DataTable";
import BoolChip from "@/components/BoolChip";
import { Tooltip } from "@nextui-org/tooltip";
import { DateTimeFormat } from "@/utils/date";
import { BiLinkExternal } from "react-icons/bi";

export default function LicensesPage() {
    const t = useTranslations("General");
    const router = useRouter();

    //#region Table
    const visibleColumns = [
        "name",
        "serialNo",
        "duration",
        "quota",
        "type",
        "actions",
    ];

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

    const renderCell = React.useCallback(
        (client: Tenant, columnKey: React.Key) => {
            const cellValue: any = client[columnKey as keyof typeof client];

            switch (columnKey) {
                // case "kind":
                //     return (
                //         <h6>
                //             {cellValue
                //                 ? cellValue == "partner"
                //                     ? t("partner")
                //                     : t("customer")
                //                 : "-"}
                //         </h6>
                //     );
                case "enabled":
                    return <BoolChip value={cellValue} />;
                case "created_at":
                    return <p>{DateTimeFormat(cellValue)}</p>;
                case "updated_at":
                    return <p>{DateTimeFormat(cellValue)}</p>;
                case "actions":
                    return (
                        <div className="relative flex justify-start items-center">
                            <Tooltip key={client.id} content={t("openDetail")}>
                                <span className="text-xl text-blue-400 active:opacity-50">
                                    <BiLinkExternal
                                        onClick={() =>
                                            router.push("/panel/licenses//" + client.id)
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
        [router, t],
    );
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
