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
import prisma from "@/lib/db";
import { AgentState } from "./interfaces";

const MAX_ITERATIONS = 3;
// code agent to write nextjs code
export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" }, //这个id会显示在inngest的ui界面上
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create(
        "rice-nextjs-test-2" // template name
      );
      return sandbox.sandboxId;
    });

    const codeAgent = createAgent<AgentState>({
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
            network.state.data.summary = lastAssistantMessageText;
          }
          return result;
        },
      },
    });

    const network = createNetwork<AgentState>({
      name: "code-agent-network",
      agents: [codeAgent],
      maxIter: MAX_ITERATIONS,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        return summary ? undefined : codeAgent;
      },
    });

    const result = await network.run(event.data.userInput);

    const isError =
      !result.state.data.summary && result.state.data.files === undefined;

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            content: "Something went wrong, please try again.",
            role: "ASSISTANT",
            type: "ERROR",
            projectId: event.data.projectId,
          },
        });
      }
      return await prisma.message.create({
        data: {
          // 超过最大迭代次数，没有summary 返回undefined会报错
          content: result.state.data.summary,
          role: "ASSISTANT",
          type: "RESULT",
          projectId: event.data.projectId,
          fragment: {
            create: {
              sandboxUrl,
              title: "Fragment",
              files: result.state.data.files,
            },
          },
        },
      });
    });

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);
