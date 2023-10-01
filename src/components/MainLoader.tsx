import Image from "next/image";

export default function MainLoader() {
    return(
        <div className="flex w-screen h-screen items-center justify-center">
            <Image
                src="/images/dcube.png"
                width={120}
                height={50}
                alt="Dcube"
            />
        </div>
    )
}