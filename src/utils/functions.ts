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
