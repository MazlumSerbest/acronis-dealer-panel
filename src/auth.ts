import NextAuth from "next-auth";
import Sendgrid from "next-auth/providers/sendgrid";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/utils/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60,
        updateAge: 24 * 60 * 60,
    },
    providers: [
        Sendgrid({
            from: process.env.EMAIL_FROM,
            apiKey: process.env.AUTH_SENDGRID_KEY,
            maxAge: 5 * 60, // 5 minutes
        }),
    ],
    pages: {
        signIn: "/signin",
        verifyRequest: "/verifyrequest",
    },
    callbacks: {
        async signIn({ user, account, email }) {
            const userExists = await prisma.user.findFirst({
                where: {
                    email: user.email || "",
                },
            });

            // if (userExists) {
            //     return true;
            // } else {
            //     return "/signin?error=Email not found";
            // }

            if (!userExists) {
                return "/signin?error=emailNotFound";
            } else if (userExists?.active === false) {
                return "/signin?error=accountNotActive";
            } else {
                return true; //if the email exists in the User collection, email them a magic login link
            }
        },
    },
});
