import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/utils/db";

export const GET = auth(async (req: any) => {
    try {
        if (!req.auth)
            return NextResponse.json({
                message: "Authorization Needed!",
                status: 401,
                ok: false,
            });

        const status = req.nextUrl.searchParams.get("status");
        let where = {};

        switch (status) {
            case "waiting":
                where = {
                    approvedAt: null,
                    partnerId: null,
                };
                break;
            case "approved":
                where = {
                    approvedAt: { not: null },
                    partnerId: null,
                };
                break;
            case "resolved":
                where = {
                    approvedAt: { not: null },
                    partnerId: { not: null },
                };
                break;
            default:
                break;
        }

        const data = await prisma.application.findMany({
            where: where,
            orderBy: {
                createdAt: "asc",
            },
        });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ message: error, status: 500, ok: false });
    }
});
