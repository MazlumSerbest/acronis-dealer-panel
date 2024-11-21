import { NextResponse } from "next/server";
import prisma from "@/utils/db";
import getToken from "@/lib/getToken";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { set } from "date-fns";

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
        const params = new URLSearchParams({
            lod: req.nextUrl.searchParams.get("lod") || "basic",
            uuids: req.nextUrl.searchParams.get("uuids"),
        });
        const res = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/tenants?${params}`,
            {
                method: "GET",
                headers: headers,
            },
        );

        const tenants = (await res.json()) || [];

        if (res.ok) return await NextResponse.json(tenants);
        else return await NextResponse.json({ message: "Failed!" });
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

        const tenant: any = await req.json();
        const newTenant: Tenant = {
            kind: tenant.kind,
            language: "tr",
            name: tenant.name,
            parent_id: tenant.parentAcronisId,
            contact: tenant.contact,
            // ancestral_access: false
        };

        const checkLoginRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/users/check_login?username=${tenant.login}`,
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

        const tenantRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/tenants`,
            {
                method: "POST",
                body: JSON.stringify(newTenant),
                headers: headers,
            },
        );

        if (!tenantRes.ok)
            return NextResponse.json({
                message: tenantRes.statusText,
                status: tenantRes.status,
                ok: tenantRes.ok,
            });

        const createdTenant = await tenantRes.json();

        const newUser: TenantUser = {
            tenant_id: createdTenant.id,
            login: tenant.login,
            contact: tenant.contact as TenantContact,
            language: "tr",
        };

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

        if (tenant.kind === "partner") {
            const partner: Partner = {
                acronisId: createdTenant.id,
                parentAcronisId: createdTenant.parent_id,
                name: createdTenant?.name,
                licensed: tenant.licensed,
                applicationId: tenant.applicationId,
                createdBy: req.auth.user.email,
            };

            const newPartner = await prisma.partner.create({
                data: partner as any,
            });

            if (!newPartner.id)
                return NextResponse.json({
                    message:
                        "Partner açıldı fakat panele kaydedilemedi kaydedilemedi!",
                    status: 400,
                    ok: false,
                });
        } else {
            const customer: Customer = {
                acronisId: createdTenant.id,
                partnerAcronisId: tenant.partnerAcronisId,
                name: createdTenant?.name,
                createdBy: req.auth.user.email,
            };

            const newCustomer = await prisma.customer.create({
                data: customer as any,
            });

            if (!newCustomer.id)
                return NextResponse.json({
                    message:
                        "Müşteri açıldı fakat panele kaydedilemedi kaydedilemedi!",
                    status: 400,
                    ok: false,
                });
        }

        fetch(
            `${process.env.ACRONIS_API_V2_URL}/users/${createdUser.id}/send-activation-email`,
            {
                method: "POST",
                headers: headers,
            },
        );

        const applicationsRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/applications`,
            {
                headers: headers,
            },
        );

        const applications = await applicationsRes.json();

        const enableBackupRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/applications/${
                applications.items.find((app: any) => app.type == "backup").id
            }/bindings/tenants/${createdTenant.id}`,
            {
                method: "POST",
                headers: headers,
            },
        );

        const enablePlatformRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/applications/${
                applications.items.find((app: any) => app.type == "platform").id
            }/bindings/tenants/${createdTenant.id}`,
            {
                method: "POST",
                headers: headers,
            },
        );

        const offeringItems = {
            offering_items: [
                {
                    name: "pg_base_storage",
                    application_id: "6e6d758d-8e74-3ae3-ac84-50eb0dff12eb",
                    edition: "pck_per_gigabyte",
                    usage_name: "storage",
                    status: 1,
                    locked: false,
                    type: "infra",
                    infra_id: "d46a4b2a-2631-4f76-84cd-07ce3aed3dde",
                    measurement_unit: "bytes",
                },
                {
                    name: "pg_base_workstations",
                    application_id: "6e6d758d-8e74-3ae3-ac84-50eb0dff12eb",
                    edition: "pck_per_gigabyte",
                    usage_name: "workstations",
                    status: 1,
                    locked: false,
                    type: "count",
                    infra_id: null,
                    measurement_unit: "quantity",
                },
                {
                    name: "pg_base_servers",
                    application_id: "6e6d758d-8e74-3ae3-ac84-50eb0dff12eb",
                    edition: "pck_per_gigabyte",
                    usage_name: "servers",
                    status: 1,
                    locked: false,
                    type: "count",
                    infra_id: null,
                    measurement_unit: "quantity",
                },
                {
                    name: "pg_base_vms",
                    application_id: "6e6d758d-8e74-3ae3-ac84-50eb0dff12eb",
                    edition: "pck_per_gigabyte",
                    usage_name: "vms",
                    status: 1,
                    locked: false,
                    type: "count",
                    infra_id: null,
                    measurement_unit: "quantity",
                },
            ],
        };

        const enableOfferingItemsRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/tenants/${createdTenant.id}/offering_items`,
            {
                method: "PUT",
                headers: headers,
                body: JSON.stringify(offeringItems),
            },
        );

        let setQuotaRes;
        if (tenant.kind == "customer") {
            const usages = {
                offering_items: [
                    {
                        name: "pg_base_storage",
                        application_id: "6e6d758d-8e74-3ae3-ac84-50eb0dff12eb",
                        edition: "pck_per_gigabyte",
                        usage_name: "storage",
                        status: 1,
                        locked: false,
                        type: "infra",
                        infra_id: "d46a4b2a-2631-4f76-84cd-07ce3aed3dde",
                        measurement_unit: "bytes",
                        quota: {
                            version: 0,
                            overage: 0,
                            value: 0,
                        },
                    },
                ],
            };

            setQuotaRes = await fetch(
                `${process.env.ACRONIS_API_V2_URL}/tenants/${createdTenant.id}/offering_items`,
                {
                    method: "PUT",
                    headers: headers,
                    body: JSON.stringify(usages),
                },
            );
        }

        let roles;
        if (tenant.kind === "partner") {
            roles = {
                items: [
                    {
                        id: "00000000-0000-0000-0000-000000000000",
                        issuer_id: "00000000-0000-0000-0000-000000000000",
                        version: 0,
                        trustee_type: "user",
                        tenant_id: createdTenant.id,
                        trustee_id: createdUser.id,
                        role_id: "accounts_ro_admin",
                    },
                    {
                        id: "00000000-0000-0000-0000-000000000000",
                        issuer_id: "00000000-0000-0000-0000-000000000000",
                        version: 0,
                        trustee_type: "user",
                        tenant_id: createdTenant.id,
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
                        tenant_id: createdTenant.id,
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

        // Önemsiz bir hata olursa bile işlemlere devam edilecek
        if (!enableBackupRes.ok || !enablePlatformRes.ok)
            return NextResponse.json({
                message: "Failed to enable applications!",
                status: 200,
                ok: false,
            });
        if (!enableOfferingItemsRes.ok)
            return NextResponse.json({
                message: "Failed to enable offering items!",
                status: 200,
                ok: false,
            });
        if (!enableRolesRes.ok)
            return NextResponse.json({
                message: "Failed to enable roles!",
                status: 200,
                ok: false,
            });

        if (tenant.kind === "partner") {
            return NextResponse.json({
                message: "Partner başarıyla kaydedildi!",
                status: 200,
                ok: true,
            });
        } else {
            if (!setQuotaRes?.ok) {
                return NextResponse.json({
                    message: "Failed to set quota!",
                    status: 200,
                    ok: false,
                });
            }

            return NextResponse.json({
                message: "Müşteri başarıyla kaydedildi!",
                status: 200,
                ok: true,
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
