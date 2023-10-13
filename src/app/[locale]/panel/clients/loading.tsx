import Skeleton, { TableSkeleton } from "@/components/loader/Skeleton";

export default function ClientsLoading() {
    return (
        <Skeleton>
            <TableSkeleton />
        </Skeleton>
    );
}
