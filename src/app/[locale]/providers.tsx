"use client";
import { NextUIProvider } from "@nextui-org/react";
import { SWRConfig } from "swr";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NextUIProvider>
            <SWRConfig
                value={{
                    // refreshInterval: 3000,
                    fetcher: (url: string) => fetch(url).then((res) => res.json()),
                }}
            >
                {children}
            </SWRConfig>
        </NextUIProvider>
    );
}
