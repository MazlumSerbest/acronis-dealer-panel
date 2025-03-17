import { cn } from "@/lib/utils";
import { LuCircleCheck, LuCircleX } from "react-icons/lu";

interface Props {
    value: boolean;
    showText?: boolean;
    size?: string;
    className?: string;
    // size?: "sm" | "md" | "lg" | undefined;
    // variant?:
    //     | "dot"
    //     | "flat"
    //     | "solid"
    //     | "bordered"
    //     | "light"
    //     | "faded"
    //     | "shadow-sm"
    //     | undefined;
}

export default function BoolChip({
    value,
    showText,
    size = "size-5",
    className,
}: Props) {
    return (
        <div className={className}>
            <div
                className={cn(
                    "flex items-center",
                    value ? "bg-green-100" : "bg-destructive/10",
                    "p-1 rounded-full w-min",
                )}
            >
                {value ? (
                    <LuCircleCheck className={cn(size, "text-green-600")} />
                ) : (
                    <LuCircleX className={cn(size, "text-destructive")} />
                )}
                {showText && (
                    <p
                        className={cn(
                            value ? "text-green-600" : "text-destructive",
                            "mx-1",
                        )}
                    >
                        {value == true ? "Yes" : "No"}
                    </p>
                )}
            </div>
        </div>
    );
}
