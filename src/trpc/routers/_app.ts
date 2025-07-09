import { z } from "zod";
import { baseProcedure, createTRPCRouter, createMiddleWare } from "../init";
import { TRPCError } from "@trpc/server";
import { inngest } from "@/inngest/client";

// 单独定义 middleware
const preMiddleware = createMiddleWare((opts) => {
  console.log("middleware 前置处理上下文 : ", opts.ctx);
  if (opts.ctx.userId === "user_123") {
    return opts.next({
      // 不会覆盖上下文，只会增加和修改
      ctx: {
        sos: "日本鬼子入侵",
      },
    });
  }
  throw new TRPCError({ code: "UNAUTHORIZED" });
});
const postMiddleware = createMiddleWare(async (opts) => {
  const result = await opts.next();
  console.log("middleware 后置处理最终结果 : ", result);
  return result;
});
const inputMiddleware = createMiddleWare((opts) => {
  console.log("middleware 前置处理用户输入 : ", opts.input);
  return opts.next();
});

// 合并中间件 用 mid3 = mid1.pipe(mid2) 的方式
// https://trpc.io/docs/server/middlewares#extending-middlewares

// procedure可以进行组合
// https://trpc.io/docs/server/middlewares#concat
const postMiddlewareProcedure = baseProcedure.use(postMiddleware);

export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .use(preMiddleware) //返回一个新的 procedure
    .input(
      z.object({
        text: z.string(),
      })
    ) //返回一个新的 procedure
    .use(inputMiddleware) //返回一个新的 procedure
    .concat(postMiddlewareProcedure) //合并已有的 procedure 实现插件功能
    .query((opts: { ctx: { userId: string }; input: { text: string } }) => {
      console.log("query 接收到上下文 : ", opts.ctx);
      console.log("query 接收到输入 : ", opts.input);
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),

  // add a inngest job
  invoke: baseProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await inngest.send({
        name: "test/hello.world",
        data: {
          email: input.text,
        },
      });
      return { ok: "success" };
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
