"use client";
import { useRouter } from "next/navigation";
import { LuX } from "react-icons/lu";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";

interface Props {
    title: string;
    close?: boolean;
}

export default function PageHeader(props: Props) {
    const router = useRouter();
    const { title, close } = props;

    return (
        <div>
            <div className="flex mt-3 md:mt-0 mb-2">
                {/* <FiArrowLeft className="text-3xl text-zinc-500 cursor-pointer m-auto mr-4" onClick={() => router.back()}/> */}
                <h1 className="truncate text-3xl font-semibold text-blue-400">
                    {title}
                </h1>
                <div className="flex-1"></div>
                {close ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                    >
                        <LuX className="text-3xl text-zinc-500 m-auto mr-4" />
                    </Button>
                ) : null}
            </div>
            <Separator />
        </div>
    );
}
