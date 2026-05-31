import { Hero } from "@/components/sections/Hero";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { HackathonsSection } from "@/components/sections/HackathonsSection";
import { IdentitySection } from "@/components/sections/IdentitySection";
import { PerspectivesSection } from "@/components/sections/PerspectivesSection";
import { WritingSection } from "@/components/sections/WritingSection";
import { CryptoSection } from "@/components/sections/CryptoSection";
import { EarthSection } from "@/components/sections/EarthSection";
import { FooterCTA } from "@/components/sections/FooterCTA";
import { ScrollBackground } from "@/components/sections/ScrollBackground";
import { SectionRail } from "@/components/ui/SectionRail";
import { LazyMount } from "@/components/ui/LazyMount";

// Progressive mount: Hero renders immediately; every below-the-fold section
// mounts only once it scrolls within ~300px of the viewport. The id'd wrapper
// divs stay in the DOM the whole time so the scroll observers (ScrollBackground
// zone tracker, SectionRail active-section highlighter) can find them.
//
// Reserve heights are approximate — they only matter while the section hasn't
// mounted yet, to keep the scrollbar position stable. Once the section mounts
// its real height takes over.
export default function Home() {
  return (
    <>
      <ScrollBackground />
      <SectionRail />
      <div id="hero"><Hero /></div>
      <div id="projects">
        <LazyMount minHeight={780}><ProjectsSection /></LazyMount>
      </div>
      <div id="hackathons">
        <LazyMount minHeight={620}><HackathonsSection /></LazyMount>
      </div>
      <div id="identity">
        <LazyMount minHeight={820}><IdentitySection /></LazyMount>
      </div>
      <div id="writing">
        <LazyMount minHeight={820}><WritingSection /></LazyMount>
      </div>
      <div id="perspectives">
        <LazyMount minHeight={700}><PerspectivesSection /></LazyMount>
      </div>
      <div id="crypto">
        <LazyMount minHeight={900}><CryptoSection /></LazyMount>
      </div>
      {/* EarthSection keeps its own id="earth" (set on the <section> tag).
          It also already lazy-mounts the heavy SplineEarth scene internally,
          so wrapping it again would be redundant. */}
      <EarthSection />
      <div id="footer">
        <LazyMount minHeight={400}><FooterCTA /></LazyMount>
      </div>
    </>
  );
}
