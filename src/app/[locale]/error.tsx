"use client";
import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LuRefreshCw } from "react-icons/lu";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);
    const t = useTranslations("General");
    const locale = useLocale();

    return (
        <html lang={locale}>
            <body>
                <div className="container h-dvh flex flex-col items-center justify-center gap-4">
                    <h2 className="text-2xl font-bold">{t("errorTitle")}</h2>
                    <Button
                        className="flex gap-2 bg-blue-400 hover:bg-blue-400/90"
                        onClick={() => reset()}
                    >
                        {t("tryAgain")}
                        <LuRefreshCw className="size-5" />
                    </Button>
                </div>
            </body>
        </html>
    );
}
