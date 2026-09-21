import { TRPCError } from "@trpc/server";
import { count, eq } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { presentations } from "~/server/db/schema";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return next();
});

export const presentationInput = z.object({
  name: z.string().trim().min(1, "Presentation name is required").max(255),
  presenterName: z.string().trim().max(255).optional().default(""),
  link: z.string().trim().min(1, "Presentation link is required").url(),
  publishedAt: z
    .string()
    .trim()
    .min(1, "Presentation time is required")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: "Presentation time must be a valid date.",
    }),
});

export const presentationRouter = createTRPCRouter({
  count: publicProcedure.query(async ({ ctx }) => {
    const [result] = await ctx.db
      .select({ total: count() })
      .from(presentations);

    return Number(result?.total ?? 0);
  }),

  list: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.query.presentations.findMany({
        orderBy: (table, { desc: descSort }) => [descSort(table.publishedAt)],
        limit: input.limit,
      });

      return items;
    }),

  create: adminProcedure
    .input(presentationInput)
    .mutation(async ({ ctx, input }) => {
      const [presentation] = await ctx.db
        .insert(presentations)
        .values({
          name: input.name.trim(),
          presenterName:
            input.presenterName.trim() === ""
              ? (ctx.session.user.name ?? "Club admin")
              : input.presenterName.trim(),
          link: input.link.trim(),
          publishedAt: new Date(input.publishedAt),
          createdById: ctx.session.user.id,
        })
        .returning();

      if (!presentation) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to save the presentation.",
        });
      }

      return presentation;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(presentations)
        .where(eq(presentations.id, input.id))
        .returning();

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Presentation not found.",
        });
      }

      return deleted;
    }),
});
