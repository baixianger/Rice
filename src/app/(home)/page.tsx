"use client";
import { ProjectForm } from "@/modules/home/ui/components/project-form";
import { ProjectsList } from "@/modules/home/ui/components/projects-list";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";

const HomePage = () => {
  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full">
      <section className="space-y-6 py-[16vh] 2xl:py-48">
        <div className="flex flex-col items-center">
          <Image
            src="/bowl_stroke.png"
            alt="Rice"
            width={80}
            height={80}
            className="hidden md:block"
          />
        </div>
        <h1 className="text-2xl md:text-5xl font-bold text-center">
          <TypeAnimation
            sequence={[
              // Same substring at the start will only be typed once, initially
              "Build Your Website With Rice",
              1000,
            ]}
            speed={10}
            repeat={Infinity}
            className="justify-start"
          />
        </h1>
        <p className="text-muted-foreground text-center md:text-xl text-lg">
          Create apps and websites by chatting with AI
        </p>
        <div className="max-w-3xl mx-auto w-full">
          <ProjectForm />
        </div>
      </section>
      <ProjectsList />
    </div>
  );
};

export default HomePage;

// "use client";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useTRPC } from "@/trpc/client";
// import { useMutation } from "@tanstack/react-query";
// import { toast } from "sonner";
// import { useState } from "react";
// import { useRouter } from "next/navigation";

// const Page = () => {
//   const router = useRouter();
//   const [userInput, setUserInput] = useState("");
//   const trpc = useTRPC();
//   const createProject = useMutation(
//     trpc.projects.createProject.mutationOptions({
//       onSuccess: (data) => {
//         toast.success("Project created successfully");
//         router.push(`/projects/${data.id}`);
//       },
//       onError: (error) => {
//         toast.error(error.message);
//       },
//     })
//   );

//   return (
//     <div className="h-screen w-screen flex items-center justify-center">
//       <div className="max-w-7xl mx-auto flex items-center flex-col gap-y-4 justify-center">
//         <Input
//           value={userInput}
//           onChange={(e) => setUserInput(e.target.value)}
//         />
//         <Button
//           disabled={createProject.isPending}
//           onClick={() => createProject.mutate({ userInput })}
//         >
//           Submit
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default Page;
