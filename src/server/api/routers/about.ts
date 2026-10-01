import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { aboutMembers } from "~/server/db/schema";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return next();
});

export const aboutMemberInput = z.object({
  position: z.string().trim().min(1, "Position is required").max(255),
  name: z.string().trim().min(1, "Name is required").max(255),
  description: z.string().trim().max(500).optional().default(""),
  email: z.string().trim().max(255).optional().default(""),
  quote: z.string().trim().max(500).optional().default(""),
});

export const aboutRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.aboutMembers.findMany({
      orderBy: (table, { asc }) => [asc(table.id)],
    });
  }),

  create: adminProcedure
    .input(aboutMemberInput)
    .mutation(async ({ ctx, input }) => {
      const [member] = await ctx.db
        .insert(aboutMembers)
        .values({
          position: input.position.trim(),
          name: input.name.trim(),
          description: input.description.trim(),
          email: input.email.trim(),
          quote: input.quote.trim(),
          createdById: ctx.session.user.id,
        })
        .returning();

      if (!member) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to save this profile.",
        });
      }

      return member;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(aboutMembers)
        .where(eq(aboutMembers.id, input.id))
        .returning();

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found.",
        });
      }

      return deleted;
    }),
});
