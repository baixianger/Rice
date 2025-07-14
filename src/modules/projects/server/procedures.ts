import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";
import { generateSlug } from "random-word-slugs";
import { TRPCError } from "@trpc/server";
import { Project } from "@/generated/prisma/client";

type GetOneProjectInput = {
  id: string;
};

type CreateProjectInput = {
  userInput: string;
};

export const projectsRouter = createTRPCRouter({
  getOneProject: baseProcedure
    .input(
      z.object({
        id: z.string().min(1, "Project ID is required."),
      })
    )
    .query(async (opts: { input: GetOneProjectInput }): Promise<Project> => {
      const existingProject = await prisma.project.findUnique({
        where: {
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
  getManyProjects: baseProcedure.query(async (): Promise<Project[]> => {
    return await prisma.project.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
  createProject: baseProcedure
    .input(
      z.object({
        userInput: z
          .string()
          .min(1, "Prompt is required.")
          .max(1000, "Prompt is too long."),
      })
    )
    .mutation(async (opts: { input: CreateProjectInput }): Promise<Project> => {
      const createdProject = await prisma.project.create({
        data: {
          name: generateSlug(2, {
            format: "kebab",
          }),
          messages: {
            create: {
              content: opts.input.userInput,
              role: "USER",
              type: "RESULT",
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
