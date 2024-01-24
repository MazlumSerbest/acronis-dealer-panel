import toast from "react-hot-toast";

export function CopyToClipboard(text: string, message?: string) {
    navigator.clipboard.writeText(text);
    toast.success(message ?? "Panoya Kopyalandı!");
}
