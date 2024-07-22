import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export default async function VerifyRequest() {
    const session = await auth();
    if (session) {
        const url = "/en/panel";
        return redirect(url);
    }
    const ts = await getTranslations("SignIn");

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-10">
            <Card className="max-w-96">
                <CardHeader>
                    <CardTitle className="text-3xl">{ts("checkYourEmail")}</CardTitle>
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
