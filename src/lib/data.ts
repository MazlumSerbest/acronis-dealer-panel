export async function getPartners(forListBox?: boolean) {
    const res = await fetch("/api/partner");
    const partners = await res.json();

    if (forListBox)
        return partners
            .filter((p: Partner) => p.active)
            .map((p: Partner) => ({
                id: p.id,
                name: p.application?.name,
            }));
    return partners.filter((c: Partner) => c.active);
}
