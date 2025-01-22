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

        const data = await prisma.user.findUnique({
            where: {
                email: params?.id as string,
                deleted: false,
            },
            select: {
                id: true,
                name: true,
                email: true,
                emailVerified: true,
                active: true,
                partnerAcronisId: true,
                acronisTenantId: true,
                role: true,
                createdBy: true,
                createdAt: true,
                updatedBy: true,
                updatedAt: true,
                partner: {
                    select: {
                        name: true,
                        acronisId: true,
                        licensed: true,
                        // application: {
                        //     select: {
                        //         name: true,
                        //         email: true,
                        //     },
                        // },
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

        const user: any = await req.json();
        user.updatedAt = new Date().toISOString();
        user.updatedBy = req.auth.user.email;

        const updatedUser = await prisma.user.update({
            data: user,
            where: {
                id: params?.id as string,
            },
        });

        if (updatedUser.id) {
            return NextResponse.json({
                message: "Kullanıcı başarıyla güncellendi!",
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message: "Kullanıcı güncellenemedi!",
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
