import dynamic from "next/dynamic";
import { Hero } from "@/components/sections/Hero";
import { EarthSection } from "@/components/sections/EarthSection";
import { ScrollBackground } from "@/components/sections/ScrollBackground";
import { SectionRail } from "@/components/ui/SectionRail";
import { LazyMount } from "@/components/ui/LazyMount";

// Below-the-fold sections are code-split into their own client chunks so the
// initial /home compile (dev) and JS payload (prod) only pay for the Hero +
// page-wide singletons. Each loading fallback mirrors its LazyMount reserve
// so there's no layout shift between the LazyMount minHeight, the chunk load,
// and the real section render.
const reserve = (h: number) => {
  const Reserve = () => <div style={{ minHeight: h }} />;
  Reserve.displayName = `Reserve(${h})`;
  return Reserve;
};
const ProjectsSection = dynamic(
  () => import("@/components/sections/ProjectsSection").then((m) => m.ProjectsSection),
  { loading: reserve(780) },
);
const HackathonsSection = dynamic(
  () => import("@/components/sections/HackathonsSection").then((m) => m.HackathonsSection),
  { loading: reserve(620) },
);
const IdentitySection = dynamic(
  () => import("@/components/sections/IdentitySection").then((m) => m.IdentitySection),
  { loading: reserve(820) },
);
const WritingSection = dynamic(
  () => import("@/components/sections/WritingSection").then((m) => m.WritingSection),
  { loading: reserve(820) },
);
const PerspectivesSection = dynamic(
  () => import("@/components/sections/PerspectivesSection").then((m) => m.PerspectivesSection),
  { loading: reserve(700) },
);
const CryptoSection = dynamic(
  () => import("@/components/sections/CryptoSection").then((m) => m.CryptoSection),
  { loading: reserve(900) },
);
const FooterCTA = dynamic(
  () => import("@/components/sections/FooterCTA").then((m) => m.FooterCTA),
  { loading: reserve(400) },
);

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
