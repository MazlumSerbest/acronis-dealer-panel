import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";

export default function ClientsLoading() {
    return (
        <Skeleton>
            <TableSkeleton />
        </Skeleton>
    );
}
