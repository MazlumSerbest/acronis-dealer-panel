import React from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import { Tooltip } from "@nextui-org/tooltip";
import { BiSearch, BiEdit, BiTrash } from "react-icons/bi";
import BoolChip from "@/components/BoolChip";
import { SortDescriptor } from "@nextui-org/table";
import DataTable from "@/components/DataTable";

export default function UsersTab() {
    const t = useTranslations("General");
    const [users, setUsers] = React.useState<TenantUser[]>([]);

    //#region Table
    const visibleColumns = ["login", "enabled", "actions"];

    const sort: SortDescriptor = {
        column: "created_at",
        direction: "descending",
    };

    const columns: Column[] = [
        {
            key: "login",
            name: t("username"),
            width: 200,
            searchable: true,
            sortable: true,
        },
        {
            key: "enabled",
            name: t("enabled"),
            width: 150,
        },
        {
            key: "actions",
            name: t("actions"),
            width: 150,
        },
    ];

    const renderCell = React.useCallback(
        (user: TenantUser, columnKey: React.Key) => {
            const cellValue: any = user[columnKey as keyof typeof user];

            switch (columnKey) {
                case "login":
                    return (
                        <h6 className="text-clip">
                            {cellValue.length > 30
                                ? cellValue.substring(0, 30) + "..."
                                : cellValue}
                        </h6>
                    );
                case "enabled":
                    return <BoolChip value={cellValue} />;
                case "actions":
                    return (
                        <div className="relative flex justify-start items-center gap-2">
                            <Tooltip key={user.id} content="Edit User">
                                <span className="text-xl text-green-600 active:opacity-50 cursor-pointer">
                                    <BiEdit
                                        onClick={() => {}}
                                        onDoubleClick={() => {}}
                                    />
                                </span>
                            </Tooltip>
                            <Tooltip key={user.id} content="Delete User">
                                <span className="text-xl text-red-500 active:opacity-50 cursor-pointer">
                                    <BiTrash onClick={() => {}} />
                                </span>
                            </Tooltip>
                        </div>
                    );
                default:
                    return cellValue;
            }
        },
        [],
    );
    //#endregion

    const { data, error } = useSWR(
        "/api/acronis/tenant/users/28a5db46-58eb-4a61-b064-122f07ddac6a",
        null,
        {
            onSuccess: (data) => {
                setUsers(data.users?.items);
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
            data={users ?? []}
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
