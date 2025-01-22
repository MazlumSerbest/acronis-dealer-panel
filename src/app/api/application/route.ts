import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { getTranslations } from "next-intl/server";

export async function POST(req: NextRequest) {
    try {
        const tm = await getTranslations({
            locale: "en",
            namespace: "Messages",
        });

        const formData = await req.formData();
        const app = {
            companyType: formData.get("companyType") as string,
            parentAcronisId: formData.get("parentAcronisId") as string,
            name: formData.get("name") as string,
            taxNo: formData.get("taxNo") as string,
            taxOffice: formData.get("taxOffice") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            mobile: formData.get("mobile") as string,
            address: formData.get("address") as string,
            city: Number(formData.get("city")),
            district: formData.get("district") as string,
            postalCode: formData.get("postalCode") as string,
            applicationDate: new Date().toISOString(),
            createdBy: formData.get("email") as string,
        };

        const checkEmail = await prisma.application.findUnique({
            where: {
                email: app.email,
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

        const newApplication = await prisma.application.create({
            data: app,
        });

        if (newApplication.id) {
            return NextResponse.json({
                message: tm("Application.success"),
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message: tm("Application.error"),
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
}
