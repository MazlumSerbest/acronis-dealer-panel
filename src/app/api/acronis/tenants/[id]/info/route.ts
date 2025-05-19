import { NextResponse } from "next/server";
import { getAcronisToken } from "@/lib/getToken";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";

export const GET = auth(async (req: any, { params }: any) => {
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

        const token = await getAcronisToken();

        if (!token)
            return NextResponse.json({
                message: "Authentication failed!",
                status: 401,
                ok: false,
            });

        const tenantId = params?.id;
        const headers = {
            Authorization: `Bearer ${token}`,
        };
        const mfaRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/tenants/${tenantId}/mfa/status`,
            {
                method: "GET",
                headers: headers,
            },
        );

        if (!mfaRes.ok)
            return NextResponse.json({
                message: "MFA status not found!",
                status: 404,
                ok: false,
            });

        const pricingRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/tenants/${tenantId}/pricing`,
            {
                method: "GET",
                headers: headers,
            },
        );

        if (!pricingRes.ok)
            return NextResponse.json({
                message: "Pricing information not found!",
                status: 404,
                ok: false,
            });

        const brandingRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/tenants/${tenantId}/brand`,
            {
                method: "GET",
                headers: headers,
            },
        );

        if (!brandingRes.ok)
            return NextResponse.json({
                message: "Branding information not found!",
                status: 404,
                ok: false,
            });

        const tenantInfo: {
            mfa?: object;
            pricing?: object;
            branding?: object;
        } = {
            mfa: await mfaRes.json(),
            pricing: await pricingRes.json(),
            branding: await brandingRes.json(),
        };

        return NextResponse.json(tenantInfo);
    } catch (error: any) {
        return NextResponse.json({
            message: error?.message,
            status: 500,
            ok: false,
        });
    }
});
