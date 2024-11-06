export async function getPartners(forListBox?: boolean) {
    const res = await fetch("/api/admin/partner");
    const partners = await res.json();

    if (forListBox)
        return partners
            .filter((p: Partner) => p.active)
            .map((p: Partner) => ({
                id: p.id,
                name: p?.name,
            }));
    return partners;
}

export async function getCustomers(partnerId?: string, forListBox?: boolean) {
    if (!partnerId) return [];

    const res = await fetch(`/api/customer?partnerId=${partnerId}`);
    const customers = await res.json();
    
    const uuids = await customers.map((c: Customer) => c.acronisId).join(",");
    const tenantRes = await fetch(
        `/api/acronis/tenants?lod=basic&uuids=${uuids}`,
    );
    const tenants = await tenantRes.json();

    if (forListBox)
        return customers
            .filter((c: Customer) => c.active)
            .map((c: Customer) => ({
                id: c.id,
                name: tenants.items?.find((t: any) => t.id === c.acronisId)
                    ?.name,
        }));
    return customers;
}

export async function getProducts(forListBox?: boolean) {
    const res = await fetch("/api/admin/product");
    const products = await res.json();

    if (forListBox)
        return products
            .filter((p: Product) => p.active)
            .map((p: Product) => ({
                id: p.id,
                name: p?.name,
        }));
    return products;
}
