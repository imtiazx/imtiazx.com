# CLAUDE.md -- imtiazx.ai portfolio

Read this file completely before touching any file in this repo.

---

## What this is

Personal portfolio for Md Imtiaz Ahmed Mollah, preferred name: Imtiaz.
Handle: imtiazx
Domain: imtiazx.ai
Target audience: senior engineers and hiring managers at product companies.
The site must feel premium, engineered, and intentional -- not like a template.

---

## Stack

- Framework: Next.js 14 App Router
- Styling: Tailwind CSS plus CSS custom properties for design tokens
- Animation: Framer Motion + GSAP 3.15 (free, all plugins included)
- Audio: Howler.js
- Icons: Lucide React (SVG only, never emoji)
- Fonts:
  - DM Serif Display (--font-serif): section headings
  - DM Sans (--font-sans): body text, UI
  - JetBrains Mono (--font-mono): code, tags, technical labels
  - Geist Sans (--font-display): hero identity text only
  - All from Google Fonts / geist npm package
- Deployment: Vercel free tier

---

## Hard rules

Never use em-dashes anywhere in code, content, or comments.
Never use emojis anywhere.
Never hardcode content inside components -- all content comes from lib/.
Never invent new color values -- use CSS custom properties from globals.css only.
Run npm run build before considering any task complete.
Test all three themes (light, dark, system) after every UI change.
Test audio toggle in all three states after any audio-related change.
Verify prefers-reduced-motion disables all animation.

---

## Brand colors

