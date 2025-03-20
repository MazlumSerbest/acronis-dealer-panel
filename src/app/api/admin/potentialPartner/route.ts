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

        if (req.auth.user.role !== "admin")
            return NextResponse.json({
                message: tm("authorizationNeeded"),
                status: 401,
                ok: false,
            });

        const status = req.nextUrl.searchParams.get("status");

        const data = await prisma.potentialPartner.findMany({
            where: {
                status: status,
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

        const potentialPartner = await req.json();
        potentialPartner.createdBy = req.auth.user.email;

        const newPartner = await prisma.potentialPartner.create({
            data: potentialPartner,
        });

        if (newPartner.id) {
            return NextResponse.json({
                message: "Potansiyel partner başarıyla kaydedildi!",
                status: 200,
                ok: true,
                data: newPartner,
            });
        } else {
            return NextResponse.json({
                message: "Potansiyel partner kaydedilemedi!",
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
