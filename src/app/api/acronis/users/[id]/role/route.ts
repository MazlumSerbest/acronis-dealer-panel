import { NextResponse } from "next/server";
import { getAcronisToken } from "@/lib/getToken";
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

        const token = await getAcronisToken();

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

        let data: any = await req.json();

        const roles = {
            items: [
                {
                    id: "00000000-0000-0000-0000-000000000000",
                    issuer_id: "00000000-0000-0000-0000-000000000000",
                    version: 0,
                    trustee_type: "user",
                    tenant_id: data.tenant_id,
                    trustee_id: params?.id,
                    role_id: "accounts_ro_admin",
                },
                {
                    id: "00000000-0000-0000-0000-000000000000",
                    issuer_id: "00000000-0000-0000-0000-000000000000",
                    version: 0,
                    trustee_type: "user",
                    tenant_id: data.tenant_id,
                    trustee_id: params?.id,
                    role_id: "protection_ro_admin",
                    resource_namespace: "backup",
                },
            ],
        };

        const updateRolesRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/users/${params?.id}/access_policies`,
            {
                method: "PUT",
                headers: headers,
                body: JSON.stringify(roles),
            },
        );

        if (!updateRolesRes.ok)
            return NextResponse.json({
                message: updateRolesRes.statusText,
                status: updateRolesRes.status,
                ok: updateRolesRes.ok,
            });

        return NextResponse.json({
            message: "Kullanıcı rolleri güncellendi!",
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
