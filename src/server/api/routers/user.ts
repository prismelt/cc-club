import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { accounts, posts, sessions, users } from "~/server/db/schema";

const profileInput = z.object({
  name: z.string().trim().min(3).max(255),
  email: z.string().trim().email().max(255),
  description: z.string().trim().max(500),
  avatar: z.string().trim().url().or(z.literal("/avatar-default.webp")),
});

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next();
});

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(({ ctx }) =>
    ctx.db.query.users.findFirst({ where: eq(users.id, ctx.session.user.id) }),
  ),

  updateProfile: protectedProcedure
    .input(profileInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      });
      if (existing && existing.id !== ctx.session.user.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email is already in use.",
        });
      }
      const [updated] = await ctx.db
        .update(users)
        .set(input)
        .where(eq(users.id, ctx.session.user.id))
        .returning();
      return updated;
    }),

  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.transaction(async (tx) => {
      await tx.delete(posts).where(eq(posts.createdById, ctx.session.user.id));
      await tx.delete(accounts).where(eq(accounts.userId, ctx.session.user.id));
      await tx.delete(sessions).where(eq(sessions.userId, ctx.session.user.id));
      await tx.delete(users).where(eq(users.id, ctx.session.user.id));
    });
    return { success: true };
  }),

  list: adminProcedure.query(({ ctx }) =>
    ctx.db.query.users.findMany({
      orderBy: (table, { asc }) => [asc(table.name)],
    }),
  ),

  deleteUser: adminProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Use your profile to delete your own account.",
        });
      }
      await ctx.db.transaction(async (tx) => {
        await tx.delete(posts).where(eq(posts.createdById, input.userId));
        await tx.delete(accounts).where(eq(accounts.userId, input.userId));
        await tx.delete(sessions).where(eq(sessions.userId, input.userId));
        await tx.delete(users).where(eq(users.id, input.userId));
      });
      return { success: true };
    }),
});
