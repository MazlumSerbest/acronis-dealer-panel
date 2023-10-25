import { NextResponse } from "next/server";
import getToken from "@/lib/getToken";

export async function GET(
    request: Request,
    { params }: { params: { tenantId: string } },
) {
    try {
        const tenantId = params.tenantId;
        const token = await getToken();

        if (token) {
            console.log(token);
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
                        const tenantInfo: { mfa?: object; pricing?: object; branding?: object; } = {
                            mfa: await mfaRes.json(),
                            pricing: await pricingRes.json(),
                            branding: await brandingRes.json(),
                        };

                        return await NextResponse.json({ tenantInfo });
                    } else
                        return await NextResponse.json({ message: "Failed!" });
                } else return await NextResponse.json({ message: "Failed!" });
            } else return await NextResponse.json({ message: "Failed!" });
        } else return NextResponse.json({ message: "Authentication failed!" });
    } catch (error) {
        return NextResponse.json({ message: error });
    }
}
