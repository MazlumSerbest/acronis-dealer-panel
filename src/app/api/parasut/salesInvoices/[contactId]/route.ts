import { NextResponse } from "next/server";
import { getParasutToken } from "@/lib/getToken";
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

        const currentPage = req.nextUrl.searchParams.get("currentPage") || 1;
        const paymentStatus =
            req.nextUrl.searchParams.get("paymentStatus") ||
            "overdue,not_due,paid,unpaid";
        const sort = req.nextUrl.searchParams.get("sort") || "-issue_date";

        const searchParams = new URLSearchParams({
            "filter[contact_id]": params?.contactId as string,
            "filter[category]": "6549838",
            "filter[payment_status]": paymentStatus,
            "page[number]": currentPage,
            "page[size]": "25",
            sort: sort,
        });

        const res = await fetch(
            `${process.env.PARASUT_API_V4_URL}/${process.env.PARASUT_COMPANY_ID}/sales_invoices?${searchParams}`,
            {
                headers: headers,
            },
        );

        const invoices = (await res.json()) || [];

        if (res.ok) return NextResponse.json(invoices);
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
