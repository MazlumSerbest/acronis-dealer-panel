import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/utils/db";
import { getTranslations } from "next-intl/server";
import fs from "fs/promises";
import path from "path";

const uploadDir = path.join(process.env.UPLOAD_DIR || "", "news");

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

        const formData = await req.formData();
        const imageFile = formData.get("image") as File;
        const fileType = imageFile.type.split("/")[1];
        const title = formData.get("title");

        // upload image
        await fs.mkdir(uploadDir, { recursive: true }); // Klasör yoksa oluştur

        const fileName = `${Date.now()}-${title}`;
        const filePath = path.join(uploadDir, fileName + "." + fileType);
        const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

        await fs.writeFile(filePath, imageBuffer); // Dosyayı yaz

        const imageUrl = `/uploads/news/${fileName}.${fileType}`;

        const news = {
            title: title,
            content: formData.get("content"),
            order: parseInt(formData.get("order")),
            image: imageUrl,
            createdBy: req.auth.user.email,
        };

        const newNews = await prisma.news.create({
            data: news,
        });

        if (newNews.id) {
            return NextResponse.json({
                message: "Haber başarıyla kaydedildi!",
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message: "Haber kaydedilemedi!",
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
