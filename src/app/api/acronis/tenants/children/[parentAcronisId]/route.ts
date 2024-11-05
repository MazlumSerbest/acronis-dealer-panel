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

        if (!req.auth) {
            return NextResponse.json({
                message: tm("authorizationNeeded"),
                status: 401,
                ok: false,
            });
        }

        const token = await getToken();

        if (!token) {
            return NextResponse.json({
                message: "Authentication failed!",
                status: 401, 
                ok: false,
            });
        }

        if (params?.parentAcronisId === "undefined") {
            return;
        }

        const headers = {
            Authorization: `Bearer ${token}`,
        };

        const searchParams = new URLSearchParams({
            parent_id: params?.parentAcronisId as string,
        });

        const res = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/tenants?${searchParams}`,
            {
                method: "GET",
                headers: headers,
                next: { revalidate: 0 },
            },
        );

        const children = (await res.json()) || [];

        const tenantIds = children?.items?.map((item: any) => item.id).join(",");
        
        if (!tenantIds) {
            return NextResponse.json([]);
        }

        const usagesSearchParams = new URLSearchParams({
            tenants: tenantIds,
            usage_names: "storage",
            editions: "pck_per_workload,pck_per_gigabyte",
        });

        const usagesRes = await fetch(
            `${process.env.ACRONIS_API_V2_URL}/tenants/usages?${usagesSearchParams}`,
            {
                method: "GET",
                headers: headers,
            },
        );

        const usages = (await usagesRes.json()) || [];

        const infraId = "d46a4b2a-2631-4f76-84cd-07ce3aed3dde";

        const newData = children?.items?.map((c: any) => {
            const itemUsage = usages?.items?.find(
                (u: any) => u.tenant === c.id
            )?.usages;

            const findUsage = (edition: string, name: string) => {
                return itemUsage?.find(
                    (u: any) =>
                        u.edition === edition &&
                        u.name === name &&
                        u.infra_id === infraId
                );
            };

            const perWorkloadUsage = findUsage("pck_per_workload", "pw_base_storage");
            const perGBUsage = findUsage("pck_per_gigabyte", "pg_base_storage");

            return {
                ...c,
                usages: {
                    perWorkload: {
                        value: perWorkloadUsage?.value,
                        quota: perWorkloadUsage?.offering_item ? perWorkloadUsage.offering_item.quota?.value : undefined,
                    },
                    perGB: {
                        value: perGBUsage?.value,
                        quota: perGBUsage?.offering_item ? perGBUsage.offering_item.quota?.value : undefined,
                    },
                },
            };
        });

        if (!res.ok) {
            return NextResponse.json({ message: "Failed!" });
        }

        return NextResponse.json(newData);

    } catch (error: any) {
        return NextResponse.json({
            message: error?.message,
            status: 500,
            ok: false,
        });
    }
});
