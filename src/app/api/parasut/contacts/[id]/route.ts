import { NextResponse } from "next/server";
import { getParasutToken } from "@/lib/getToken";
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
                message: "Authorization Needed!",
                status: 401,
                ok: false,
            });

        const token = await getParasutToken();

        if (!token)
            return NextResponse.json({
                message: "API Authentication failed!",
                status: 401,
                ok: false,
            });

        const authorization = `Bearer ${token}`;
        const headers = {
            Authorization: authorization,
        };

        const res = await fetch(
            `${process.env.PARASUT_API_V4_URL}/${process.env.PARASUT_COMPANY_ID}/contacts/${params?.id}`,
            {
                headers: headers,
            },
        );

        const contact = (await res.json()) || [];

        if (res.ok) return NextResponse.json(contact.data);
        else
            return NextResponse.json({
                message: "Contact not found!",
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
