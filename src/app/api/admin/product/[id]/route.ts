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

        if (req.auth.user.role !== "admin")
            return NextResponse.json({
                message: tm("authorizationNeeded"),
                status: 401,
                ok: false,
            });

        const data = await prisma.product.findUnique({
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
            where: {
                id: params?.id as string,
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

        const product: any = await req.json();
        product.updatedAt = new Date().toISOString();
        product.updatedBy = req.auth.user.email;

        const checkCode = await prisma.product.findUnique({
            where: {
                code: product.code,
            },
            select: {
                id: true,
                code: true,
            },
        });
        if (checkCode && checkCode?.id != product.id)
            return NextResponse.json({
                message: "Bu kod önceden kullanılmıştır!",
                status: 400,
                ok: false,
            });

        const updatedProduct = await prisma.product.update({
            data: product,
            where: {
                id: params?.id as string,
            },
        });

        if (updatedProduct.id) {
            return NextResponse.json({
                message: "Ürün başarıyla güncellendi!",
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message: "Ürün güncellenemedi!",
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
