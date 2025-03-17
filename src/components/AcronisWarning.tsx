import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LuTriangleAlert } from "react-icons/lu";

export default function AcronisWarning() {
    const t = useTranslations("General");

    return (
        <Alert className="border-yellow-400 text-yellow-500">
            <LuTriangleAlert className="size-4 text-yellow-500!" />
            <AlertTitle className="capitalize">{t("warning")}</AlertTitle>
            <AlertDescription>{t("warningMessage")}</AlertDescription>
        </Alert>
    );
}
