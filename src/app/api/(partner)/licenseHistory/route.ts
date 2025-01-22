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

        const partnerAcronisId =
            req.nextUrl.searchParams.get("partnerAcronisId");

        const data = await prisma.v_LicenseHistory.findMany({
            where: {
                OR: [
                    { partnerAcronisId: partnerAcronisId },
                    { previousPartnerAcronisId: partnerAcronisId },
                ],
            },
            orderBy: {
                createdAt: "desc",
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
