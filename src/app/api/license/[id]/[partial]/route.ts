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

        if (!req.auth)
            return NextResponse.json({
                message: tm("authorizationNeeded"),
                status: 401,
                ok: false,
            });

        const license: any = {};
        license.partial = params?.partial == "true" ? true : false;
        license.updatedAt = new Date().toISOString();
        license.updatedBy = req.auth.user.email;

        const updatedLicense = await prisma.license.update({
            data: license,
            where: {
                id: params?.id as string,
            },
        });

        if (updatedLicense.id) {
            return NextResponse.json({
                message: "Lisans güncellendi!",
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message: "Lisans güncellenemedi!",
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
