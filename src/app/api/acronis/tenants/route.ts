import { NextResponse } from "next/server";
import getToken from "@/lib/getToken";
import { auth } from "@/auth";

// export async function GET() {
//     try {
//         const token = await getToken();

//         if (token) {
//             const headers = {
//                 Authorization: `Bearer ${token}`,
//             };
//             const params = new URLSearchParams({
//                 lod: "basic",
//             });
//             const res = await fetch(
//                 `${process.env.ACRONIS_API_V2_URL}/tenants?${params}`,
//                 {
//                     method: "GET",
//                     headers: headers,
//                 },
//             );

//             if (res.ok) {
//                 const allTenants = await res.json();
//                 return await NextResponse.json({ allTenants });
//             } else return await NextResponse.json({ message: "Failed!" });
//         } else return NextResponse.json({ message: "Authentication failed!" });
//     } catch (error) {
//         return NextResponse.json({ message: error });
//     }
// }

export const POST = auth(async (req: any, { params }) => {
    try {
        if (!req.auth)
            return NextResponse.json({
                message: "Authorization Needed!",
                status: 401,
                ok: false,
            });

        const token = await getToken();

        if (!token)
            return NextResponse.json({
                message: "API Authentication failed!",
                status: 401,
                ok: false,
            });

        const client: any = await req.json();
        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };

        const res = await fetch(`${process.env.ACRONIS_API_V2_URL}/tenants`, {
            method: "POST",
            body: JSON.stringify(client),
            headers: headers,
        });

        if (res.ok)
            return NextResponse.json({
                message: "Tenant Created!",
                status: res.status,
                ok: res.ok,
            });
        else
            return NextResponse.json({
                message: res.statusText,
                status: res.status,
                ok: res.ok,
            });
    } catch (error: any) {
        return NextResponse.json({
            message: error?.message,
            status: 500,
            ok: false,
        });
    }
});
