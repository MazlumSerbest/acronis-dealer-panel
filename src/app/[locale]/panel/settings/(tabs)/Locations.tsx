"use client";
import React, { useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";

import { SortDescriptor } from "@nextui-org/table";
import { Tooltip } from "@nextui-org/tooltip";

import Skeleton, { DefaultSkeleton } from "@/components/loaders/Skeleton";
import DataTable from "@/components/DataTable";
import BoolChip from "@/components/BoolChip";

export default function LocationsTab() {
    const t = useTranslations("General");
    const [locations, setLocations] = useState([]);

    //#region Table
    const visibleColumns = ["name", "platform_owned"];

    const sort: SortDescriptor = {
        column: "created_at",
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
            key: "platform_owned",
            name: t("platformOwned"),
            width: 150,
        },
    ];

    const renderCell = React.useCallback(
        (user: TenantUser, columnKey: React.Key) => {
            const cellValue: any = user[columnKey as keyof typeof user];

            switch (columnKey) {
                // case "login":
                //     return (
                //         <h6 className="text-clip">
                //             {cellValue.length > 30
                //                 ? cellValue.substring(0, 30) + "..."
                //                 : cellValue}
                //         </h6>
                //     );
                case "platform_owned":
                    return <BoolChip value={cellValue} />;
                // case "actions":
                //     return (
                //         <div className="relative flex justify-start items-center gap-2">
                //             <Tooltip key={user.id} content="Edit User">
                //                 <span className="text-xl text-green-600 active:opacity-50 cursor-pointer">
                //                     <BiEdit
                //                         onClick={() => {}}
                //                         onDoubleClick={() => {}}
                //                     />
                //                 </span>
                //             </Tooltip>
                //             <Tooltip key={user.id} content="Delete User">
                //                 <span className="text-xl text-red-500 active:opacity-50 cursor-pointer">
                //                     <BiTrash onClick={() => {}} />
                //                 </span>
                //             </Tooltip>
                //         </div>
                //     );
                default:
                    return cellValue;
            }
        },
        [],
    );
    //#endregion

    const { data, error } = useSWR(
        "/api/acronis/locations/tenant/28a5db46-58eb-4a61-b064-122f07ddac6a",
        null,
        {
            onSuccess: (data) => {
                setLocations(data.locations?.items);
            },
        },
    );

    if (error) return <div>failed to load</div>;
    if (!data)
        return (
            <Skeleton>
                <DefaultSkeleton />
            </Skeleton>
        );
    return (
        <DataTable
            isCompact={false}
            isStriped
            data={locations ?? []}
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
