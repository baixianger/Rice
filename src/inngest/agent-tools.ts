import { createTool, type Tool } from "@inngest/agent-kit";
import { z } from "zod";
import { getSandbox } from "./utils";
import { AgentState } from "./interfaces";

// 1. Give agent ability to run commands in the sandbox
export const terminalTool = (sandboxId: string) =>
  createTool({
    name: "terminal",
    description: "You can use this tool to run commands in the sandbox.",
    parameters: z.object({
      command: z.string(),
    }),
    handler: async ({ command }, { step }: Tool.Options<AgentState>) => {
      const result = await step?.run("terminal", async () => {
        const buffers = { stdout: "", stderr: "" };
        try {
          const sandbox = await getSandbox(sandboxId);
          const result = await sandbox.commands.run(command, {
            onStdout: (data: string) => {
              buffers.stdout += data;
            },
            onStderr: (data: string) => {
              buffers.stderr += data;
            },
          });
          return result.stdout;
        } catch (error) {
          console.error(
            `Command failed: ${error} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`
          );
          return `Command failed: ${error} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`;
        }
      });
      return result;
    },
  });

export const createOrUpdateFilesTool = (sandboxId: string) =>
  createTool({
    name: "createOrUpdateFiles",
    description: "You can create or update files in the sandbox.",
    parameters: z.object({
      files: z.array(
        z.object({
          path: z.string(),
          content: z.string(),
        })
      ),
    }),
    handler: async ({ files }, { step, network }: Tool.Options<AgentState>) => {
      const newFiles = await step?.run("createOrUpdateFiles", async () => {
        try {
          const updatedFiles = network.state.data.files || {};
          const sandbox = await getSandbox(sandboxId);
          for (const file of files) {
            await sandbox.files.write(file.path, file.content);
            updatedFiles[file.path] = file.content;
          }
          return updatedFiles;
        } catch (error) {
          return `Error: ${error}`;
        }
      });

      if (typeof newFiles === "object") {
        network.state.data.files = newFiles;
      }
      return newFiles;
    },
  });

export const readFilesTool = (sandboxId: string) =>
  createTool({
    name: "readFiles",
    description: "You can read files from the sandbox.",
    parameters: z.object({
      paths: z.array(z.string()),
    }),
    handler: async ({ paths }, { step }: Tool.Options<AgentState>) => {
      const files = await step?.run("readFiles", async () => {
        try {
          const sandbox = await getSandbox(sandboxId);
          const files: { [path: string]: string } = {};
          for (const path of paths) {
            const content = await sandbox.files.read(path);
            files[path] = content;
          }
          return files;
        } catch (error) {
          return `Error: ${error}`;
        }
      });
      return files;
    },
  });
