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

        const parentAcronisId = req.nextUrl.searchParams.get("parentAcronisId");

        const data = await prisma.partner.findMany({
            where: {
                parentAcronisId: parentAcronisId,
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

        if (!req.auth)
            return NextResponse.json({
                message: tm("authorizationNeeded"),
                status: 401,
                ok: false,
            });

        const partner: any = await req.json();
        partner.createdBy = req.auth.user.email;

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
