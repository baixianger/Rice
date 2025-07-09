import { inngest } from "./client";

// 这里定义 api/inngest/route.ts里需要注册的所有函数的实现
export const helloWorld = inngest.createFunction(
  { id: "hello-world" }, //这个id会显示在inngest的ui界面上
  { event: "test/hello.world" },
  async ({ event, step }) => {

    // Imaging this is a download step
    await step.sleep("wait-a-moment", "10s");
    // Imaging this is a transcript step
    await step.sleep("wait-a-moment", "5s");
    // Imaging this is a summary step
    await step.sleep("wait-a-moment", "5s");
    
    return { message: `Hello ${event.data.email}!` };
  },
);
