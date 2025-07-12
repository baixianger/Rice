import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";

export const messagesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    return await prisma.message.findMany({
      orderBy: {
        createdAt: "desc",
      },
      // include: {
      //   fragment: true,
      // },
    });
  }),
  create: baseProcedure
    .input(
      z.object({
        userInput: z.string().min(1, "Message is required."),
      })
    )
    .mutation(async (opts) => {
      const createdMessage = await prisma.message.create({
        data: {
          content: opts.input.userInput,
          role: "USER",
          type: "RESULT",
        },
      });
      await inngest.send({
        name: "code-agent/run",
        data: {
          userInput: opts.input.userInput,
        },
      });
      return createdMessage;
    }),
});
