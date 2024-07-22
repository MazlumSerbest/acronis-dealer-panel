import { NextResponse } from "next/server";
import prisma from "@/utils/db";
import { auth } from "@/auth";

export const GET = auth(async (req: any, { params }) => {
    try {
        if (!req.auth)
            return NextResponse.json({
                message: "authorizationNeeded",
                status: 401,
                ok: false,
            });

        const data = await prisma.application.findUnique({
            where: {
                id: params?.id as string,
            },
            include: {
                partner: {
                    select: {
                        id: true,
                        acronisId: true,
                    },
                }
            }
        });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ message: error, status: 500, ok: false });
    }
});
