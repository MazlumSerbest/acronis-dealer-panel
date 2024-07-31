import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/utils/db";
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

        const status = req.nextUrl.searchParams.get("status");
        let where = {};

        switch (status) {
            case "waiting":
                where = {
                    approvedAt: null,
                    partner: { is: null },
                };
                break;
            case "approved":
                where = {
                    approvedAt: { not: null },
                    partner: { is: null },
                };
                break;
            case "resolved":
                where = {
                    approvedAt: { not: null },
                    partner: { isNot: null },
                };
                break;
            default:
                break;
        }

        const data = await prisma.application.findMany({
            where: where,
            include: {
                partner: {
                    select: {
                        id: true,
                        acronisId: true,
                        // name: true,
                        // email: true,
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

export async function POST(req: NextRequest) {
    try {
        const tm = await getTranslations({
            locale: "en",
            namespace: "Messages",
        });

        const formData = await req.formData();
        const app = {
            companyType: formData.get("companyType") as string,
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
    } catch (error) {
        return NextResponse.json({ message: error, status: 500, ok: false });
    }
}
