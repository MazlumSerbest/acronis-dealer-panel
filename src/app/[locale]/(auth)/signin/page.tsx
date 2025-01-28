"use client";
import { useState } from "react";
import Link from "next/link";
import { redirect, useRouter, usePathname } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/navigation/Logo";
import { LuLoader2 } from "react-icons/lu";
import { Turnstile } from "@marsidev/react-turnstile";
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function SignIn({
    searchParams,
}: {
    searchParams: URLSearchParams;
}) {
    const search = new URLSearchParams(searchParams);
    const { data: session } = useSession();

    const router = useRouter();
    const pathName = usePathname();
    const t = useTranslations("General");
    const ts = useTranslations("SignIn");
    const locale = useLocale();
    const [submitting, setSubmitting] = useState(false);
    const [turnstile, setTurnstile] = useState<
        "solved" | "error" | "expired" | undefined
    >();

    async function handleSubmit(event: any) {
        event.preventDefault();
        const email = event.target.email.value;

        if (turnstile !== "solved")
            return router.push("/signin?error=turnstile");
        setSubmitting(true);
        if (email === "") {
            setSubmitting(false);
            return router.push("/signin?error=emailRequired");
        }

        await signIn("forwardemail", {
            redirectTo: "/",
            email: email,
        });
    }

    if (session) return redirect("/panel");
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="absolute right-2 top-2 sm:right-2 sm:top-2">
                <Button
                    variant="link"
                    onClick={() => {
                        const newPath = pathName.replace(`/${locale}/`, `/tr/`);
                        router.replace(newPath);
                        router.refresh();
                    }}
                    className={cn(
                        "hover:underline text-muted-foreground",
                        locale == "tr" && "text-blue-400 underline",
                    )}
                >
                    Türkçe
                </Button>
                <span className="text-muted-foreground">|</span>
                <Button
                    variant="link"
                    onClick={() => {
                        const newPath = pathName.replace(`/${locale}/`, `/en/`);
                        router.replace(newPath);
                        router.refresh();
                    }}
                    className={cn(
                        "hover:underline text-muted-foreground",
                        locale == "en" && "text-blue-400 underline",
                    )}
                >
                    English
                </Button>
            </div>

            <div className="flex w-full max-w-sm flex-col gap-6">
                <Logo height={80} width={80} />

                <Card className="w-min-content">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">
                            {ts("signIn")}
                        </CardTitle>
                        <CardDescription>
                            {ts("signInDescription")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label className="" htmlFor="email">
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

                                <Turnstile
                                    siteKey="0x4AAAAAAAfReA6N46PHA4HD"
                                    // siteKey="1x00000000000000000000AA"
                                    options={{
                                        size: "flexible" as any,
                                        language: locale,
                                    }}
                                    className={cn(
                                        "*:-mb-[6px]",
                                        turnstile === "error" ||
                                            turnstile === "expired"
                                            ? "ring-destructive ring-2"
                                            : "",
                                    )}
                                    onError={() => setTurnstile("error")}
                                    onExpire={() => setTurnstile("expired")}
                                    onSuccess={() => setTurnstile("solved")}
                                />

                                <Button
                                    disabled={submitting}
                                    type="submit"
                                    className="bg-blue-400 hover:bg-blue-400/90"
                                >
                                    {ts("signInWithEmail")}
                                    {submitting && (
                                        <LuLoader2 className="size-4 animate-spin ml-2" />
                                    )}
                                </Button>

                                {/* <div className="relative">
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
                    </Button> */}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* <div className="flex flex-col space-y-2 text-center">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        {ts("signIn")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {ts("signInDescription")}
                    </p>
                </div> */}

                {/* 
                <p className="text-center text-sm text-muted-foreground">
                    By clicking continue, you are going to redirected to
                    application page.
                </p> */}
                <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
                    © {new Date().getFullYear()} DCube Bilişim Teknolojileri.
                    <br />
                    {ts("allRightsReserved")}
                    <br />
                    {/* <Link href="#">{ts("termsOfService")}</Link>
                    {` ${t("and")} `}
                    <Link href="#">{ts("privacyPolicy")}</Link>. */}
                </div>
            </div>
        </div>
    );
}
