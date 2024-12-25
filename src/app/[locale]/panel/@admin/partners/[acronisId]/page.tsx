"use client";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useTranslations } from "next-intl";

export default function PartnerDetail({
    params,
}: {
    params: { acronisId: string };
}) {
    const t = useTranslations("General");
    const router = useRouter();


    const { data, error, isLoading, mutate } = useSWR(
        `/api/admin/customer?partnerAcronisId=${params.acronisId}`,
        null,
        {
            revalidateOnFocus: false,
        },
    );

    return <>
        
    </>;
}
