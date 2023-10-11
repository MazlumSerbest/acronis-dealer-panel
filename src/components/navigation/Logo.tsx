import Image from "next/image";

interface Props {
    width: number;
    height: number;
}

export default function Logo(props: Props) {
    return (
        <div className="flex justify-center">
            <Image src="/images/dcube.png" width={props.width} height={props.height} alt="Dcube Logo" />
        </div>
    );
}
