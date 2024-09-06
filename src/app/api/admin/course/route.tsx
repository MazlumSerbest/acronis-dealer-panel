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

        const data = await prisma.course.findMany({
            where: {
                active: true,
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
                chapters: {
                    where: {
                        active: true,
                    },
                    orderBy: {
                        order: "desc",
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
                                order: "desc",
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
