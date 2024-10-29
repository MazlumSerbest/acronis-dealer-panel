import NextAuth, { DefaultSession } from "next-auth";
import Sendgrid from "next-auth/providers/sendgrid";
import ForwardEmail from "next-auth/providers/forwardemail"
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/utils/db";

declare module "next-auth" {
    interface Session {
        user: {
            role: string | null | undefined;
        } & DefaultSession["user"];
    }
}

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
        // ForwardEmail({
        //     from: process.env.EMAIL_FROM,
        //     apiKey: process.env.AUTH_FORWARDEMAIL_KEY,
        //     maxAge: 5 * 60, // 5 minutes
        // })
    ],
    pages: {
        signIn: "/signin",
        verifyRequest: "/verifyrequest",
        error: "/error",
    },
    callbacks: {
        async session({ session }) {
            const user = await prisma.user.findFirst({
                where: {
                    email: session.user.email || "",
                },
            });
            session.user.role = user?.role;
            return session;
        },
        async signIn({ user }) {
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
