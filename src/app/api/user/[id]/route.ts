import { NextResponse } from "next/server";
import prisma from "@/utils/db";
import { auth } from "@/auth";

export const GET = auth(async (req: any, { params }) => {
    try {
        if (!req.auth)
            return NextResponse.json({
                message: "authorizationNeeded",
                status: 401,
                ok: false,
            });

        const data = await prisma.user.findUnique({
            where: {
                email: params?.id as string,
            },
        });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ message: error, status: 500, ok: false });
    }
});

export const PUT = auth(async (req: any, { params }) => {
    try {
        if (!req.auth)
            return NextResponse.json({
                message: "authorizationNeeded",
                status: 401,
                ok: false,
            });

        const user: User = await req.json();
        user.updatedAt = new Date().toISOString();
        user.updatedBy = req.auth.user.email;

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
    } catch (error) {
        return NextResponse.json({ message: error, status: 500, ok: false });
    }
});

export const DELETE = auth(async (req: any, { params }) => {
    try {
        if (!req.auth)
            return NextResponse.json({
                message: "authorizationNeeded",
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
    } catch (error) {
        return NextResponse.json({ message: error, status: 500, ok: false });
    }
});
