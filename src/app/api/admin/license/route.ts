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
        let include = {};

        switch (status) {
            case "unassigned":
                where = {
                    partnerId: { is: null },
                    clientId: { is: null },
                };
                break;
            case "assigned":
                where = {
                    partnerId: { isNot: null },
                    clientId: { is: null },
                };
                break;
            case "active":
                where = {
                    partnerId: { isNot: null },
                    clientId: { isNot: null },
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
                    partnerId: { isNot: null },
                    clientId: { isNot: null },
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
                    clientId: { is: null },
                    expiredAt: { lt: new Date() },
                };
                break;
            default:
                break;
        }

        switch (status) {
            case "assigned":
                include = {
                    partner: {
                        select: {
                            name: true,
                        },
                    },
                };
                break;
            case "active":
            case "completed":
            case "expired":
                include = {
                    partner: {
                        select: {
                            name: true,
                        },
                    },
                    client: {
                        select: {
                            name: true,
                        },
                    },
                };
                break;
            default:
                break;
        }

        const data = await prisma.license.findMany({
            where: where,
            include: include,
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

export const POST = auth(async (req: any) => {
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

        const license = await req.json();
        license.createdBy = req.auth.user.email;

        const newLicense = await prisma.license.create({
            data: license,
        });
        if (newLicense.id) {
            return NextResponse.json({
                message: "Lisans başarıyla kaydedildi!",
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message: "Lisans kaydedilemedi!",
                status: 400,
                ok: false,
            });
        }
    } catch (error: any) {
        return NextResponse.json({
            message: error?.message,
            status: 500,
            ok: false,
        });
    }
});
