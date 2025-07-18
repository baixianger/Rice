import { Sandbox } from "@e2b/code-interpreter";
import { AgentResult, TextMessage, type Message } from "@inngest/agent-kit";

export async function getSandbox(sandboxId: string) {
  return await Sandbox.connect(sandboxId);
}

/* 这里有一个AgentKit的一个输出示例,result.output数组
[
  {
    "role": "assistant",
    "stop_reason": "stop",
    "type": "text",
    "content": "Certainly! Below is a simple and reusable Card component in Next.js using React. "
  }
]
*/

export function lastAssistantTextMessageContent(result: AgentResult) {
  const lastAssistantTextMessageIndex = result.output.findLastIndex(
    (message) => message.role === "assistant"
  );

  const message = result.output[lastAssistantTextMessageIndex] as
    | TextMessage
    | undefined;

  return message?.content
    ? typeof message.content === "string"
      ? message.content
      : message.content.map((content) => content.text).join("\n") // sometime it returns an array of text
    : undefined;
}

export const parseAgentOutput = (value: Message[]): string => {
  const output = value[0];
  if (output.type !== "text") {
    return "Fragment";
  }
  if (Array.isArray(output.content)) {
    return output.content.map((txt) => txt).join(" ");
  }
  return output.content;
};
