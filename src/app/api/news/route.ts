import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/utils/db";
import { getTranslations } from "next-intl/server";
import path from "path";

const uploadDir = path.join(process.env.UPLOAD_DIR || "", "news");

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

        const status = req.nextUrl.searchParams.get("status");

        const data = await prisma.news.findMany({
            orderBy: {
                order: "asc",
            },
            where: {
                status: {
                    in: status ? status.split(",") : ["active", "draft", "passive"],
                },
            },
        });

        // Resim URL'sini tam sunucu yolu olarak güncelle
        const baseUrl = `${req.headers.get("origin") || ""}`;
        const enrichedData = data.map((item) => ({
            ...item,
            image: item.image ? `${baseUrl}${item.image}` : null, // Tam URL oluştur
        }));

        return NextResponse.json(enrichedData);
    } catch (error: any) {
        return NextResponse.json({
            message: error?.message,
            status: 500,
            ok: false,
        });
    }
});
