"use client";
import { SWRConfig } from "swr";

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
                {children}
            </SWRConfig>
        </>
    );
}
