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

        // const partnerAcronisId =
        //     req.nextUrl.searchParams.get("partnerAcronisId");

        const data = await prisma.customer.findMany({
            // where: {
            //     partnerAcronisId: partnerAcronisId,
            // },
            include: {
                partner: {
                    select: {
                        name: true,
                        licensed: true,
                        acronisId: true,
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
