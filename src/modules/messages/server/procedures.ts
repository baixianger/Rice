import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";
import { MessageType, MessageRole, Prisma } from "@/generated/prisma/client";
import { TRPCError } from "@trpc/server";

export const messagesRouter = createTRPCRouter({
  getManyMessages: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, "Project ID is required."),
      })
    )
    .query(async (opts) => {
      return await prisma.message.findMany({
        where: {
          projectId: opts.input.projectId,
          project: {
            userId: opts.ctx.auth.userId,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        include: {
          fragment: true,
        },
      });
    }),
  createUserMessage: protectedProcedure
    .input(
      z.object({
        userInput: z
          .string()
          .min(1, "Prompt is required.")
          .max(1000, "Prompt is too long."),
        projectId: z.string().min(1, "Project ID is required."),
      })
    )
    .mutation(async (opts) => {
      try {
        const createdUserMessage = await prisma.message.create({
          data: {
            content: opts.input.userInput,
            role: MessageRole.USER,
            type: MessageType.INPUT,
            project: {
              connect: {
                id: opts.input.projectId,
                userId: opts.ctx.auth.userId,
              },
            },
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
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          // Error code: https://www.prisma.io/docs/orm/reference/error-reference#error-codes
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: `Unauthorized to create user message. Error code: ${error.code} from Prisma.`,
          });
        }
      }
    }),
});
