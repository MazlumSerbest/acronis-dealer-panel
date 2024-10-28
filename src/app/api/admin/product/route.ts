import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/utils/db";
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

        const data = await prisma.product.findMany({
            select: {
                id: true,
                code: true,
                name: true,
                model: true,
                active: true,
                createdBy: true,
                createdAt: true,
                updatedBy: true,
                updatedAt: true,
                quota: true,
                unit: true,
                edition: true
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

        const product = await req.json();
        product.createdBy = req.auth.user.email;

        const checkCode = await prisma.product.findUnique({
            where: {
                code: product.code,
            },
            select: {
                code: true,
            },
        });
        if (checkCode)
            return NextResponse.json({
                message: "Bu kod kullanılmıştır!",
                status: 400,
                ok: false,
            });

        const newProduct = await prisma.product.create({
            data: product,
        });
        if (newProduct.id) {
            return NextResponse.json({
                message: "Ürün başarıyla kaydedildi!",
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message: "Ürün kaydedilemedi!",
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
