import { NextResponse } from "next/server";
import getToken from "@/lib/getToken";

export async function GET(
    request: Request,
    { params }: { params: { id: string } },
) {
    try {
        const alertId = params.id;
        const token = await getToken();
        const headers = {
            Authorization: `Bearer ${token}`,
        };
        if (token) {
            const res = await fetch(
                `${process.env.ACRONIS_ALERT_API_URL}/alerts/${alertId}`,
                {
                    method: "GET",
                    headers: headers,
                },
            );

            if (res.ok) {
                const alert = await res.json();
                return await NextResponse.json({ alert });
            } else return await NextResponse.json({ message: "Failed!" });
        } else return NextResponse.json({ message: "Authentication failed!" });
    } catch (error) {
        return NextResponse.json({ message: error });
    }
}
