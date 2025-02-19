import { NextResponse } from "next/server";
import getToken from "@/lib/getToken";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";

export const GET = auth(async (req: any, { params }) => {
    try {
        const tm = await getTranslations({
            locale: "en",
            namespace: "Messages",
        });

        if (!req.auth)
            return NextResponse.json({
                message: tm("authorizationNeeded"),
                status: 401,
                ok: false,
            });

        const token = await getToken();

        if (!token)
            return NextResponse.json({
                message: "Authentication failed!",
                status: 401,
                ok: false,
            });

        const headers = {
            Authorization: `Bearer ${token}`,
        };
        const tenantId = req.nextUrl.searchParams.get("tenantId");

        const userIdsRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/tenants/${tenantId}/users`,
            {
                method: "GET",
                headers: headers,
            },
        );

        const useIds = (await userIdsRes.json()) || [];

        const params = new URLSearchParams({
            lod: req.nextUrl.searchParams.get("lod") || "full",
            uuids: useIds.items.map((id: string) => id).join(","),
            with_access_policies:
                req.nextUrl.searchParams.get("withAccessPolicies") || "false",
        });
        const res = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/users?${params}`,
            {
                method: "GET",
                headers: headers,
            },
        );

        const users = (await res.json()) || [];

        if (res.ok) return NextResponse.json(users);
        else
            return NextResponse.json({
                message: "Users not found!",
                status: 404,
                ok: false,
            });
    } catch (error: any) {
        return NextResponse.json({
            message: error?.message,
            status: 500,
            ok: false,
        });
    }
});

export const POST = auth(async (req: any, { params }) => {
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

        const user: any = await req.json();

        const newUser: TenantUser = {
            tenant_id: user.tenant_id,
            login: user.login,
            contact: user.contact as TenantContact,
            language: "tr",
            notifications: user.notifications,
        };

        const checkLoginRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/users/check_login?username=${newUser.login}`,
            {
                headers: headers,
            },
        );

        if (!checkLoginRes.ok)
            return NextResponse.json({
                message: checkLoginRes.statusText,
                status: checkLoginRes.status,
                ok: checkLoginRes.ok,
            });

        const userRes = await fetch(`${process.env.ACRONIS_API_V2_URL}/users`, {
            method: "POST",
            body: JSON.stringify(newUser),
            headers: headers,
        });

        const createdUser = await userRes.json();

        if (!userRes.ok)
            return NextResponse.json({
                message: userRes.statusText,
                status: userRes.status,
                ok: userRes.ok,
            });

        fetch(
            `${process.env.ACRONIS_API_V2_URL}/users/${createdUser.id}/send-activation-email`,
            {
                method: "POST",
                headers: headers,
            },
        );

        let roles;
        if (user.kind === "partner") {
            roles = {
                items: [
                    {
                        id: "00000000-0000-0000-0000-000000000000",
                        issuer_id: "00000000-0000-0000-0000-000000000000",
                        version: 0,
                        trustee_type: "user",
                        tenant_id: newUser.tenant_id,
                        trustee_id: createdUser.id,
                        role_id: "accounts_ro_admin",
                    },
                    {
                        id: "00000000-0000-0000-0000-000000000000",
                        issuer_id: "00000000-0000-0000-0000-000000000000",
                        version: 0,
                        trustee_type: "user",
                        tenant_id: newUser.tenant_id,
                        trustee_id: createdUser.id,
                        role_id: "protection_ro_admin",
                        resource_namespace: "backup",
                    },
                ],
            };
        } else {
            roles = {
                items: [
                    {
                        id: "00000000-0000-0000-0000-000000000000",
                        issuer_id: "00000000-0000-0000-0000-000000000000",
                        role_id: "company_admin",
                        tenant_id: newUser.tenant_id,
                        trustee_id: createdUser.id,
                        trustee_type: "user",
                        version: 0,
                    },
                ],
            };
        }

        const enableRolesRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/users/${createdUser.id}/access_policies`,
            {
                method: "PUT",
                headers: headers,
                body: JSON.stringify(roles),
            },
        );

        if (!enableRolesRes.ok)
            return NextResponse.json({
                message: "Failed to enable roles!",
                status: 200,
                ok: false,
            });

        return NextResponse.json({
            message: "Kullanıcı başarıyla kaydedildi!",
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
