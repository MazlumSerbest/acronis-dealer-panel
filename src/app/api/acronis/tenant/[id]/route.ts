import { NextResponse } from "next/server";
import getToken from "@/lib/getToken";

export async function GET(
    request: Request,
    { params }: { params: { id: string } },
) {
    try {
        const tenantId = params.id;
        const token = await getToken();

        if (token) {
            const headers = {
                Authorization: `Bearer ${token}`,
            };
            const res = await fetch(
                `${process.env.ACRONIS_API_V2_URL}/tenants/${tenantId}`,
                {
                    method: "GET",
                    headers: headers,
                },
            );

            if (res.ok) {
                const tenant = await res.json() || [];
                return await NextResponse.json({ tenant });
            } else return await NextResponse.json({ message: "Failed!" });
        } else return NextResponse.json({ message: "Authentication failed!" });
    } catch (error) {
        return NextResponse.json({ message: error });
    }
}
