import { inngest } from "./client";
import {
  getSandbox,
  lastAssistantTextMessageContent,
  parseAgentOutput,
} from "./utils";
import { Sandbox } from "@e2b/code-interpreter";
import {
  createAgent,
  createNetwork,
  openai,
  type Message,
  createState,
} from "@inngest/agent-kit";
import {
  terminalTool,
  createOrUpdateFilesTool,
  readFilesTool,
} from "./agent-tools";
import { FRAGMENT_TITLE_PROMPT, RESPONSE_PROMPT, PROMPT } from "./prompt";
import prisma from "@/lib/db";
import { AgentState } from "./interfaces";
import { MessageType, MessageRole } from "@/generated/prisma/client";
import { MAX_ITERATIONS } from "@/lib/constants";

// 1. 定义事件类型
import { EventPayload } from "inngest";
export interface CodeAgentRunEvent extends EventPayload {
  name: "code-agent/run";
  data: {
    userInput: string;
    projectId: string;
    userId: string;
  };
}
// 2. 定义 Step 类型
import type { GetStepTools } from "inngest";
type InngestStep = GetStepTools<typeof inngest, "code-agent/run">;

// 3. 定义 handler返回类型
export interface AgentWorkflowResult {
  url: string;
  title: string;
  files: { [path: string]: string };
  summary: string;
}
// 4. 定义 handler类型
export type InngestHandler<EventType extends EventPayload> = (params: {
  event: EventType;
  step: InngestStep;
}) => Promise<AgentWorkflowResult>;

// 5. 定义 handler
const agentWorkflow: InngestHandler<CodeAgentRunEvent> = async ({
  event,
  step,
}) => {
  // Alternative: Block userId for consuming credits
  // and unblock it after the code agent job is done

  const sandboxId = await step.run("get-sandbox-id", async () => {
    const sandbox = await Sandbox.create(
      "rice-nextjs-test-2" // template name
    );
    return sandbox.sandboxId;
  });

  const previousMessages = await step.run("get-previous-messages", async () => {
    const formattedMessages: Message[] = [];
    const messages = await prisma.message.findMany({
      where: {
        projectId: event.data.projectId,
      },
      orderBy: {
        createdAt: "asc", // 保证消息的顺序, 否则模型会出现幻觉
      },
    });
    for (const message of messages) {
      formattedMessages.push({
        type: "text",
        role: message.role === MessageRole.USER ? "user" : "assistant",
        content: message.content,
      });
    }
    return formattedMessages;
  });

  const state = createState<AgentState>(
    {
      summary: "",
      files: {},
    },
    {
      messages: previousMessages,
    }
  );

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
    defaultState: state,
    router: async ({ network }) => {
      const summary = network.state.data.summary;
      return summary ? undefined : codeAgent; // 如果summary存在，返回undefined，否则返回codeAgent继续执行
    },
  });

  const result = await network.run(event.data.userInput, { state });

  const fragmentTitleGenerator = createAgent({
    name: "fragment-title-generator",
    description: "Generate a title for the code fragment",
    system: FRAGMENT_TITLE_PROMPT,
    model: openai({
      model: "gpt-4o",
    }),
  });

  const responseAgent = createAgent({
    name: "response-agent",
    description: "Generate a response for the user",
    system: RESPONSE_PROMPT,
    model: openai({
      model: "gpt-4o",
    }),
  });

  const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(
    result.state.data.summary
  );

  const { output: responseOutput } = await responseAgent.run(
    result.state.data.summary
  );

  const isError =
    !result.state.data.summary || result.state.data.files === undefined;

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
          role: MessageRole.ASSISTANT,
          type: MessageType.ERROR,
          projectId: event.data.projectId,
        },
      });
    }
    return await prisma.message.create({
      data: {
        // 超过最大迭代次数，没有summary 返回undefined会报错
        content: parseAgentOutput(responseOutput),
        role: MessageRole.ASSISTANT,
        type: MessageType.RESULT,
        projectId: event.data.projectId,
        fragment: {
          create: {
            sandboxUrl,
            title: parseAgentOutput(fragmentTitleOutput),
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
};

const agentTestRouter: InngestHandler<CodeAgentRunEvent> = async ({
  event,
  step,
}) => {
  if (event.data.userInput === "test" || event.data.userInput === "测试") {
    await prisma.message.create({
      data: {
        // 超过最大迭代次数，没有summary 返回undefined会报错
        content:
          "<task_summary>这是一条测试任务成功的回执, 用来节约openAI API的调用</task_summary>",
        role: MessageRole.ASSISTANT,
        type: MessageType.RESULT,
        projectId: event.data.projectId,
        fragment: {
          create: {
            sandboxUrl: "http://localhost:8288/runs",
            title: "Fragment",
            files: {
              "app/page.tsx": "这是一个测试文件, 用来节约openAI API的调用",
            },
          },
        },
      },
    });
    return {
      url: "http://localhost:8288/runs",
      title: "这是一条成功测试, 返回inngest后台",
      files: {},
      summary: "test",
    };
  }
  if (event.data.userInput === "error" || event.data.userInput === "报错") {
    await step.run("save-result", async () => {
      return await prisma.message.create({
        data: {
          content: "Something went wrong, please try again.",
          role: MessageRole.ASSISTANT,
          type: MessageType.ERROR,
          projectId: event.data.projectId,
        },
      });
    });
    return {
      url: "http://localhost:8288/runs",
      title: "这是一条错误测试, 返回inngest后台",
      files: {},
      summary: "error test",
    };
  }
  return await agentWorkflow({ event, step });
};

// code agent to write nextjs code
export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" }, //这个id会显示在inngest的ui界面上
  { event: "code-agent/run" },
  agentTestRouter // 测试用，实际用agentWorkflow
);
