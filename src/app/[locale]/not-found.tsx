"use client";
import Error from "next/error";
import { useTranslations, useLocale } from "next-intl";

export default function NotFound() {
    const t = useTranslations("General");
    const locale = useLocale();

    return (
        <html lang={locale}>
            <body>
                <Error statusCode={404} />
            </body>
        </html>
    );
}
