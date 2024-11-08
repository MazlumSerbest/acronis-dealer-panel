import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/utils/db";
import { getTranslations } from "next-intl/server";

export const GET = auth(async (req: any, { params }) => {
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

        const data = await prisma.license.findUnique({
            where: {
                id: params?.id as string,
            },
            include: {
                product: {
                    select: {
                        name: true,
                        quota: true,
                        unit: true,
                    },
                }
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

export const PUT = auth(async (req: any) => {
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

        const values = await req.json();

        const updatedLicenses = await prisma.license.updateMany({
            where: {
                serialNo: {
                    in: values.serials,
                },
            },
            data: {
                partnerAcronisId: values.partnerAcronisId,
                assignedAt: new Date().toISOString(),
                updatedBy: req.auth.user.email,
                updatedAt: new Date().toISOString(),
            },
        });

        if (updatedLicenses && updatedLicenses.count > 0) {
            return NextResponse.json({
                message: "Lisans(lar) başarıyla eklendi!",
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message: "Lisans(lar) eklenemedi!",
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
