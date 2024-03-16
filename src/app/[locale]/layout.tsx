import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { notFound } from "next/navigation";
import { Toaster } from "react-hot-toast";
import NextTopLoader from "nextjs-toploader";

const locales = ["tr", "en"];

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Dcube",
    description: "Dcube Acronis Dealer Panel",
};

export default function LocaleLayout({
    children,
    params: { locale },
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const messages = useMessages();
    const isValidLocale = locales.some((cur) => cur === locale);
    if (!isValidLocale) notFound();

    return (
        <html lang={locale} className="light">
            <body className={inter.className}>
                <NextTopLoader color="rgb(96 165 250)" showSpinner={false} easing="ease" />
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <Providers>{children}</Providers>
                    <Toaster
                        position="bottom-center"
                        toastOptions={{
                            duration: 4000,
                            className: "text-blue-400",
                        }}
                    />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
