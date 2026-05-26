import { Hero } from "@/components/sections/Hero";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { HackathonsSection } from "@/components/sections/HackathonsSection";
import { IdentitySection } from "@/components/sections/IdentitySection";
import { PerspectivesSection } from "@/components/sections/PerspectivesSection";
import { WritingSection } from "@/components/sections/WritingSection";
import { EarthSection } from "@/components/sections/EarthSection";
import { FooterCTA } from "@/components/sections/FooterCTA";
import { ScrollBackground } from "@/components/sections/ScrollBackground";

export default function Home() {
  return (
    <>
      <ScrollBackground />
      <div id="hero"><Hero /></div>
      <div id="projects"><ProjectsSection /></div>
      <div id="hackathons"><HackathonsSection /></div>
      <div id="identity"><IdentitySection /></div>
      <div id="writing"><WritingSection /></div>
      <div id="perspectives"><PerspectivesSection /></div>
      <EarthSection />
      <div id="footer"><FooterCTA /></div>
    </>
  );
}
