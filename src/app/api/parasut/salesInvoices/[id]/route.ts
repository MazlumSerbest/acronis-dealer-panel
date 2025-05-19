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

        const searchParams = new URLSearchParams({
            include: "contact,payments,details.product",
        });

        const res = await fetch(
            `${process.env.PARASUT_API_V4_URL}/${process.env.PARASUT_COMPANY_ID}/sales_invoices/${params?.id}?${searchParams}`,
            {
                headers: headers,
            },
        );

        const invoice = (await res.json()) || [];

        if (res.ok) return NextResponse.json(invoice);
        else
            return NextResponse.json({
                message: "Sale invoices not found!",
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
