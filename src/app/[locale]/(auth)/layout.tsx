export default function SignInLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className="flex flex-col bg-gradient-to-t from-blue-100/30 via-blue-100/10 to-blue-white">{children}</div>;
}
