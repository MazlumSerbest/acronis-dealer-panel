import { LuCheckCircle2, LuXCircle } from "react-icons/lu";

interface Props {
    value: boolean;
    showText?: boolean;
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

export default function BoolChip(props: Props) {
    const { value, showText } = props;

    return (
        // <Chip
        //     color={value == true ? "success" : "danger"}
        //     size={size || "sm"}
        //     variant={variant || "flat"}
        // >
        <div className="w-full">
            <div
                className={
                    "flex items-center " +
                    (value ? "bg-green-100" : "bg-red-100") +
                    "  p-1 rounded-full w-min"
                }
            >
                {value ? (
                    <LuCheckCircle2 className="size-5 text-green-600" />
                ) : (
                    <LuXCircle className="size-5 text-red-500" />
                )}
                {showText ? (
                    <p
                        className={
                            (value ? "text-green-600" : "text-red-500") +
                            " mx-1"
                        }
                    >
                        {value == true ? "Yes" : "No"}
                    </p>
                ) : null}
            </div>
        </div>
        // </Chip>
    );
}
