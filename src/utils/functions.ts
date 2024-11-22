import { useToast } from "@/components/ui/use-toast";

export function CopyToClipboard(text: string, message?: string) {
    const { toast } = useToast();

    navigator.clipboard.writeText(text);
    toast({ title: message ?? "Panoya Kopyalandı!" });
}

export function formatBytes(a: any, b = 2) {
    if (!+a) return "0 Bytes";
    const c = 0 > b ? 0 : b,
        d = Math.floor(Math.log(a) / Math.log(1024));
    return `${parseFloat((a / Math.pow(1024, d)).toFixed(c))} ${
        ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
    }`;
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
