import { NextResponse } from "next/server";
import getToken from "@/lib/getToken";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";

export const GET = auth(async (req: any, { params }) => {
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

        const token = await getToken();

        if (!token)
            return NextResponse.json({
                message: "Authentication failed!",
                status: 401,
                ok: false,
            });

        const tenantId = params?.tenantId;
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

        if (mfaRes.ok) {
            const pricingRes = await fetch(
                `${process.env.ACRONIS_API_V2_URL}/tenants/${tenantId}/pricing`,
                {
                    method: "GET",
                    headers: headers,
                },
            );

            if (pricingRes.ok) {
                const brandingRes = await fetch(
                    `${process.env.ACRONIS_API_V2_URL}/tenants/${tenantId}/brand`,
                    {
                        method: "GET",
                        headers: headers,
                    },
                );
                if (brandingRes.ok) {
                    const tenantInfo: {
                        mfa?: object;
                        pricing?: object;
                        branding?: object;
                    } = {
                        mfa: await mfaRes.json(),
                        pricing: await pricingRes.json(),
                        branding: await brandingRes.json(),
                    };

                    return NextResponse.json({ tenantInfo });
                } else return NextResponse.json({ message: "Failed!" });
            } else return NextResponse.json({ message: "Failed!" });
        } else return NextResponse.json({ message: "Failed!" });
    } catch (error: any) {
        return NextResponse.json({
            message: error?.message,
            status: 500,
            ok: false,
        });
    }
});
