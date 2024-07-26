import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/utils/db";

export const GET = auth(async (req: any) => {
    try {
        if (!req.auth)
            return NextResponse.json({
                message: "Authorization Needed!",
                status: 401,
                ok: false,
            });

        const data = await prisma.user.findMany({
            select: {
                id: true,
                active: true,
                name: true,
                email: true,
                emailVerified: true,
                role: true,
                partnerId: true,
                acronisTenantId: true,
                createdBy: true,
                createdAt: true,
                updatedBy: true,
                updatedAt: true,
                partner: {
                    select: {
                        acronisId: true,
                        application: {
                            select: {
                                name: true,
                                email: true,
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
    } catch (error) {
        return NextResponse.json({ message: error, status: 500, ok: false });
    }
});

export const POST = auth(async (req: any) => {
    try {
        if (!req.auth)
            return NextResponse.json({
                message: "Authorization Needed!",
                status: 401,
                ok: false,
            });

        const user = await req.json();
        user.createdBy = req.auth.user.email;

        const checkEmail = await prisma.user.findUnique({
            where: {
                email: user.email,
            },
            select: {
                email: true,
            },
        });
        if (checkEmail)
            return NextResponse.json({
                message: "Bu e-posta önceden kullanılmıştır!",
                status: 400,
                ok: false,
            });

        const newUser = await prisma.user.create({
            data: user,
        });
        if (newUser.id) {
            return NextResponse.json({
                message: "Kullanıcı başarıyla kaydedildi!",
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message: "Kullanıcı kaydedilemedi!",
                status: 400,
                ok: false,
            });
        }
    } catch (error) {
        return NextResponse.json({ message: error, status: 500, ok: false });
    }
});
