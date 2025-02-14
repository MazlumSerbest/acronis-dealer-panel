import { NextResponse } from "next/server";
import getToken from "@/lib/getToken";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";

export const PUT = auth(async (req: any, { params }) => {
    try {
        const tm = await getTranslations({
            locale: "en",
            namespace: "Messages",
        });

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

        const authorization = `Bearer ${token}`;
        const headers = {
            Authorization: authorization,
            "Content-Type": "application/json",
        };

        let user: any = await req.json();

        const oldUserRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/users/${params?.id}`,
            {
                headers: headers,
            },
        );

        const oldUser = await oldUserRes.json();

        user.version = oldUser.version || 0;

        const updatedUserRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/users/${params?.id}`,
            {
                method: "PUT",
                body: JSON.stringify(user),
                headers: headers,
            },
        );

        if (!updatedUserRes.ok)
            return NextResponse.json({
                message: updatedUserRes.statusText,
                status: updatedUserRes.status,
                ok: updatedUserRes.ok,
            });

        return NextResponse.json({
            message: "Kullanıcı başarıyla güncellendi!",
            status: 200,
            ok: true,
        });
    } catch (error: any) {
        return NextResponse.json({
            message: error?.message,
            status: 500,
            ok: false,
        });
    }
});

export const DELETE = auth(async (req: any, { params }) => {
    try {
        const tm = await getTranslations({
            locale: "en",
            namespace: "Messages",
        });

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

        const authorization = `Bearer ${token}`;
        const headers = {
            Authorization: authorization,
            "Content-Type": "application/json",
        };
        const userRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/users/${params?.id}`,
            {
                headers: headers,
            },
        );

        const user = await userRes.json();

        const deletedUserRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/users/${params?.id}?version=${user.version}`,
            {
                method: "DELETE",
                headers: headers,
            },
        );

        if (!deletedUserRes.ok)
            return NextResponse.json({
                message: deletedUserRes.statusText,
                status: deletedUserRes.status,
                ok: deletedUserRes.ok,
            });

        return NextResponse.json({
            message: "Kullanıcı başarıyla silindi!",
            status: 200,
            ok: true,
        });
    } catch (error: any) {
        return NextResponse.json({
            message: error?.message,
            status: 500,
            ok: false,
        });
    }
});
