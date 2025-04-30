"use client";
import { Button } from "@/components/ui/button";
import { LuRefreshCw } from "react-icons/lu";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className="container h-dvh flex flex-col items-center justify-center gap-4">
                <h2 className="text-2xl font-bold">Something went wrong!</h2>
                <Button
                    className="flex gap-2 bg-blue-400 hover:bg-blue-400/90"
                    onClick={() => reset()}
                >
                    Try again
                    <LuRefreshCw className="size-5" />
                </Button>
            </body>
        </html>
    );
}
