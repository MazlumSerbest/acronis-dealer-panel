import { toast } from "@/components/ui/use-toast";

export function CopyToClipboard(text: string, message?: string) {
    navigator.clipboard.writeText(text);
    toast({ title: message ?? "Panoya Kopyalandı!" });
}

export function generateLicenseKey() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let key = "";

    // Her gruptan 4 karakter oluştur, grupları "-" ile ayır
    for (let i = 0; i < 3; i++) {
        let group = "";
        for (let j = 0; j < 4; j++) {
            group += chars[Math.floor(Math.random() * chars.length)];
        }
        key += i < 2 ? group + "-" : group; // Son grupta "-" ekleme
    }

    return key;
}

export function generateShortId() {
    const getRandomChar = () => {
        const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        return chars[Math.floor(Math.random() * chars.length)];
    };

    const timestamp = Date.now().toString(36); // Zaman damgasını 36 tabanında al (daha kısa olur)
    const randomBlock = Array.from({ length: 5 }, getRandomChar).join(""); // 6 rastgele karakter
    const counter = (Math.floor(Math.random() * 1000)).toString().padStart(3, "0"); // 3 haneli rastgele sayaç

    return `${timestamp}${counter}${randomBlock}`; // Zaman + sayaç + rastgele karakter
}

export function generateCuid() {
    const getRandomChar = () => {
        const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        return chars[Math.floor(Math.random() * chars.length)];
    };

    const timestamp = Date.now().toString(36); // 36 tabanında zaman damgası
    const counter = (Math.random() * 100000).toFixed(0).padStart(5, "0"); // 5 haneli sayaç
    const randomBlock = Array.from({ length: 5 }, getRandomChar).join(""); // 5 rastgele karakter

    return `c${timestamp}${counter}${randomBlock}`; // c ile başlayan benzersiz ID
}

export function formatBytes(a: any, b = 2) {
    // if (a === null) return "Unlimited";
    // if (a === undefined) return "Unlimited";
    // if (a === 0) return "0 Bytes";
    if (!+a) return "0 Bytes";
    const c = 0 > b ? 0 : b,
        d = Math.floor(Math.log(a) / Math.log(1024));
    return `${parseFloat((a / Math.pow(1024, d)).toFixed(c))} ${
        ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
    }`;
}

export function parseBytes(value: number, unit: string): number {
    const units = ["MB", "GB", "TB"];
    const unitIndex = units.indexOf(unit);
    if (unitIndex === -1) {
        throw new Error("Geçersiz birim! Desteklenen birimler: MB, GB, TB.");
    }
    return value * Math.pow(1024, unitIndex + 2); // +2 çünkü MB = 1024^1, GB = 1024^2, TB = 1024^3
}

export function calculateDaysUntilAnniversary(date: string) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const anniversary = new Date(date);

    // Create an anniversary date for this year
    let nextAnniversary = new Date(
        currentYear,
        anniversary.getMonth(),
        anniversary.getDate(),
    );

    // If today's date is past this year's anniversary, use the next year's anniversary
    if (today > nextAnniversary) {
        nextAnniversary.setFullYear(currentYear + 1);
    }

    // Calculate the difference in time (in milliseconds)
    const timeDiff = nextAnniversary.getTime() - today.getTime();

    // Convert the difference from milliseconds to days
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return daysDiff;
}

export function calculateRemainingDays(date: string) {
    const today = new Date();
    const lastDate = new Date(date);

    // Calculate the difference in time (in milliseconds)
    const timeDiff = lastDate.getTime() - today.getTime();
    // Convert the difference from milliseconds to days
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysDiff;
}
