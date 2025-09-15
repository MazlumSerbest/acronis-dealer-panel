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
        const partnerAcronisId =
            req.nextUrl.searchParams.get("partnerAcronisId");
        const customerAcronisId =
            req.nextUrl.searchParams.get("customerAcronisId");
        let where = {};

        switch (status) {
            case "unassigned":
                where = {
                    partnerAcronisId: null,
                    customerAcronisId: null,
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } },
                    ],
                };
                break;
            case "assigned":
                where = {
                    partnerAcronisId: { not: null },
                    customerAcronisId: null,
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } },
                    ],
                };
                break;
            case "active":
                where = {
                    partnerAcronisId: { not: null },
                    customerAcronisId: customerAcronisId
                        ? customerAcronisId
                        : { not: null },
                    endsAt: {
                        not: null,
                        lte: new Date(),
                    },
                };
                break;
            case "completed":
                where = {
                    partnerAcronisId: { not: null },
                    customerAcronisId: customerAcronisId
                        ? customerAcronisId
                        : { not: null },
                    endsAt: {
                        not: null,
                        gt: new Date(),
                    },
                };
                break;
            case "expired":
                where = {
                    endsAt: null,
                    expiresAt: { lt: new Date() },
                };
                break;
            default:
                break;
        }

        if (partnerAcronisId) {
            where = {
                partnerAcronisId: partnerAcronisId,
                ...where,
            };
        }

        const data = await prisma.v_License.count({
            where: where,
        });

        return NextResponse.json({ count: data });
    } catch (error: any) {
        return NextResponse.json({
            message: error?.message,
            status: 500,
            ok: false,
        });
    }
});
