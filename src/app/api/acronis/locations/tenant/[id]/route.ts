import { NextRequest, NextResponse } from "next/server";
import getToken from "@/lib/getToken";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const tenantId = params.id;
        const token = await getToken();

        if (!token)
            return NextResponse.json({ message: "Authentication failed!" });

        const headers = {
            Authorization: `Bearer ${token}`,
        };
        const locationRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/tenants/${tenantId}/locations`,
            {
                method: "GET",
                headers: headers,
            },
        );

        if (locationRes.ok) {
            const locationIds = await locationRes.json();
            if (!locationIds.locations.length)
                return await NextResponse.json({ locations: { items: [] } });

            const params = new URLSearchParams({
                uuids: locationIds.locations.join(),
                // lod: "basic",
            });
            const res = await fetch(
                `${process.env.ACRONIS_API_V2_URL}/locations?${params}`,
                {
                    method: "GET",
                    headers: headers,
                },
            );

            if (res.ok) {
                const locations = await res.json();
                return await NextResponse.json({ locations });
            } else return await NextResponse.json({ message: "Failed!" });
        } else return await NextResponse.json({ message: "Failed" });
    } catch (error) {
        return NextResponse.json({ message: error });
    }
}
