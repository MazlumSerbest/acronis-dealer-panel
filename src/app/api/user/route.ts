import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/utils/db";
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

        const partnerAcronisId =
            req.nextUrl.searchParams.get("partnerAcronisId");

        const data = await prisma.user.findMany({
            where: {
                partnerAcronisId: partnerAcronisId,
            },
            select: {
                id: true,
                active: true,
                name: true,
                email: true,
                emailVerified: true,
                partnerAcronisId: true,
                // createdBy: true,
                // createdAt: true,
                // updatedBy: true,
                // updatedAt: true,
                // partner: {
                //     select: {
                //         acronisId: true,
                //         name: true,
                //         licensed: true,
                //         application: {
                //             select: {
                //                 name: true,
                //                 email: true,
                //             },
                //         },
                //     },
                // },
                sessions: {
                    take: 1,
                    select: {
                        createdAt: true,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                },
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
