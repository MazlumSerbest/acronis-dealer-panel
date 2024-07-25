import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";

export default function SignInLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = useTranslations("General.Pages");
    const locale = useLocale();

    return (
        <>
            <div className="absolute right-4 md:right-10 xl:right-12 top-2 text-sm text-muted-foreground">
                <Link
                    href="/tr/signin"
                    className={cn("hover:underline", locale == "tr" && "text-blue-400 underline")}
                >
                    Türkçe
                </Link>
                <span className="px-2">|</span>
                <Link
                    href="/en/signin"
                    className={cn("hover:underline", locale == "en" && "text-blue-400 underline")}
                >
                    English
                </Link>
            </div>
            {children}
        </>
    );
}
