"use client";
import { SWRConfig } from "swr";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SWRConfig
                value={{
                    // refreshInterval: 3000,
                    fetcher: async (url) => {
                        const response = await fetch(url);
                        if (!response.ok)
                            throw new Error("Failed to fetch data");
                        return response.json();
                    },
                }}
            >
                <SessionProvider refetchOnWindowFocus>
                    <TooltipProvider>{children}</TooltipProvider>
                </SessionProvider>
            </SWRConfig>
        </>
    );
}
