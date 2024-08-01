import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export default async function Error({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const session = await auth();
    if (session) {
        const url = "/panel";
        return redirect(url);
    }

    const t = await getTranslations("General");
    const ts = await getTranslations("SignIn.Errors");

    const error = searchParams?.error;

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-10">
            <Card className="max-w-[660px]">
                <CardHeader>
                    <CardTitle className="text-3xl text-destructive">
                        {t("errorTitle")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-base text-gray-600">
                        {error === "Configuration" && ts("Configuration")}
                        {error === "AccessDenied" && ts("AccessDenied")}
                        {error === "Verification" && ts("Verification")}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
