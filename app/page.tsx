import { Hero } from "@/components/sections/Hero";
import { MetricsBar } from "@/components/sections/MetricsBar";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { IdentitySection } from "@/components/sections/IdentitySection";
import { WritingSection } from "@/components/sections/WritingSection";
import { FooterCTA } from "@/components/sections/FooterCTA";
import { ScrollBackground } from "@/components/sections/ScrollBackground";

export default function Home() {
  return (
    <>
      <ScrollBackground />
      <div id="hero"><Hero /></div>
      <div id="metrics"><MetricsBar /></div>
      <div id="projects"><ProjectsSection /></div>
      <div id="identity"><IdentitySection /></div>
      <div id="writing"><WritingSection /></div>
      <div id="footer"><FooterCTA /></div>
    </>
  );
}
