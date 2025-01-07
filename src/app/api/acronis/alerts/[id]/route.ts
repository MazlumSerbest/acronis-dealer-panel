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

        const res = await fetch(
            `${process.env.ACRONIS_ALERT_API_URL}/alerts/${params?.id}`,
            {
                method: "GET",
                headers: headers,
            },
        );

        if (res.ok) {
            const alert = await res.json();
            return await NextResponse.json(alert);
        } else return await NextResponse.json({ message: "Failed!" });
    } catch (error: any) {
        return NextResponse.json({
            message: error?.message,
            status: 500,
            ok: false,
        });
    }
});
