export function PriceFormat(priceStr: string) {
    const price = parseFloat(priceStr);

    if (!isNaN(price)) {
        return price.toLocaleString("tr-TR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    return priceStr;
}
