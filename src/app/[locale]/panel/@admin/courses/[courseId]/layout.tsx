export default function CourseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className="container flex flex-col gap-4">{children}</div>;
}
