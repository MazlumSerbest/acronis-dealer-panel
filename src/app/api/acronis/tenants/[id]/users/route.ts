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
        const userIdsRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/tenants/${params?.id}/users`,
            {
                method: "GET",
                headers: headers,
            },
        );

        if (!userIdsRes.ok)
            return NextResponse.json({
                message: "User Ids not found!",
                status: 404,
                ok: false,
            });

        const userIds = await userIdsRes.json();
        if (!userIds.items.length)
            return await NextResponse.json({ users: { items: [] } });

        const searchParams = new URLSearchParams({
            uuids: userIds.items.join(),
            // lod: "basic",
        });
        const userRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/users?${searchParams}`,
            {
                method: "GET",
                headers: headers,
            },
        );

        const users = await userRes.json();

        if (userRes.ok) return NextResponse.json(users.items);
        else
            return NextResponse.json({
                message: "Users not found!",
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
