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

        const data = await prisma.course.findUnique({
            where: {
                id: params?.id as string,
            },
            include: {
                chapters: {
                    orderBy: {
                        order: "asc",
                    },
                    include: {
                        lessons: true,
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

        if (req.auth.user.role !== "admin")
            return NextResponse.json({
                message: tm("authorizationNeeded"),
                status: 401,
                ok: false,
            });

        const course: any = await req.json();
        course.updatedAt = new Date().toISOString();
        course.updatedBy = req.auth.user.email;

        const updatedCourse = await prisma.course.update({
            data: course,
            where: {
                id: params?.id as string,
            },
        });

        if (updatedCourse.id) {
            return NextResponse.json({
                message: "Kurs başarıyla güncellendi!",
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message: "Kurs güncellenemedi!",
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
