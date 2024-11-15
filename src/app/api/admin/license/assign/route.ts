import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/utils/db";
import { getTranslations } from "next-intl/server";

export const PUT = auth(async (req: any) => {
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

        const values = await req.json();

        const updatedLicenses = await prisma.license.updateMany({
            where: {
                id: {
                    in: values.ids,
                },
            },
            data: {
                partnerAcronisId: values.partnerAcronisId,
                assignedAt: new Date().toISOString(),
                updatedBy: req.auth.user.email,
                updatedAt: new Date().toISOString(),
            },
        });

        await prisma.licenseHistory.createMany({
            data: values.ids.map((id: string) => ({
                licenseId: id,
                partnerAcronisId: values.partnerAcronisId,
                action: "firstAssignment",
                createdBy: req.auth.user.email,
                createdAt: new Date().toISOString(),
            })),
        });

        if (updatedLicenses && updatedLicenses.count > 0) {
            return NextResponse.json({
                message: "Lisans(lar) başarıyla atandı!",
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message: "Lisans(lar) atanamadı!",
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
