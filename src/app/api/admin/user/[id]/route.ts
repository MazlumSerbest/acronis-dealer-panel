import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/utils/db";
import { getTranslations } from "next-intl/server";

export const PUT = auth(async (req: any, { params }: any) => {
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

        const user: any = await req.json();
        user.updatedAt = new Date().toISOString();
        user.updatedBy = req.auth.user.email;
        user.partnerAcronisId = user.partnerAcronisId || null;
        user.acronisTenantId = user.acronisTenantId || null;

        const checkEmail = await prisma.user.findUnique({
            where: {
                email: user.email,
            },
            select: {
                id: true,
                email: true,
            },
        });

        if (checkEmail && checkEmail?.id != user.id)
            return NextResponse.json({
                message: "Bu e-posta önceden kullanılmıştır!",
                status: 400,
                ok: false,
            });

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

export const DELETE = auth(async (req: any, { params }: any) => {
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

        const deletedUser = await prisma.user.delete({
            where: {
                id: params?.id as string,
            },
        });

        if (deletedUser.id) {
            return NextResponse.json({
                message: "Kullanıcı başarıyla silindi!",
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message: "Kullanıcı silinemedi!",
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
