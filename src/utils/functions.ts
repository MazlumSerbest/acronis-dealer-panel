import toast from "react-hot-toast";

export function CopyToClipboard(text: string, message?: string) {
    navigator.clipboard.writeText(text);
    toast.success(message ?? "Panoya Kopyalandı!");
}

export function formatBytes(a: any, b = 2) {
    if (!+a) return "0 Bytes";
    const c = 0 > b ? 0 : b,
        d = Math.floor(Math.log(a) / Math.log(1024));
    return `${parseFloat((a / Math.pow(1024, d)).toFixed(c))} ${
        ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
    }`;
}