Primary brand: --color-brand (#EA580C in light, #FB923C in dark)
Use --color-brand everywhere purple was used previously.
Never use hardcoded hex values except in:
- EarthSection.tsx background (#0C1A0E) -- intentional fixed dark
- PerspectivesSection.tsx background (#1C1412) -- intentional fixed dark
These two are documented with comments in those files.

---

## Three-theme system

Themes: light (default), dark, system
Implementation: .dark class on html element
Persistence: localStorage key "theme"
First visit with no stored preference: use "light" (not system)
Toggle in nav cycles: light > dark > system > light

---

## Audio system

Three states: ambient | interactive | mute
Default state: interactive
Toggle in nav cycles through states in order
All audio files in /public/audio/
Managed by Howler.js + Web Audio API for click sounds
Volume cap on ambient music: 0.15

---

## Navigation

Nav links (left to right): Lab | Signal | Stack | About | Earth
Earth is a button (not a Link) that smooth-scrolls to id="earth" on homepage.
Earth nav item only visible when pathname === "/"
No GitHub or LinkedIn in nav -- those live on the About page only.
Logo: "imtiaz" in --color-text-primary + "x" in --color-brand, no dot.

---

## Page loader

components/ui/PageLoader.tsx fires on every hard page load (no sessionStorage gate).
Typewriter sequence: Hello, こんにちは, Bonjour, Hallo, 你好, Hej, Ciao, 안녕하세요, Olá, নমস্কার
Then types: imtiazx (x renders in --color-brand)
Uses Intl.Segmenter for grapheme-aware typing.
Font: JetBrains Mono (--font-mono)
Total duration: ~6.8 seconds. Reduced-motion: 650ms.

---

## Homepage section order

1. Hero (no metrics bar)
2. ProjectsSection
3. HackathonsSection
4. IdentitySection
5. PerspectivesSection
6. WritingSection
7. EarthSection (id="earth")
8. FooterCTA

MetricsBar component exists but is NOT on homepage. Reserved for About page.

---

## Hero section design

Editorial, minimal, cinematic. Not startup SaaS.
Font: Geist Sans (--font-display)
Three identity lines:
  "Data Scientist by origin."
  "Generative AI Engineer by evolution."
  "Forward Deployed Engineer by trajectory."
Role titles: weight 500, --color-text-primary
"by": weight 300, --color-text-muted
Progression words (origin/evolution/trajectory): weight 500, --color-brand at 0.9 opacity
Philosophy line: "I work at the intersection of AI research prototypes, production systems, and human chaos."
Two CTAs: "View the Lab" (primary brand) + "Read Signal" (ghost)
No metrics, no stats, no scroll indicator, no magnetic hover, no WebGL canvas.
Background: existing ScrollBackground math symbols at very low opacity only.

---

## Project status types

Production -- live, deployed (teal badge)
Development -- actively being built (brand orange badge)
Ideation -- planned (amber badge)

---

## Content files (single source of truth)

lib/projects.ts -- 6 projects (RAGScope=Production, DocuAgent=Development, 4x Ideation)
lib/posts.ts -- 5 writing posts
lib/stack.ts -- tech grouped by 5 categories, each item has proficiency + note
lib/person.ts -- bio, metrics, identity cards, social links, preferredName
lib/hackathons.ts -- Active (Rogii Wellbore #115) + Completed (LangFlow 3rd)
lib/opinions.ts -- 5 perspective cards

Never hardcode any of this data in components.

---

## Directory structure

imtiazx.ai/
  CLAUDE.md
  package.json
  tailwind.config.ts
  app/
    layout.tsx          root layout, providers, PageLoader, ScrollProgress,
                        PageTransition, CustomCursor, Nav, Footer
    globals.css         all CSS custom properties and base styles
    page.tsx            homepage (8 sections listed above)
    lab/page.tsx        Projects + Hackathons + Open Source tabs
    signal/page.tsx     Articles + Perspectives tabs
    stack/page.tsx      Tech categories with proficiency bars
    about/page.tsx      Bio + GitHub/LinkedIn + Timeline + Right Now
    not-found.tsx       404 with static Tux penguin
  components/
    layout/
      Nav.tsx           sticky glass nav, theme/audio toggles
      Footer.tsx
      PageTransition.tsx route fade with transition sound
    ui/
      PageLoader.tsx    typewriter greeting loader (fires every hard load)
      ScrollProgress.tsx homepage scroll progress bar
      ProjectCard.tsx
      PostCard.tsx
      StatusBadge.tsx
      ChipTag.tsx
      CustomCursor.tsx  GSAP quickTo dual-ring cursor
      ScrollReveal.tsx  fadeUp/fadeIn/wordReveal/scramble variants
    sections/
      Hero.tsx          editorial identity text (Geist Sans)
      MetricsBar.tsx    count-up metrics (not on homepage, available for About)
      ProjectsSection.tsx
      IdentitySection.tsx
      WritingSection.tsx
      HackathonsSection.tsx
      PerspectivesSection.tsx  dark band #1C1412
      EarthSection.tsx         dark section #0C1A0E + GSAP Tux scene
      FooterCTA.tsx
      ScrollBackground.tsx     5-zone math/neural/dot/wave/glow background
    providers/
      ThemeProvider.tsx
      AudioProvider.tsx
  lib/
    projects.ts
    posts.ts
    stack.ts
    person.ts
    hackathons.ts
    opinions.ts
  public/
    audio/
      ambient.mp3 (placeholder)
      click.mp3 (placeholder)
      hover.mp3 (placeholder)
      transition.mp3 (placeholder)
      toggle.mp3 (placeholder)

---

## Key technical decisions (do not reverse these)

- GSAP context pattern: gsap.context() owns only GSAP work.
  DOM event listeners (mousemove, etc.) are attached outside gsap.context()
  and cleaned up separately in useEffect return.
  Never nest removeEventListener inside ctx.add() -- this causes TDZ errors.
- CustomCursor: GSAP quickTo dual-ring. Outer ring (32px, 1.5px border) 
  duration 0.5, inner dot (6px filled) duration 0.1. mix-blend-mode: difference
  on text hover.
- PageLoader: pure React state + setTimeout. No GSAP, no Framer Motion.
  Grapheme-aware via Intl.Segmenter.
- ScrollReveal TDZ fix: IntersectionObserver created outside gsap.context().
  Cleanup in useEffect return calls io.disconnect() and ctx.revert() separately.
- Theme default: "light" on first visit, never "system" by default.
- Audio click: Web Audio API singleton (AudioContext ref, lazy init).
- Earth + Perspectives sections: hardcoded dark backgrounds regardless of theme.
  This is intentional and documented with comments in those files.

---

## Social links

GitHub: https://github.com/imtiazx
LinkedIn: https://www.linkedin.com/in/imtiazx
Hashnode: https://blog.imtiaz.dev
These live in lib/person.ts and are never hardcoded in components.
GitHub + LinkedIn shown on About page only (not in nav).

---

## Pages summary

/lab -- Lab: Projects (status filter) + Hackathons + Open Source tabs
/signal -- Signal: Articles (category filter) + Perspectives tabs
/stack -- Stack: all tech categories, proficiency bars, usage notes
/about -- About: Bio + social links + terminal CodeBlock + Timeline + Right Now cards
/not-found -- 404: "Lost in the stack." + static Tux + Back to Lab

---

## Modular extension pattern

Projects: add to lib/projects.ts only
Posts: add to lib/posts.ts only
Stack items: add to lib/stack.ts only
New UI component: components/ui/
New page section: components/sections/
New page: app/[pagename]/page.tsx

---

## Local dev

npm install
npm run dev

Always run npm run build before finishing any task.
Always fix all TypeScript errors before reporting complete.