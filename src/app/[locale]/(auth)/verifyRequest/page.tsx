import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function VerifyRequest() {
    const session = await auth();
    if (session) return redirect("/panel");

    const t = await getTranslations("General");
    const ts = await getTranslations("SignIn");

    return (
        <div className="container flex flex-col items-center justify-center h-screen gap-10">
            <Card className="max-w-[680px]">
                <CardHeader>
                    <CardTitle className="text-3xl text-blue-400">
                        {ts("checkYourEmail")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    <p className="text-base text-gray-600">
                        {ts("checkYourEmailDescription")}
                    </p>

                    <div className="flex justify-center">
                        <Button
                            variant="default"
                            size="lg"
                            className="bg-blue-400 hover:bg-blue-400/90"
                            asChild
                        >
                            <Link href="/signin">{t("backToSignIn")}</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
