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

        if (!req.auth)
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

        if (!partnerAcronisId && !customerAcronisId) return;

        switch (status) {
            case "inactive":
                where = {
                    customerAcronisId: null,
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } },
                    ],
                };
                break;
            case "active":
                where = {
                    customerAcronisId: customerAcronisId
                        ? customerAcronisId
                        : { not: null },
                    activatedAt: {
                        not: null,
                        gte: new Date(
                            new Date().setFullYear(
                                new Date().getFullYear() - 1,
                            ),
                        ),
                    },
                };
                break;
            case "completed":
                where = {
                    customerAcronisId: customerAcronisId
                        ? customerAcronisId
                        : { not: null },
                    activatedAt: {
                        not: null,
                        lt: new Date(
                            new Date().setFullYear(
                                new Date().getFullYear() - 1,
                            ),
                        ),
                    },
                };
                break;
            case "expired":
                where = {
                    activatedAt: null,
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
