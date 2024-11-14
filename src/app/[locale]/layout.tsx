import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import NextTopLoader from "nextjs-toploader";
import { chartColors } from "@/lib/constants";

const locales = ["en", "tr"];

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "DBackup Dealer Panel",
    description: "DBackup Acronis Dealer Panel",
};

export default async function LocaleLayout({
    children,
    params: { locale },
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const messages = await getMessages();
    const isValidLocale = locales.some((cur) => cur === locale);
    if (!isValidLocale) notFound();

    return (
        <html lang={locale} className="light">
            <body className={inter.className}>
                <NextTopLoader
                    color={chartColors.blue}
                    showSpinner={false}
                    easing="ease"
                />
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <Providers>{children}</Providers>
                    <Toaster />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
