import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "~/server/db";
import { users } from "~/server/db/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    Credentials({
      id: "credentials",
      name: "Club account",
      credentials: {
        action: { label: "Action", type: "text" },
        name: { label: "Student name", type: "text" },
        email: { label: "Student email", type: "email" },
      },
      authorize: async (credentials) => {
        const action = credentials?.action === "signup" ? "signup" : "login";
        const name =
          typeof credentials?.name === "string" ? credentials.name.trim() : "";
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        if (!z.string().email().safeParse(email).success) {
          return null;
        }
        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });
        if (action === "login") return user ? { ...user, id: user.id } : null;
        if (name.length < 3 || user) return null;
        const [newUser] = await db
          .insert(users)
          .values({ name, email })
          .returning();
        return newUser ? { ...newUser, id: newUser.id } : null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        const tokenData = token as typeof token & { id: string };
        tokenData.id = user.id ?? "";
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: (token as typeof token & { id: string }).id,
      },
    }),
  },
} satisfies NextAuthConfig;
