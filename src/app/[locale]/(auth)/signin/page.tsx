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

        // await signIn("forwardemail", formData);
        // await signIn("nodemailer", formData);
        await signIn("sendgrid", {
            redirectTo: "/",
            email: email,
        });
    }

    if (session) return redirect("/panel");
    return (
        <>
            <div className="relative container flex flex-col h-dvh pt-12 sm:pt-20 px-2 sm:px-0">
                <div className="absolute right-0 top-0 sm:right-2 sm:top-2">
                    <Button
                        variant="link"
                        onClick={() => {
                            const newPath = pathName.replace(
                                `/${locale}/`,
                                `/tr/`,
                            );
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
                            const newPath = pathName.replace(
                                `/${locale}/`,
                                `/en/`,
                            );
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
                        <form onSubmit={handleSubmit}>
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
                                    className="bg-blue-500 hover:bg-blue-500/80"
                                >
                                    {ts("signInWithEmail")}
                                    {submitting && (
                                        <LuLoader2 className="size-4 animate-spin ml-2" />
                                    )}
                                </Button>
                            </div>
                        </form>

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
                    {/* 
                <p className="text-center text-sm text-muted-foreground">
                    By clicking continue, you are going to redirected to
                    application page.
                </p> */}

                    <p className="text-center text-sm text-muted-foreground mt-24">
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
        </>
    );
}
