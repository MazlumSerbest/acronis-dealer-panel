"use client";
import { ToastAction } from "./ui/toast";
import { toast } from "./ui/use-toast";
import { CopyToClipboard } from "@/utils/functions";

interface Props {
    title: string;
    description: string;
    t: (key: string) => string;
}

export default function DestructiveToast({
    title,
    description,
    t
}: Props) {
    return toast({
        variant: "destructive",
        title: title,
        description: description,
        action: (
            <ToastAction
                altText={t("copy")}
                onClick={() =>
                    CopyToClipboard(description, t("copiedToClipboard"))
                }
            >
                {t("copy")}
            </ToastAction>
        ),
    });
}
