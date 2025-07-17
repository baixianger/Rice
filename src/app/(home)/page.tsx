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
