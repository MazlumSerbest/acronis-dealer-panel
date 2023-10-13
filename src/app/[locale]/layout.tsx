import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Providers } from "./providers";
import { ToastContainer } from "react-toastify";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { notFound } from "next/navigation";

const locales = ["tr", "en"];

const inter = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Dcube",
    description: "Dcube Acronis Dealer Panel",
};

export default function LocaleLayout({ children, params: { locale } }: any) {
    const messages = useMessages();
    const isValidLocale = locales.some((cur) => cur === locale);
    if (!isValidLocale) notFound();

    return (
        <html lang={locale} className="light">
            <body className={inter.className}>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <Providers>{children}</Providers>
                    <ToastContainer
                        limit={5}
                        autoClose={5000}
                        hideProgressBar={true}
                        draggable
                        pauseOnHover
                    />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
