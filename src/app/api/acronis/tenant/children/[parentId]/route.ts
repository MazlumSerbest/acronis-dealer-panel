import { NextResponse } from "next/server";
import getToken from "@/lib/getToken";

export async function GET(
    request: Request,
    { params }: { params: { parentId: string } },
) {
    try {
        const parentId = params.parentId;
        const token = await getToken();

        if (token) {
            const headers = {
                Authorization: `Bearer ${token}`,
            };
            const params = new URLSearchParams({
                parent_id: parentId,
                // lod: "basic",
            });
            const res = await fetch(
                `${process.env.ACRONIS_API_V2_URL}/tenants?${params}`,
                // `${process.env.ACRONIS_API_V2_URL}/tenants/${parentId}/children`,
                {
                    method: "GET",
                    headers: headers,
                    next: { revalidate: 0 },
                },
            );

            if (res.ok) {
                const children = await res.json() || [];
                return await NextResponse.json({ children });
            } else return await NextResponse.json({ message: "Failed!" });
        } else return NextResponse.json({ message: "Authentication failed!" });
    } catch (error) {
        return NextResponse.json({ message: error });
    }
}
