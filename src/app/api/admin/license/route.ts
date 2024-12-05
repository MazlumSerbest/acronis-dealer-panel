import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/utils/db";
import { generateCuid, generateLicenseKey } from "@/utils/functions";
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
                    partnerAcronisId: { not: null },
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
                    // customerAcronisId: null,
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

        const data = await prisma.v_License.findMany({
            where: where,
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

        // const license = await req.json();
        // license.createdBy = req.auth.user.email;

        // const checkSerial = await prisma.license.findUnique({
        //     where: {
        //         serialNo: license.serialNo,
        //     },
        // });
        // if (checkSerial)
        //     return NextResponse.json({
        //         message: tm("licenseSerialExists"),
        //         status: 400,
        //         ok: false,
        //     });

        // const checkKey = await prisma.license.findUnique({
        //     where: {
        //         key: license.key,
        //     },
        // });
        // if (checkKey)
        //     return NextResponse.json({
        //         message: tm("licenseKeyExists"),
        //         status: 400,
        //         ok: false,
        //     });

        const request = await req.json();
        let licenses = [];

        for (let i = 0; i < request.piece; i++) {
            licenses.push({
                productId: request.productId,
                serialNo: generateCuid(),
                key: generateLicenseKey(),
                expiresAt: request.expiresAt,
                createdBy: req.auth.user.email,
            });
        }

        const newLicenses = await prisma.license.createMany({
            data: licenses as any[],
            skipDuplicates: true,
        });

        if (newLicenses.count === licenses.length) {
            return NextResponse.json({
                data: licenses,
                message: "Lisanslar başarıyla kaydedildi!",
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message: "Lisanslar kaydedilemedi!",
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
