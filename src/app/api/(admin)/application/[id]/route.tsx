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

        const data = await prisma.application.findUnique({
            where: {
                id: params?.id as string,
            },
            include: {
                partner: {
                    select: {
                        id: true,
                        acronisId: true,
                    },
                }
            }
        });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ message: error, status: 500, ok: false });
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

        const application: any = await req.json();
        application.updatedAt = new Date().toISOString();
        application.updatedBy = req.auth.user.email;

        const updatedApplication = await prisma.application.update({
            data: application,
            where: {
                id: params?.id as string,
            },
        });

        if (updatedApplication.id) {
            return NextResponse.json({
                message: "Başvuru başarıyla güncellendi!",
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message: "Başvuru güncellenemedi!",
                status: 400,
                ok: false,
            });
        }
    } catch (error) {
        return NextResponse.json({ message: error, status: 500, ok: false });
    }
});
