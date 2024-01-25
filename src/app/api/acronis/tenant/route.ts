import { NextResponse } from "next/server";
// import getToken from "@/lib/getToken";

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

export async function GET() {
    return await NextResponse.json({ data: [{ id: "1", name: "test" }] });
}

// export async function POST() {}

// export async function DELETE() {}

// export async function PUT() {}
