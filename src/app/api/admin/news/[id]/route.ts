import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/utils/db";
import { getTranslations } from "next-intl/server";
import fs from "fs/promises";
import path from "path";

const uploadDir = path.join(process.env.UPLOAD_DIR || "", "news");

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

        const formData = await req.formData();
        const title = formData.get("title");
        const imageFile = formData.get("image") as File;

        const news: any = {
            title: title,
            status: formData.get("status"),
            order: parseInt(formData.get("order")),
            content: formData.get("content"),
            updatedAt: new Date().toISOString(),
            updatedBy: req.auth.user.email,
        };

        if (imageFile?.name) {
            const fileType = imageFile.type.split("/")[1];

            await fs.mkdir(uploadDir, { recursive: true }); // Klasör yoksa oluştur

            const fileName = `${Date.now()}-${title}`;
            const filePath = path.join(uploadDir, fileName + "." + fileType);
            const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

            await fs.writeFile(filePath, imageBuffer); // Dosyayı yaz

            const imageUrl = `/uploads/news/${fileName}.${fileType}`;

            news.image = imageUrl;

            // delete old file
            const oldNews = await prisma.news.findUnique({
                where: {
                    id: params?.id as string,
                },
            });

            if (oldNews?.image) {
                const oldFilePath = path.join(
                    process.cwd(),
                    "public",
                    oldNews.image
                );
                await fs.unlink(oldFilePath);
            }
        }

        const updatedNews = await prisma.news.update({
            data: news,
            where: {
                id: params?.id as string,
            },
        });

        if (updatedNews.id) {
            return NextResponse.json({
                message: "Haber başarıyla güncellendi!",
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message: "Haber güncellenemedi!",
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

        const deletedNews = await prisma.news.delete({
            where: {
                id: params?.id as string,
            },
        });

        // delete old file
        if (deletedNews.image) {
            const oldFilePath = path.join(
                process.cwd(),
                "public",
                deletedNews.image
            );
            await fs.unlink(oldFilePath);
        }

        if (deletedNews.id) {
            return NextResponse.json({
                message: "Haber başarıyla silindi!",
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message: "Haber silinemedi!",
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
