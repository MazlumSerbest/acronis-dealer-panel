"use client";
import { useRouter } from "next/navigation";
import { Divider } from "@nextui-org/divider";
import { BiX } from "react-icons/bi";

export default function PageHeader(props: { title: string; close?: boolean }) {
    const router = useRouter();
    return (
        <>
            <div className="flex mt-3 md:mt-0 mb-2">
                {/* <FiArrowLeft className="text-3xl text-zinc-500 cursor-pointer m-auto mr-4" onClick={() => router.back()}/> */}
                <h1 className="truncate text-3xl font-semibold text-blue-400">
                    {props.title}
                </h1>
                <div className="flex-1"></div>
                {props.close ? (
                    <BiX
                        className="text-3xl text-zinc-500 cursor-pointer m-auto mr-4"
                        onClick={() => router.back()}
                    />
                ) : null}
            </div>
            <Divider />
        </>
    );
}
