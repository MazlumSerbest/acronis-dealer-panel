import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export default async function VerifyRequest() {
    const session = await auth();
    if (session) return redirect("/panel");

    const ts = await getTranslations("SignIn");

    return (
        <div className="container flex flex-col items-center justify-center h-screen gap-10">
            <Card className="max-w-[660px]">
                <CardHeader>
                    <CardTitle className="text-3xl text-blue-400">
                        {ts("checkYourEmail")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-base text-gray-600">
                        {ts("checkYourEmailDescription")}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
