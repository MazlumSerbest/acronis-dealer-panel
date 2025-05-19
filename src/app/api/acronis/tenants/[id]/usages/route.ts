import { NextResponse } from "next/server";
import { getAcronisToken } from "@/lib/getToken";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";

export const GET = auth(async (req: any, { params }: any) => {
    try {
        const tm = await getTranslations({
            locale: "en",
            namespace: "Messages",
        });

        if (!req.auth)
            return NextResponse.json({
                message: tm("authorizationNeeded"),
                status: 401,
                ok: false,
            });

        const token = await getAcronisToken();

        if (!token)
            return NextResponse.json({
                message: "Authentication failed!",
                status: 401,
                ok: false,
            });

        const headers = {
            Authorization: `Bearer ${token}`,
        };

        const usageNames = req.nextUrl.searchParams.get("usage_names");
        let searchParams: URLSearchParams | undefined = undefined;

        if (usageNames)
            searchParams = new URLSearchParams({
                usage_names: usageNames,
            });

        const res = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/tenants/${params?.id}/usages?${searchParams}`,
            {
                method: "GET",
                headers: headers,
            },
        );

        const usages = await res.json();

        if (res.ok) return NextResponse.json(usages);
        else
            return NextResponse.json({
                message: "Usages not found!",
                status: 404,
                ok: false,
            });
    } catch (error: any) {
        return NextResponse.json({
            message: error?.message,
            status: 500,
            ok: false,
        });
    }
});
