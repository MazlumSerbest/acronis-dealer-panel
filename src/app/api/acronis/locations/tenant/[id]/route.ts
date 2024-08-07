import { NextResponse } from "next/server";
import getToken from "@/lib/getToken";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";

export const GET = auth(async (req: any, { params }) => {
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

        const token = await getToken();

        if (!token)
            return NextResponse.json({
                message: "Authentication failed!",
                status: 401,
                ok: false,
            });

        const headers = {
            Authorization: `Bearer ${token}`,
        };
        const locationRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/tenants/${params?.id}/locations`,
            {
                method: "GET",
                headers: headers,
            },
        );

        if (locationRes.ok) {
            const locationIds = await locationRes.json();
            if (!locationIds.locations.length)
                return await NextResponse.json({ locations: { items: [] } });

            const params = new URLSearchParams({
                uuids: locationIds.locations.join(),
                // lod: "basic",
            });
            const res = await fetch(
                `${process.env.ACRONIS_API_V2_URL}/locations?${params}`,
                {
                    method: "GET",
                    headers: headers,
                },
            );

            const locations = await res.json();

            if (res.ok) return NextResponse.json({ locations });
            else return NextResponse.json({ message: "Failed!" });
        } else return NextResponse.json({ message: "Failed" });
    } catch (error: any) {
        return NextResponse.json({
            message: error?.message,
            status: 500,
            ok: false,
        });
    }
});
