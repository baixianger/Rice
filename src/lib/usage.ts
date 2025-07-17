import { RateLimiterPrisma } from "rate-limiter-flexible";
import prisma from "@/lib/db";
import {
  FREE_POINTS,
  PRO_POINTS,
  DURATION,
  GENERATION_COST,
} from "@/lib/constants";
import { auth } from "@clerk/nextjs/server";

export async function getUsageTracker() {
  const { has } = await auth();
  const hasProAccess = has({ plan: "pro_user" });
  // DURATION不建议动态设置，固定为30天最好，
  // 即便是包年用户也可以通过hasProAccess来判断，duration一过，自动刷新。
  const usageTracker = new RateLimiterPrisma({
    storeClient: prisma,
    tableName: "Usage",
    points: hasProAccess ? PRO_POINTS : FREE_POINTS,
    duration: DURATION,
  });

  return usageTracker;
}

// ref: https://github.com/animir/node-rate-limiter-flexible/wiki/Prisma#ratelimiterprisma
export async function consumeCredits() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  const usageTracker = await getUsageTracker();
  return await usageTracker.consume(userId, GENERATION_COST);
}

export async function refundCredits() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const usageTracker = await getUsageTracker();
  return await usageTracker.reward(userId, GENERATION_COST);
}

export async function getUsageStatus() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const usageTracker = await getUsageTracker();
  return await usageTracker.get(userId);
}
