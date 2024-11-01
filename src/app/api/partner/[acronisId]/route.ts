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

        const data = await prisma.partner.findUnique({
            where: {
                acronisId: params?.acronisId as string,
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

export const PUT = auth(async (req: any, { params }) => {
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
        partner.updatedAt = new Date().toISOString();
        partner.updatedBy = req.auth.user.email;

        const updatedPartner = await prisma.partner.update({
            data: partner,
            where: {
                acronisId: params?.acronisId as string,
            },
        });

        if (updatedPartner.id) {
            return NextResponse.json({
                message: "Partner başarıyla güncellendi!",
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message: "Partner güncellenemedi!",
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
