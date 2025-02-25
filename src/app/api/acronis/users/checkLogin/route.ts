import { NextResponse } from "next/server";
import { getAcronisToken } from "@/lib/getToken";
import { auth } from "@/auth";

export const GET = auth(async (req: any, { params }) => {
    try {
        if (!req.auth)
            return NextResponse.json({
                message: "Authorization Needed!",
                status: 401,
                ok: false,
            });

        const token = await getAcronisToken();

        if (!token)
            return NextResponse.json({
                message: "API Authentication failed!",
                status: 401,
                ok: false,
            });

        const username = req.nextUrl.searchParams.get("username");
        const headers = {
            Authorization: `Bearer ${token}`,
        };
        const check = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/users/check_login?username=${username}`,
            {
                method: "GET",
                headers: headers,
            },
        );

        return NextResponse.json({ status: check.status, ok: check.ok });
    } catch (error: any) {
        return NextResponse.json({
            message: error?.message,
            status: 500,
            ok: false,
        });
    }
});
