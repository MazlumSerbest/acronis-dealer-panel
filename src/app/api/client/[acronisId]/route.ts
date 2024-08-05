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

        const data = await prisma.client.findUnique({
            where: {
                acronisId: params?.acronisId as string,
            },
            include: {
                partner: {
                    select: {
                        id: true,
                        name: true,
                        users: {
                            select: {
                                id: true,
                                email: true,
                            },
                        },
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

        const client: any = await req.json();
        client.updatedAt = new Date().toISOString();
        client.updatedBy = req.auth.user.email;

        const updatedClient = await prisma.client.update({
            data: client,
            where: {
                acronisId: params?.acronisId as string,
            },
        });

        if (updatedClient.id) {
            return NextResponse.json({
                message: "Müşteri başarıyla güncellendi!",
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message: "Müşteri güncellenemedi!",
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
