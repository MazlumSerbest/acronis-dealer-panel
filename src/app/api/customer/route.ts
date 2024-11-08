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

        const partnerAcronisId = req.nextUrl.searchParams.get("partnerAcronisId");

        const data = await prisma.customer.findMany({
            where: {
                partnerAcronisId: partnerAcronisId,
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

        const customer: any = await req.json();
        customer.createdBy = req.auth.user.email;

        const newCustomer = await prisma.customer.create({
            data: customer,
        });

        if (newCustomer.id) {
            return NextResponse.json({
                message: "Müşteri başarıyla kaydedildi!",
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message: "Müşteri kaydedilemedi!",
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
