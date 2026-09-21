import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { resources } from "~/server/db/schema";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return next();
});

export const resourceInput = z.object({
  type: z.enum(["guide", "resource", "reference", "demo", "opportunity"]),
  brand: z.enum(["none", "president suggested", "exclusive partnership"]),
  name: z.string().trim().min(1, "Resource name is required").max(255),
  link: z.string().trim().min(1, "Resource link is required"),
  description: z.string().trim().min(1, "Description is required"),
});

export const resourceRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.resources.findMany({
      orderBy: (table, { asc: ascSort }) => [ascSort(table.name)],
    });
  }),

  create: adminProcedure
    .input(resourceInput)
    .mutation(async ({ ctx, input }) => {
      const [resource] = await ctx.db
        .insert(resources)
        .values({
          type: input.type,
          brand: input.brand,
          name: input.name.trim(),
          link: input.link.trim(),
          description: input.description.trim(),
          createdById: ctx.session.user.id,
        })
        .returning();

      if (!resource) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to save this resource.",
        });
      }

      return resource;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        ...resourceInput.shape,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const [resource] = await ctx.db
        .update(resources)
        .set({
          type: updates.type,
          brand: updates.brand,
          name: updates.name.trim(),
          link: updates.link.trim(),
          description: updates.description.trim(),
        })
        .where(eq(resources.id, id))
        .returning();

      if (!resource) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resource not found.",
        });
      }

      return resource;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(resources)
        .where(eq(resources.id, input.id))
        .returning();

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resource not found.",
        });
      }

      return deleted;
    }),
});
