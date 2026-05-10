import { Hero } from "@/components/sections/Hero";
import { MetricsBar } from "@/components/sections/MetricsBar";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { IdentitySection } from "@/components/sections/IdentitySection";
import { WritingSection } from "@/components/sections/WritingSection";
import { FooterCTA } from "@/components/sections/FooterCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <MetricsBar />
      <ProjectsSection />
      <IdentitySection />
      <WritingSection />
      <FooterCTA />
    </>
  );
}
