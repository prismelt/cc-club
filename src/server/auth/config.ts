import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "~/server/db";
import { users } from "~/server/db/schema";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

const credentialsSchema = z.object({
  action: z
    .enum(["login", "signup", "admin-signup"])
    .optional()
    .default("login"),
  name: z.string().optional().default(""),
  email: z.string().email(),
  adminCode: z.string().optional().default(""),
});

export const authConfig = {
  providers: [
    Credentials({
      id: "credentials",
      name: "Club account",
      credentials: {
        action: { label: "Action", type: "text" },
        name: { label: "Student name", type: "text" },
        email: { label: "Student email", type: "email" },
        adminCode: { label: "Admin code", type: "password" },
      },
      authorize: async (rawCredentials) => {
        const parsed = credentialsSchema.safeParse({
          ...rawCredentials,
          email:
            typeof rawCredentials?.email === "string"
              ? rawCredentials.email.trim().toLowerCase()
              : "",
          name:
            typeof rawCredentials?.name === "string"
              ? rawCredentials.name.trim()
              : "",
        });

        if (!parsed.success) {
          return null;
        }

        const { action, name, email, adminCode } = parsed.data;

        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (action === "login") {
          if (!existingUser?.id) {
            return null;
          }
          return {
            id: String(existingUser.id),
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role ?? "member",
          };
        }

        if (name.length < 3 || existingUser) {
          return null;
        }

        if (action === "admin-signup" && adminCode !== "password123") {
          return null;
        }

        const adminEmails = (process.env.ADMIN_EMAILS ?? "")
          .split(",")
          .map((value) => value.trim().toLowerCase());

        const role =
          action === "admin-signup" || adminEmails.includes(email)
            ? "admin"
            : "member";

        const [newUser] = await db
          .insert(users)
          .values({
            name,
            email,
            role,
          })
          .returning();

        if (!newUser?.id) {
          return null;
        }

        return {
          id: String(newUser.id),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role ?? "member",
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        const userData = user as typeof user & { role?: string };
        token.id = user.id ?? "";
        token.role = userData.role ?? "member";
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: (token.id as string) ?? "",
        role: (token.role as string) ?? "member",
      },
    }),
  },
} satisfies NextAuthConfig;
