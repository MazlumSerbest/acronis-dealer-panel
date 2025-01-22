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

        const data = await prisma.course.findMany({
            orderBy: {
                createdAt: "asc",
            },
            select: {
                id: true,
                category: true,
                name: true,
                shortDescription: true,
                description: true,
                duration: true,
                level: true,
                image: true,
                active: true,
                chapters: {
                    where: {
                        active: true,
                    },
                    orderBy: {
                        order: "asc",
                    },
                    select: {
                        id: true,
                        name: true,
                        order: true,
                        lessons: {
                            where: {
                                active: true,
                            },
                            orderBy: {
                                order: "asc",
                            },
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                order: true,
                                link: true,
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

export const POST = auth(async (req: any) => {
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

        const course = await req.json();
        course.createdBy = req.auth.user.email;

        const newCourse = await prisma.course.create({
            data: course,
        });
        if (newCourse.id) {
            return NextResponse.json({
                message: "Kurs başarıyla kaydedildi!",
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message: "Kurs kaydedilemedi!",
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
