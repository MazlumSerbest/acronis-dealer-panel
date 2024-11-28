import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/navigation/Logo";

export default async function SignIn({
    searchParams,
}: {
    searchParams: URLSearchParams;
}) {
    const search = new URLSearchParams(searchParams);
    const session = await auth();
    if (session) return redirect("/panel");
    const t = await getTranslations("General");
    const ts = await getTranslations("SignIn");

    return (
        <div className="flex flex-col h-dvh pt-12 sm:pt-20 px-4 sm:px-0">
            <div className="mx-auto flex flex-col w-full justify-center space-y-6 sm:w-[350px]">
                <Logo height={120} width={120} />

                <div className="flex flex-col space-y-2 text-center">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        {ts("signIn")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {ts("signInDescription")}
                    </p>
                </div>

                <div className="grid gap-6">
                    <form
                        action={async (formData) => {
                            "use server";

                            if (formData.get("email") === "")
                                return redirect("/signin?error=emailRequired");

                            // await signIn("forwardemail", formData);
                            // await signIn("nodemailer", formData);
                            await signIn("sendgrid", formData);
                        }}
                    >
                        <div className="grid gap-2">
                            <div className="grid gap-1">
                                <Label className="sr-only" htmlFor="email">
                                    {t("email")}
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    placeholder={ts("emailPlaceholder")}
                                    type="email"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                />
                                {search.has("error") && (
                                    <p className="text-xs text-destructive px-2">
                                        {search.get("error")
                                            ? ts(
                                                  "Errors." +
                                                      search.get("error"),
                                              )
                                            : ts("Errors.Error")}
                                    </p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-500/80"
                            >
                                {ts("signInWithEmail")}
                            </Button>
                        </div>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                {t("or")}
                            </span>
                        </div>
                    </div>

                    <Button variant="outline" type="button" asChild>
                        <Link href="/application">{ts("makeApplication")}</Link>
                    </Button>
                </div>
                {/* 
                <p className="text-center text-sm text-muted-foreground">
                    By clicking continue, you are going to redirected to
                    application page.
                </p> */}

                <p className="text-center text-sm text-muted-foreground">
                    <Link
                        href="#"
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        {ts("termsOfService")}
                    </Link>
                    {` ${t("and")} `}
                    <Link
                        href="#"
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        {ts("privacyPolicy")}
                    </Link>
                    .
                </p>

                {/* <p className="text-center text-sm text-muted-foreground">
                    <Link
                        href="/activate"
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        Activate a License Key
                    </Link>
                </p> */}
            </div>
        </div>
    );
}
