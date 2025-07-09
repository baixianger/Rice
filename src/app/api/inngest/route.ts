import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { helloWorld, codeFunction } from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld, // 在这里把需要添加的inngest的funciton的所有函数名都添加进来
    codeFunction,
  ],
});
