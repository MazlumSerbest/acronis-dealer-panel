import { cn } from "@/lib/utils";
import { LuCheckCircle2, LuXCircle } from "react-icons/lu";

interface Props {
    value: boolean;
    showText?: boolean;
    size?: string;
    // size?: "sm" | "md" | "lg" | undefined;
    // variant?:
    //     | "dot"
    //     | "flat"
    //     | "solid"
    //     | "bordered"
    //     | "light"
    //     | "faded"
    //     | "shadow"
    //     | undefined;
}

export default function BoolChip({ value, showText, size = "size-5" }: Props) {
    return (
        <div className="w-full">
            <div
                className={cn(
                    "flex items-center",
                    value ? "bg-green-100" : "bg-red-100",
                    "p-1 rounded-full w-min",
                )}
            >
                {value ? (
                    <LuCheckCircle2 className={cn(size, "text-green-600")} />
                ) : (
                    <LuXCircle className={cn(size, "text-red-500")} />
                )}
                {showText ? (
                    <p
                        className={cn(
                            value ? "text-green-600" : "text-red-500",
                            "mx-1",
                        )}
                    >
                        {value == true ? "Yes" : "No"}
                    </p>
                ) : null}
            </div>
        </div>
    );
}
