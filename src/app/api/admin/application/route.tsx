import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/utils/db";
import { getTranslations } from "next-intl/server";

export const GET = auth(async (req: any) => {
    try {
        const tm = await getTranslations({
            locale: "en",
            namespace: "Messages",
        });

        if (req.auth.user.role !== "admin")
            return NextResponse.json({
                message: tm("authorizationNeeded"),
                status: 401,
                ok: false,
            });

        const status = req.nextUrl.searchParams.get("status");
        let where = {};

        switch (status) {
            case "waiting":
                where = {
                    approvedAt: null,
                    partner: { is: null },
                };
                break;
            case "approved":
                where = {
                    approvedAt: { not: null },
                    partner: { is: null },
                };
                break;
            case "resolved":
                where = {
                    approvedAt: { not: null },
                    partner: { isNot: null },
                };
                break;
            default:
                break;
        }

        const data = await prisma.application.findMany({
            where: where,
            include: {
                partner: {
                    select: {
                        id: true,
                        acronisId: true,
                        // name: true,
                        // email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({
            message: error?.message,
            status: 500,
            ok: false,
        });
    }
});
