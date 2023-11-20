import Skeleton, { DefaultSkeleton } from "@/components/loaders/Skeleton";

export default function DetailLoading() {
    return (
        <div className="mt-4">
            <Skeleton>
                <DefaultSkeleton />
            </Skeleton>
        </div>
    );
}