import { NextResponse } from "next/server";
import prisma from "@/utils/db";
import { auth } from "@/auth";
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

        const data = await prisma.partner.findMany({
            orderBy: {
                createdAt: "asc",
            },
            include: {
                application: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
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

        if (!req.auth)
            return NextResponse.json({
                message: tm("authorizationNeeded"),
                status: 401,
                ok: false,
            });

        const partner = await req.json();
        partner.createdBy = req.auth.user.email;

        const existingPartner = await prisma.partner.findFirst({
            where: {
                acronisId: partner.acronisId,
            },
        });

        if (existingPartner)
            return NextResponse.json({
                message: "Bu Acronis Client ID başka bir partnere tanımlanmış!",
                status: 400,
                ok: false,
            });

        const newPartner = await prisma.partner.create({
            data: partner,
        });

        if (newPartner.id) {
            return NextResponse.json({
                message: "Partner başarıyla kaydedildi!",
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message: "Partner kaydedilemedi!",
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
