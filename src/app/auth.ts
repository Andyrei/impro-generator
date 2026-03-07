import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/db/mongodbClient";
import { connectDB } from "@/lib/db/mongodb";
import User from "@/lib/db/models/user";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: MongoDBAdapter(clientPromise),
    session: { strategy: "jwt" },
    providers: [
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
        }),
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger }) {
            // On sign-in `user` is populated; on subsequent requests only `token` is available
            if (user?.email || trigger === "update") {
                try {
                    await connectDB();
                    const dbUser = await User.findOne({ email: token.email }).lean();
                    if (dbUser) {
                        (token as JWT & { isAdmin?: boolean }).isAdmin = (dbUser as any).isAdmin ?? false;
                    }
                } catch {
                    // non-fatal — isAdmin defaults to false
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).isAdmin = (token as JWT & { isAdmin?: boolean }).isAdmin ?? false;
            }
            return session;
        },
    },
    pages: {
        signIn: "/it/login",
        error: "/it/login",
    },
});