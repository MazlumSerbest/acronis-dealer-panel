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

export async function getProducts(forListBox?: boolean) {
    const res = await fetch("/api/admin/product");
    const products = await res.json();

    if (forListBox)
        return products.map((p: Product) => ({
            id: p.id,
            name: p?.name,
        }));
    return products;
}
