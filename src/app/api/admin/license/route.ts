import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/utils/db";
import {
    formatBytes,
    generateLicenseKey,
    generateShortId,
    parseBytes,
} from "@/utils/functions";
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
                        gte: new Date(),
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
                        lt: new Date(),
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

        const data = await prisma.v_License.findMany({
            where: where,
            orderBy: {
                createdAt: "asc",
            },
        });

        const newData = data.map((license) => {
            return {
                ...license,
                bytes: license.bytes
                    ? formatBytes(license.bytes.toString())
                    : null,
            };
        });

        return NextResponse.json(newData);
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

        if (request.quota && request.unit) {
            request.bytes = parseBytes(request.quota, request.unit);
        } else {
            request.bytes = null;
        }

        for (let i = 0; i < request.piece; i++) {
            licenses.push({
                productId: request.productId,
                serialNo: generateShortId(),
                key: generateLicenseKey(),
                expiresAt: request.expiresAt,
                endsAt: request.endsAt,
                createdBy: req.auth.user.email,
                bytes: request.bytes,
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

export const DELETE = auth(async (req: any) => {
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

        const licenseIds = await req.json();

        const deleted = await prisma.license.deleteMany({
            where: {
                id: {
                    in: licenseIds,
                },
            },
        });

        if (deleted.count === licenseIds.length) {
            return NextResponse.json({
                message: "Lisanslar başarıyla silindi!",
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message: "Lisanslar silinirken hata oluştu!",
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
