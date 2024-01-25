import { NextResponse } from "next/server";

export async function GET() {
    return await NextResponse.json({ data: [{ id: "1", name: "test" }] });
}
