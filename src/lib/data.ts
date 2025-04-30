export async function getPartners(
    parentAcronisId?: string,
    forListBox?: boolean,
    licensed?: boolean,
) {
    let partners: Partner[];
    const res = await fetch(
        !parentAcronisId
            ? `/api/partner`
            : `/api/partner?parentAcronisId=${parentAcronisId}`,
    );
    const response = await res.json();

    partners = response?.filter((p: Partner) => p.active);

    if (licensed) {
        partners = partners?.filter((p: Partner) => p.licensed);
    }

    if (forListBox) {
        return partners?.map((p: Partner) => ({
            id: p.acronisId,
            name: p?.name,
        }));
    }
    return partners;
}

export async function getCustomers(
    partnerAcronisId?: string,
    forListBox?: boolean,
) {
    if (!partnerAcronisId) return [];

    const res = await fetch(
        `/api/customer?partnerAcronisId=${partnerAcronisId}`,
    );
    const customers = await res.json();

    // const uuids = await customers.map((c: Customer) => c.acronisId).join(",");
    // const tenantRes = await fetch(
    //     `/api/acronis/tenants?lod=basic&uuids=${uuids}`,
    // );
    // const tenants = await tenantRes.json();

    if (forListBox)
        return customers
            ?.filter((c: Customer) => c.active)
            ?.map((c: Customer) => ({
                id: c.acronisId,
                name: c.name,
            }));
    return customers;
}

export async function getProducts(forListBox?: boolean) {
    const res = await fetch("/api/admin/product");
    const products = await res.json();

    if (forListBox)
        return products
            ?.filter((p: Product) => p.active)
            ?.map((p: Product) => ({
                id: p.id,
                name: p?.name,
            }));
    return products;
}
