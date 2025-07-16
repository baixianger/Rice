import { initTRPC } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { auth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

export const createTRPCContext = cache(async () => {
  return { auth: await auth() };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

const isAuthed = t.middleware((opts) => {
  if (!opts.ctx.auth.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized, please sign in/up.",
    });
  }
  return opts.next({
    ctx: { auth: opts.ctx.auth },
  });
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const createMiddleWare = t.middleware;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
