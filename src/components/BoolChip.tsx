// import { Chip } from "@nextui-org/chip";
import { BiCheckCircle, BiXCircle } from "react-icons/bi";

interface Props {
    value: boolean;
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
            <div className={(props.value ? "bg-green-100" : "bg-red-100") + "  p-1 rounded-full w-min"}>
                {props.value ? (
                    <BiCheckCircle className="text-xl text-green-600" />
                ) : (
                    <BiXCircle className="text-xl text-red-500" />
                )}
                {/* {props.value == true ? "Yes" : "No"} */}
            </div>
        </div>
        // </Chip>
    );
}
