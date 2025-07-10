import { inngest } from "./client";
import { getSandbox } from "./utils";
import { Sandbox } from "@e2b/code-interpreter";
import { createAgent, openai } from "@inngest/agent-kit";

// 这里定义 api/inngest/route.ts里需要注册的所有函数的实现
export const helloWorld = inngest.createFunction(
  { id: "hello-world" }, //这个id会显示在inngest的ui界面上
  { event: "test/hello.world" },
  async ({ event }) => {
    // Imaging this is a download step
    console.log("Inngest 的 helloWorld 函数接收到输入对象 : ", event.data);
    const summarizer = createAgent({
      name: "Summarizer",
      system: "You are a helpful summarizer. You summarize in 2 words.",
      model: openai({ model: "gpt-4o-mini" }),
    });
    const { output } = await summarizer.run(
      `Summarize the following text:${event.data.inputValue2Inggest}`
    );
    console.log("Inngest 的 helloWorld 最终的job结果 : ", output);
    return output;
  }
);

export const codeFunction = inngest.createFunction(
  { id: "code-function" }, //这个id会显示在inngest的ui界面上
  { event: "test/code.function" },
  async ({ event, step }) => {
    // Imaging this is a download step
    console.log("Inngest 的 codeFunction 函数接收到输入对象 : ", event.data);
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create(
        "rice-nextjs-test-2" // template name
      );
      return sandbox.sandboxId;
    });

    // const codeAgent = createAgent({
    //   name: "code-agent",
    //   system:
    //     "You are an expert Next.js developer. You write readable, maintainable code. You write simple Next.js and React code snippets.",
    //   model: openai({ model: "gpt-4o-mini" }),
    // });

    // const { output } = await codeAgent.run(
    //   `Write the following snippet: ${event.data.codePrompt}`
    // );

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    return { output: "pesudo result from LLM", sandboxUrl };
  }
);
