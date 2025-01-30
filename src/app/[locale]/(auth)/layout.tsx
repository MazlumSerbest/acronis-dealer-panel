export default function SignInLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className="flex flex-col bg-gradient-to-t from-blue-100 via-blue-50 to-blue-white">{children}</div>;
}
