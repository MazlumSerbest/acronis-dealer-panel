import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/navigation/Logo";

export default async function VerifyRequest() {
    const session = await auth();
    if (session) {
        const url = "/en/panel";
        return redirect(url);
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-10">
            <Card className="max-w-96">
                <CardHeader>
                    <CardTitle className="text-3xl">Check Your Email</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-base text-gray-600">
                        We have sent a magic link to your email address. Please
                        follow the link to sign in to your account.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
