import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";
import {
  Message,
  Prisma,
  MessageType,
  MessageRole,
} from "@/generated/prisma/client";

type GetManyMessagesInputProps = {
  projectId: string;
};

type CreateUserMessageInputProps = {
  userInput: string;
  projectId: string;
};

type MessageWithFragmentProps = Prisma.MessageGetPayload<{
  include: { fragment: true };
}>;

export const messagesRouter = createTRPCRouter({
  getManyMessages: baseProcedure
    .input(
      z.object({
        projectId: z.string().min(1, "Project ID is required."),
      })
    )
    .query(
      async (opts: {
        input: GetManyMessagesInputProps;
      }): Promise<MessageWithFragmentProps[]> => {
        return await prisma.message.findMany({
          where: {
            projectId: opts.input.projectId,
          },
          orderBy: {
            createdAt: "asc",
          },
          include: {
            fragment: true,
          },
        });
      }
    ),
  createUserMessage: baseProcedure
    .input(
      z.object({
        userInput: z
          .string()
          .min(1, "Prompt is required.")
          .max(1000, "Prompt is too long."),
        projectId: z.string().min(1, "Project ID is required."),
      })
    )
    .mutation(
      async (opts: {
        input: CreateUserMessageInputProps;
      }): Promise<Omit<Message, "fragment">> => {
        console.log("测试用户输入：", opts.input.userInput);
        const createdUserMessage = await prisma.message.create({
          data: {
            projectId: opts.input.projectId,
            content: opts.input.userInput,
            role: MessageRole.USER,
            type: MessageType.INPUT,
          },
        });
        await inngest.send({
          name: "code-agent/run",
          data: {
            userInput: opts.input.userInput,
            projectId: opts.input.projectId,
          },
        });
        return createdUserMessage;
      }
    ),
});
