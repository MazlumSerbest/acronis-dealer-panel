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
                    partner: { is: null },
                    client: { is: null },
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } },
                    ],
                };
                break;
            case "assigned":
                where = {
                    partner: { isNot: null },
                    client: { is: null },
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } },
                    ],
                };
                break;
            case "active":
                where = {
                    partner: { isNot: null },
                    client: { isNot: null },
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
            case "finished":
                where = {
                    partner: { isNot: null },
                    client: { isNot: null },
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
                    // clientId: { is: null },
                    activatedAt: null,
                    expiresAt: { lt: new Date() },
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
            case "finished":
            case "expired":
                include = {
                    partner: {
                        select: {
                            name: true,
                        },
                    },
                    client: {
                        select: {
                            acronisId: true,
                        },
                    },
                };
                break;
            default:
                break;
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

        const checkSerial = await prisma.license.findUnique({
            where: {
                serialNo: license.serialNo,
            },
        });
        if (checkSerial)
            return NextResponse.json({
                message: tm("licenseSerialExists"),
                status: 400,
                ok: false,
            });

        const checkKey = await prisma.license.findUnique({
            where: {
                key: license.key,
            },
        });
        if (checkKey)
            return NextResponse.json({
                message: tm("licenseKeyExists"),
                status: 400,
                ok: false,
            });

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
