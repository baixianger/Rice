export type TreeItem = string | [string, TreeItem[]];
export type TreeNode = {
  [key: string]: TreeNode | null;
};
export type FileCollection = { [path: string]: string };
