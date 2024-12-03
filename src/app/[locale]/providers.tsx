"use client";
import { SWRConfig } from "swr";
import { TooltipProvider } from "@/components/ui/tooltip";

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
                <TooltipProvider>{children}</TooltipProvider>
            </SWRConfig>
        </>
    );
}
