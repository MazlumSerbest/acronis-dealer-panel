export default function Skeleton({ children }: { children: React.ReactNode }) {
    return (
        <div className="animate-pulse flex flex-col w-full gap-y-3 mt-1 md:mt-0">
            {children || (
                <div className="rounded bg-slate-200 w-full h-screen"></div>
            )}
        </div>
    );
}
