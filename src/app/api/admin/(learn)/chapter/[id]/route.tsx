import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/utils/db";
import { getTranslations } from "next-intl/server";

export const GET = auth(async (req: any, { params }: any) => {
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

        const data = await prisma.chapter.findUnique({
            where: {
                id: params?.id as string,
            },
            include: {
                lessons: true,
                course: {
                    select: {
                        id: true,
                        name: true,
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

        const chapter: any = await req.json();
        chapter.updatedAt = new Date().toISOString();
        chapter.updatedBy = req.auth.user.email;

        const updatedChapter = await prisma.chapter.update({
            data: chapter,
            where: {
                id: params?.id as string,
            },
        });

        if (updatedChapter.id) {
            return NextResponse.json({
                message: "Bölüm başarıyla güncellendi!",
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message: "Bölüm güncellenemedi!",
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

        const deletedChapter = await prisma.chapter.delete({
            where: {
                id: params?.id as string,
            },
        });

        if (deletedChapter.id) {
            return NextResponse.json({
                message: "Bölüm başarıyla silindi!",
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message: "Bölüm silinirken hata oluştu!",
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
