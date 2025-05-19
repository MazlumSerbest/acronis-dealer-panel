import NextAuth, { DefaultSession } from "next-auth";
import ForwardEmail from "next-auth/providers/forwardemail";
// import Nodemailer from "next-auth/providers/nodemailer";
import Loops from "next-auth/providers/loops";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/utils/db";
import { sendVerificationRequest } from "@/lib/authSendRequest";

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
        strategy: "database",
        maxAge: 3 * 60 * 60,
        updateAge: 60,
    },
    providers: [
        ForwardEmail({
            server: process.env.EMAIL_SERVER,
            from: process.env.EMAIL_FROM,
            apiKey: process.env.AUTH_FORWARDEMAIL_KEY,
            maxAge: 5 * 60, // 5 minutes
            sendVerificationRequest({ identifier: email, url }) {
                sendVerificationRequest({
                    identifier: email,
                    url,
                });
            },
        }),
        // Loops({
        //     apiKey: process.env.AUTH_LOOPS_KEY,
        //     transactionalId: process.env.AUTH_LOOPS_TRANSACTIONAL_ID,
        //     maxAge: 5 * 60, // 5 minutes
        // }),
    ],
    pages: {
        signIn: "/signin",
        verifyRequest: "/verifyRequest",
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
                select: {
                    active: true,
                    role: true,
                    partner: {
                        select: {
                            active: true,
                        },
                    },
                },
            });

            if (!userExists) {
                return "/signin?error=emailNotFound";
            } else if (userExists?.active === false) {
                return "/signin?error=accountNotActive";
            } else if (
                userExists.role !== "admin" &&
                userExists?.partner?.active === false
            ) {
                return "/signin?error=partnerNotActive";
            } else {
                return true; //if the email exists in the User collection, email them a magic login link
            }
        },
        async redirect({ url, baseUrl }) {
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`;

            // Allows callback URLs on the same origin
            if (new URL(url).origin === baseUrl) return url;

            return baseUrl;
        },
    },
});
