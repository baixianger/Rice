import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";
import { generateSlug } from "random-word-slugs";
import { TRPCError } from "@trpc/server";
import { Project, MessageType, MessageRole } from "@/generated/prisma/client";
import { consumeCredits } from "@/lib/usage";

export const projectsRouter = createTRPCRouter({
  getOneProject: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, "Project ID is required."),
      })
    )
    .query(async (opts): Promise<Project> => {
      const existingProject = await prisma.project.findUnique({
        where: {
          userId: opts.ctx.auth.userId,
          id: opts.input.id,
        },
      });
      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found.",
        });
      }
      return existingProject;
    }),
  getManyProjects: protectedProcedure.query(
    async (opts): Promise<Project[]> => {
      return await prisma.project.findMany({
        where: {
          userId: opts.ctx.auth.userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }
  ),
  createProject: protectedProcedure
    .input(
      z.object({
        userInput: z
          .string()
          .min(1, "Prompt is required.")
          .max(1000, "Prompt is too long."),
      })
    )
    .mutation(async (opts): Promise<Project> => {
      try {
        await consumeCredits();
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `没有usage信息 ${error.message}`,
          });
        } else {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "You have run out of credits.",
          });
        }
      }
      const createdProject = await prisma.project.create({
        data: {
          userId: opts.ctx.auth.userId,
          name: generateSlug(2, {
            format: "kebab",
          }),
          messages: {
            create: {
              content: opts.input.userInput,
              role: MessageRole.USER,
              type: MessageType.INPUT,
            },
          },
        },
      });

      await inngest.send({
        name: "code-agent/run",
        data: {
          userInput: opts.input.userInput,
          projectId: createdProject.id,
        },
      });
      return createdProject;
    }),
});
