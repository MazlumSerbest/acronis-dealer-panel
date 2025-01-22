import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/utils/db";
import { getTranslations } from "next-intl/server";

export const PUT = auth(async (req: any) => {
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

        const values = await req.json();
        const kind = req.nextUrl.searchParams.get("kind");
        const from = req.nextUrl.searchParams.get("from");
        let data;

        if (kind === "customer") {
            data = {
                customerAcronisId: values.customerAcronisId,
                activatedAt: new Date().toISOString(),
            };

            const modelCheck = await prisma.license.findFirst({
                where: {
                    customerAcronisId: values.customerAcronisId,
                },
                include: {
                    product: {
                        select: {
                            model: true,
                        },
                    },
                },
            });

            const keyCheck = await prisma.license.findFirst({
                where: {
                    id: values.ids[0],
                },
                include: {
                    product: {
                        select: {
                            model: true,
                        },
                    },
                },
            });

            if (
                modelCheck?.id &&
                keyCheck?.product.model !== modelCheck?.product.model
            ) {
                return NextResponse.json({
                    message: `Bu müşterinin ${modelCheck?.product.model} modelinde lisansı bulunduğundan, ${keyCheck?.product.model} modelinde lisans atayamazsınız!`,
                    status: 400,
                    ok: false,
                });
            }

            if (keyCheck?.key != values.key)
                return NextResponse.json({
                    message: "Hatalı lisans anahtarı!",
                    status: 400,
                    ok: false,
                });
        } else if (kind === "partner") {
            data = {
                partnerAcronisId: values.partnerAcronisId,
                assignedAt: new Date().toISOString(),
            };
        }

        const updatedLicenses = await prisma.license.updateMany({
            where: {
                id: {
                    in: values.ids,
                },
            },
            data: {
                ...data,
                updatedBy: req.auth.user.email,
                updatedAt: new Date().toISOString(),
            },
        });

        await prisma.licenseHistory.createMany({
            data: values.ids.map((id: string) => ({
                licenseId: id,
                previousPartnerAcronisId: kind === "customer" ? null : from,
                partnerAcronisId:
                    kind === "customer" ? from : values.partnerAcronisId,
                customerAcronisId:
                    kind === "customer" ? values.customerAcronisId : null,
                action: kind === "customer" ? "activation" : "assignment",
                createdBy: req.auth.user.email,
                createdAt: new Date().toISOString(),
            })),
        });

        if (updatedLicenses && updatedLicenses.count > 0) {
            return NextResponse.json({
                message:
                    kind === "customer"
                        ? "Lisans aktive edildi!"
                        : "Lisans(lar) başarıyla atandı!",
                status: 200,
                ok: true,
            });
        } else {
            return NextResponse.json({
                message:
                    kind === "customer"
                        ? "Lisans aktive edilemedi!"
                        : "Lisans(lar) atanamadı!",
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
