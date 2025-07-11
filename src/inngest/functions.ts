import { inngest } from "./client";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { Sandbox } from "@e2b/code-interpreter";
import { createAgent, createNetwork, openai } from "@inngest/agent-kit";
import {
  terminalTool,
  createOrUpdateFilesTool,
  readFilesTool,
} from "./agent-tools";
import { PROMPT } from "./prompt";

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

// code agent to write nextjs code
export const codeFunction = inngest.createFunction(
  { id: "code-function" }, //这个id会显示在inngest的ui界面上
  { event: "test/code.function" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create(
        "rice-nextjs-test-2" // template name
      );
      return sandbox.sandboxId;
    });

    const codeAgent = createAgent({
      name: "code-agent",
      description: "An expert coding agent",
      system: PROMPT,
      model: openai({
        model: "gpt-4.1",
        defaultParameters: {
          temperature: 0.1,
        },
      }),
      tools: [
        terminalTool(sandboxId),
        createOrUpdateFilesTool(sandboxId),
        readFilesTool(sandboxId),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText =
            lastAssistantTextMessageContent(result);
          if (lastAssistantMessageText && network) {
            network.state.data.output = lastAssistantMessageText;
          }
          return result;
        },
      },
    });

    const network = createNetwork({
      name: "code-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        return summary ? undefined : codeAgent;
      },
    });

    const result = await network.run(event.data.codePrompt);

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);
