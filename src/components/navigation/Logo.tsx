import Image from "next/image";

export default function Logo(props: { width: number, height: number }) {
    return (
        <div className="flex justify-center">
            <Image src="/images/dcube.png" width={props.width} height={props.height} alt="Dcube Logo" />
        </div>
    );
}
