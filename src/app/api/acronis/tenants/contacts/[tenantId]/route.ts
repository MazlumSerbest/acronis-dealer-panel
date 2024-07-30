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
        const contactRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/tenants/${params?.tenantId}/contacts`,
            {
                method: "GET",
                headers: headers,
            },
        );

        if (contactRes.ok) {
            const contactIds = await contactRes.json();
            if (!contactIds.items.length)
                return await NextResponse.json({ contacts: { items: [] } });

            const params = new URLSearchParams({
                uuids: contactIds.items.join(),
                // lod: "basic",
            });
            const res = await fetch(
                `${process.env.ACRONIS_API_V2_URL}/contacts?${params}`,
                {
                    method: "GET",
                    headers: headers,
                },
            );

            if (res.ok) {
                const contacts = await res.json();
                return await NextResponse.json({ contacts });
            } else return await NextResponse.json({ message: "Failed!" });
        } else return await NextResponse.json({ message: "Failed" });
    } catch (error) {
        return NextResponse.json({ message: error });
    }
});
