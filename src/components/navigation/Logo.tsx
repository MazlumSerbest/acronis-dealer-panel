import Image from "next/image";

interface Props {
    width: number;
    height: number;
}

export default function Logo(props: Props) {
    const { width, height } = props;

    return (
        <div className="flex justify-center">
            <Image src="/images/logo.png" width={width} height={height} alt="Dcube Logo" />
        </div>
    );
}
