import Skeleton, { DefaultSkeleton } from "@/components/loaders/Skeleton";

export default function DetailLoading() {
    return (
        <div>
            <Skeleton>
                <DefaultSkeleton />
            </Skeleton>
        </div>
    );
}