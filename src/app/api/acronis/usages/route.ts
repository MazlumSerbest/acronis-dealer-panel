import { NextRequest, NextResponse } from "next/server";
import getToken from "@/lib/getToken";

export async function GET(
    request: NextRequest,
) {
    try {
        const tenantIds = request.nextUrl.searchParams.get("tenantIds");
        const test = request.credentials
        const token = await getToken();

        if (token) {
            console.log(token);
            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const params = new URLSearchParams({
                tenants: tenantIds || "",
                // lod: "basic",
            });
            const res = await fetch(
                `${process.env.ACRONIS_API_V2_URL}/tenants/usages?${params}`,
                {
                    method: "GET",
                    headers: headers,
                },
            );

            if (res.ok) {
                const usages = await res.json();
                return await NextResponse.json({ usages });
            } else return await NextResponse.json({ message: "Failed!" });
        } else return NextResponse.json({ message: "Authentication failed!" });
    } catch (error) {
        return NextResponse.json({ message: error });
    }
}