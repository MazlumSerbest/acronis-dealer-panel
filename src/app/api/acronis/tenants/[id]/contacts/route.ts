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
        const contactIdsRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/tenants/${params?.id}/contacts`,
            {
                method: "GET",
                headers: headers,
            },
        );

        if (!contactIdsRes.ok)
            NextResponse.json({
                message: "Contact Ids not found!",
                status: 404,
                ok: false,
            });

        const contactIds = await contactIdsRes.json();
        if (!contactIds.items.length)
            return await NextResponse.json({ contacts: { items: [] } });

        const searchParams = new URLSearchParams({
            uuids: contactIds.items.join(),
            // lod: "basic",
        });
        const contactsRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/contacts?${searchParams}`,
            {
                method: "GET",
                headers: headers,
            },
        );

        const contacts = await contactsRes.json();

        if (contactsRes.ok) return NextResponse.json(contacts);
        else
            return NextResponse.json({
                message: "Contacts not found!",
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
