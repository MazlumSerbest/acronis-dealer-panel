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
            const userRes = await fetch(
                `${process.env.ACRONIS_API_V2_URL}/tenants/${tenantId}/users`,
                {
                    method: "GET",
                    headers: headers,
                },
            );

            if (userRes.ok) {
                const userIds = await userRes.json();
                if(!userIds.items.length) return await NextResponse.json({ users: { items: [] } })

                const params = new URLSearchParams({
                    uuids: userIds.items.join(),
                    // lod: "basic",
                });
                const res = await fetch(
                    `${process.env.ACRONIS_API_V2_URL}/users?${params}`,
                    {
                        method: "GET",
                        headers: headers,
                    },
                );

                if (res.ok) {
                    const users = await res.json();
                    return await NextResponse.json({ users });
                } else return await NextResponse.json({ message: "Failed!" });
            } else return await NextResponse.json({ message: "Failed" });
        } else return NextResponse.json({ message: "Authentication failed!" });
    } catch (error) {
        return NextResponse.json({ message: error });
    }
}
