import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/utils/db";
import { getTranslations } from "next-intl/server";

export const PUT = auth(async (req: any, { params }) => {
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

        const application: any = {};
        application.updatedAt = new Date().toISOString();
        application.updatedBy = req.auth.user.email;
        application.approvedAt = new Date().toISOString();
        application.approvedBy = req.auth.user.email;

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
    } catch (error: any) {
        return NextResponse.json({
            message: error?.message,
            status: 500,
            ok: false,
        });
    }
});
