import { NextResponse } from "next/server";
import getToken from "@/lib/getToken";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";

export const PUT = auth(async (req: any, { params }) => {
    try {
        if (!req.auth)
            return NextResponse.json({
                message: "Authorization Needed!",
                status: 401,
                ok: false,
            });

        const token = await getToken();

        if (!token)
            return NextResponse.json({
                message: "API Authentication failed!",
                status: 401,
                ok: false,
            });

        const authorization = `Bearer ${token}`;
        const headers = {
            Authorization: authorization,
            "Content-Type": "application/json",
        };

        const body = await req.json();
        const { name, edition, bytes } = body;

        const offeringItemsRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/tenants/${params?.id}/offering_items?edition=${edition}`,
            {
                method: "GET",
                headers: headers,
            },
        );

        if (!offeringItemsRes.ok)
            return NextResponse.json({
                message: "Kota bulunurken bir hata oluştu!",
                status: 500,
                ok: false,
            });

        const offeringItems = await offeringItemsRes.json();

        const offeringItem = offeringItems?.items?.find(
            (i: OfferingItem) => i.name === name,
        );

        const newOfferingItems = {
            offering_items: [
                {
                    name: offeringItem?.name,
                    application_id: offeringItem?.application_id,
                    edition: offeringItem?.edition,
                    status: 1,
                    type: offeringItem?.type,
                    infra_id: offeringItem?.infra_id,
                    measurement_unit: offeringItem?.measurement_unit,
                    quota: {
                        value: bytes,
                        version: offeringItem?.quota?.version,
                    },
                },
            ],
        };

        const updateOfferingItemsRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/tenants/${params?.id}/offering_items`,
            {
                method: "PUT",
                headers: headers,
                body: JSON.stringify(newOfferingItems),
            },
        );

        if (!updateOfferingItemsRes.ok)
            return NextResponse.json({
                message: "Kota güncellenirken bir hata oluştu!",
                status: 500,
                ok: false,
            });

        return NextResponse.json({
            message: "Kota başarıyla güncellendi!",
            status: 200,
            ok: true,
        });
    } catch (error: any) {
        return NextResponse.json({
            message: error?.message,
            status: 500,
            ok: false,
        });
    }
});
