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
        const partnerAcronisId = req.nextUrl.searchParams.get("partnerAcronisId");
        const customerAcronisId = req.nextUrl.searchParams.get("customerAcronisId");
        let where = {};
        let include = {};

        // if (!partnerAcronisId)
        //     return NextResponse.json({
        //         message: tm(""),
        //         status: 400,
        //         ok: false,
        //     });

        switch (status) {
            case "inactive":
                where = {
                    customer: { is: null },
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } },
                    ],
                };
                break;
            case "active":
                where = {
                    customer: { isNot: null },
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
                    OR: [{ customer: { isNot: null } }],
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

        switch (status) {
            case "active":
            case "completed":
            case "expired":
                include = {
                    customer: {
                        select: {
                            acronisId: true,
                        },
                    },
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

        if (customerAcronisId) {
            where = {
                customerAcronisId: customerAcronisId,
                ...where,
            };
        }

        const data = await prisma.license.findMany({
            where: where,
            include: {
                ...include,
                product: {
                    select: {
                        name: true,
                        quota: true,
                        unit: true,
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
