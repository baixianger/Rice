import { getUsageStatus } from "@/lib/usage";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const usageRouter = createTRPCRouter({
  getUsageStatus: protectedProcedure.query(async () => {
    try {
      return await getUsageStatus();
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get usage status.",
      });
    }
  }),
});
