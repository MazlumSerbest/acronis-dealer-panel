// import { Chip } from "@nextui-org/chip";
import { BiCheckCircle, BiXCircle } from "react-icons/bi";

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
    return (
        // <Chip
        //     color={props.value == true ? "success" : "danger"}
        //     size={props.size || "sm"}
        //     variant={props.variant || "flat"}
        // >
        <div className="w-full">
            <div
                className={
                    "flex items-center " +
                    (props.value ? "bg-green-100" : "bg-red-100") +
                    "  p-1 rounded-full w-min"
                }
            >
                {props.value ? (
                    <BiCheckCircle className="text-xl text-green-600" />
                ) : (
                    <BiXCircle className="text-xl text-red-500" />
                )}
                {props.showText ? (
                    <p
                        className={
                            (props.value ? "text-green-600" : "text-red-500") +
                            " mx-1"
                        }
                    >
                        {props.value == true ? "Yes" : "No"}
                    </p>
                ) : null}
            </div>
        </div>
        // </Chip>
    );
}
