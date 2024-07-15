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
            const headers = {
                Authorization: `Bearer ${token}`,
            };
            const contactRes = await fetch(
                `${process.env.ACRONIS_API_V2_URL}/tenants/${tenantId}/contacts`,
                {
                    method: "GET",
                    headers: headers,
                },
            );

            if (contactRes.ok) {
                const contactIds = await contactRes.json();
                if(!contactIds.items.length) return await NextResponse.json({ contacts: { items: [] } })

                const params = new URLSearchParams({
                    uuids: contactIds.items.join(),
                    // lod: "basic",
                });
                const res = await fetch(
                    `${process.env.ACRONIS_API_V2_URL}/contacts?${params}`,
                    {
                        method: "GET",
                        headers: headers,
                    },
                );

                if (res.ok) {
                    const contacts = await res.json();
                    return await NextResponse.json({ contacts });
                } else return await NextResponse.json({ message: "Failed!" });
            } else return await NextResponse.json({ message: "Failed" });
        } else return NextResponse.json({ message: "Authentication failed!" });
    } catch (error) {
        return NextResponse.json({ message: error });
    }
}