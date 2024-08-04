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
        const authorization = `Bearer ${token}`;
        const tenant = {
            kind: "customer",
            language: "tr",
            name: client.name,
            parent_id: client.parent_id,
            contact: client.contact,
        };

        const tenantRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/tenants`,
            {
                method: "POST",
                body: JSON.stringify(tenant),
                headers: {
                    Authorization: authorization,
                    "Content-Type": "application/json",
                },
            },
        );

        if (tenantRes.ok) {
            const tenant = await tenantRes.json();

            const pricingRes = await fetch(
                `${process.env.ACRONIS_API_V2_URL}/tenants/${tenant.id}/pricing`,
                {
                    headers: {
                        Authorization: authorization,
                    },
                },
            );

            const pricing = await pricingRes.json();
            pricing.mode = "production";

            const productionRes = await fetch(
                `${process.env.ACRONIS_API_V2_URL}/tenants/${tenant.id}/pricing`,
                {
                    method: "PUT",
                    body: JSON.stringify(pricing),
                    headers: {
                        Authorization: authorization,
                        "Content-Type": "application/json",
                    },
                },
            );

            if (productionRes.ok) {
                const applicationsRes = await fetch(
                    `${process.env.ACRONIS_API_V2_URL}/applications`,
                    {
                        headers: {
                            Authorization: authorization,
                        },
                    },
                );

                const applications = await applicationsRes.json();

                const enableBackupRes = await fetch(
                    `${process.env.ACRONIS_API_V2_URL}/applications/${
                        applications.items.find((app: any) => app.type == "backup").id
                    }/bindings/tenants/${tenant.id}`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: authorization,
                        },
                    },
                );

                const enablePlatformRes = await fetch(
                    `${process.env.ACRONIS_API_V2_URL}/applications/${
                        applications.items.find((app: any) => app.type == "platform")
                            .id
                    }/bindings/tenants/${tenant.id}`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: authorization,
                        },
                    },
                );

                if (enableBackupRes.ok && enablePlatformRes.ok) {
                    const user = {
                        tenant_id: tenant.id,
                        login: client.login,
                        contact: client.contact,
                    };

                    const userRes = await fetch(
                        `${process.env.ACRONIS_API_V2_URL}/users`,
                        {
                            method: "POST",
                            body: JSON.stringify(user),
                            headers: {
                                Authorization: authorization,
                                "Content-Type": "application/json",
                            },
                        },
                    );

                    if (userRes.ok) {
                        const user = await userRes.json();

                        const sendActivationRes = await fetch(
                            `${process.env.ACRONIS_API_V2_URL}/users/${user.id}/send-activation-email`,
                            {
                                method: "POST",
                                headers: {
                                    Authorization: authorization,
                                    "Content-Type": "application/json",
                                },
                            },
                        );

                        if (sendActivationRes.ok)
                            return NextResponse.json({
                                message: "Tenant Created!",
                                status: 200,
                                ok: true,
                            });
                        else
                            return NextResponse.json({
                                message: sendActivationRes.statusText,
                                status: sendActivationRes.status,
                                ok: sendActivationRes.ok,
                            });
                    } else
                        return NextResponse.json({
                            message: userRes.statusText,
                            status: userRes.status,
                            ok: userRes.ok,
                        });
                } else
                    return NextResponse.json({
                        message: "Failed to enable applications!",
                        status: 500,
                        ok: false,
                    });
            } else
                return NextResponse.json({
                    message: productionRes.statusText,
                    status: productionRes.status,
                    ok: productionRes.ok,
                });
        } else
            return NextResponse.json({
                message: tenantRes.statusText,
                status: tenantRes.status,
                ok: tenantRes.ok,
            });
        // return NextResponse.json({
        //     message: "Tenant Created!",
        //     status: res.status,
        //     ok: res.ok,
        // });
    } catch (error: any) {
        return NextResponse.json({
            message: error?.message,
            status: 500,
            ok: false,
        });
    }
});
