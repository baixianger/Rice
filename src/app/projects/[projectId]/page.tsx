"use server";

type Props = {
  params: {
    projectId: string;
  };
};

const Page = async ({ params }: Props) => {
  const projectId = params.projectId;
  return <div>Project {projectId}</div>;
};

export default Page;
