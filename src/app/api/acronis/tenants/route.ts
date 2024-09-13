import { NextResponse } from "next/server";
import prisma from "@/utils/db";
import getToken from "@/lib/getToken";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";

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

        const tenant: any = await req.json();
        const authorization = `Bearer ${token}`;
        const newTenant = {
            kind: tenant.kind,
            language: "tr",
            name: tenant.name,
            parent_id: tenant.parent_id,
            contact: tenant.contact,
        };

        const tenantRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/tenants`,
            {
                method: "POST",
                body: JSON.stringify(newTenant),
                headers: {
                    Authorization: authorization,
                    "Content-Type": "application/json",
                },
            },
        );

        if (!tenantRes.ok)
            return NextResponse.json({
                message: tenantRes.statusText,
                status: tenantRes.status,
                ok: tenantRes.ok,
            });

        const createdTenant = await tenantRes.json();

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
            }/bindings/tenants/${createdTenant.id}`,
            {
                method: "POST",
                headers: {
                    Authorization: authorization,
                },
            },
        );

        const enablePlatformRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/applications/${
                applications.items.find((app: any) => app.type == "platform").id
            }/bindings/tenants/${createdTenant.id}`,
            {
                method: "POST",
                headers: {
                    Authorization: authorization,
                },
            },
        );

        if (!enableBackupRes.ok || !enablePlatformRes.ok)
            return NextResponse.json({
                message: "Failed to enable applications!",
                status: 500,
                ok: false,
            });

        const user = {
            tenant_id: createdTenant.id,
            login: tenant.login,
            contact: tenant.contact,
        };

        const userRes = await fetch(`${process.env.ACRONIS_API_V2_URL}/users`, {
            method: "POST",
            body: JSON.stringify(user),
            headers: {
                Authorization: authorization,
                "Content-Type": "application/json",
            },
        });

        if (!userRes.ok)
            return NextResponse.json({
                message: userRes.statusText,
                status: userRes.status,
                ok: userRes.ok,
            });

        const newUser = await userRes.json();

        await fetch(
            `${process.env.ACRONIS_API_V2_URL}/users/${newUser.id}/send-activation-email`,
            {
                method: "POST",
                headers: {
                    Authorization: authorization,
                    "Content-Type": "application/json",
                },
            },
        );

        if (tenant.kind === "partner") {
            const partner: any = {
                acronisId: createdTenant.id,
                dealerAcronisId: tenant.parent_id,
                name: tenant?.name,
                email: tenant?.contact.email,
                // mobile: tenant?.mobile,
                applicationId: tenant.applicationId,
                createdBy: req.auth.user.email,
            };

            const newPartner = await prisma.partner.create({
                data: partner,
            });

            if (newPartner.id)
                return NextResponse.json({
                    message: "Partner başarıyla kaydedildi!",
                    status: 200,
                    ok: true,
                });
            else
                return NextResponse.json({
                    message: "Partner kaydedilemedi!",
                    status: 400,
                    ok: false,
                });
        } else {
            const customer = {
                acronisId: createdTenant.id,
                partnerId: tenant.partnerId,
                createdBy: req.auth.user.email,
            };

            const newCustomer = await prisma.customer.create({
                data: customer,
            });

            if (newCustomer.id)
                return NextResponse.json({
                    message: "Müşteri başarıyla kaydedildi!",
                    status: 200,
                    ok: true,
                });
            else
                return NextResponse.json({
                    message: "Müşteri kaydedilemedi!",
                    status: 400,
                    ok: false,
                });
        }
    } catch (error: any) {
        return NextResponse.json({
            message: error?.message,
            status: 500,
            ok: false,
        });
    }
});
