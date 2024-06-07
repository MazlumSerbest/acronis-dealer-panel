"use client";
import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/navigation/Logo";

export default function SignIn() {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
        }, 3000);
    }

    return (
        <div className="flex flex-col h-dvh pt-20">
            <div className="mx-auto flex flex-col w-full justify-center space-y-6 sm:w-[350px]">
                {/* <div className="text-center mt-8">
                    <h1 className="text-2xl font-semibold tracking-tight text-blue-400">
                        DBackup Dealer Panel
                    </h1>
                </div> */}
                <Logo height={120} width={120} />

                <div className="flex flex-col space-y-2 text-center">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Sign In
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Enter your email below to sign in
                    </p>
                </div>

                <div className="grid gap-6">
                    <form onSubmit={onSubmit}>
                        <div className="grid gap-2">
                            <div className="grid gap-1">
                                <Label className="sr-only" htmlFor="email">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    placeholder="name@example.com"
                                    type="email"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                />
                            </div>
                            <Button className="bg-blue-500 hover:bg-blue-500/80">
                                Sign In with Email
                            </Button>
                        </div>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or
                            </span>
                        </div>
                    </div>

                    <Button variant="outline" type="button" asChild>
                        <Link href="/application">
                            Make A Dealer Application
                        </Link>
                    </Button>
                </div>
{/* 
                <p className="text-center text-sm text-muted-foreground">
                    By clicking continue, you are going to redirected to
                    application page.
                </p> */}

                <p className="text-center text-sm text-muted-foreground">
                    <Link
                        href="/terms"
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                        href="/privacy"
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        Privacy Policy
                    </Link>
                    .
                </p>

                <p className="text-center text-sm text-muted-foreground">
                    <Link
                        href="/activate"
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        Activate a License Key
                    </Link>
                </p>
            </div>
        </div>
    );
}
