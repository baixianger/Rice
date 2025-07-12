import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";
import { generateSlug } from "random-word-slugs";

export const projectsRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    return await prisma.project.findMany({
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
        userInput: z
          .string()
          .min(1, "Prompt is required.")
          .max(1000, "Prompt is too long."),
      })
    )
    .mutation(async (opts) => {
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
