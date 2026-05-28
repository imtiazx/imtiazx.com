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
- PerspectivesSection.tsx perspective card surfaces (fixed dark, matches Signal page)
These are documented with comments in those files.
PerspectivesSection.tsx section background is now theme-adaptive
(--color-surface-alt), reversed from fixed dark by product decision 2026-05-26.

---

## Three-theme system

Themes: light, dark, system (default)
Implementation: .dark class on html element
Persistence: localStorage key "theme"
Theme default: system on first visit
Toggle cycles: system > light > dark > system

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
2. ProjectsSection ("What I Build")
3. HackathonsSection ("What I Compete In")
4. IdentitySection ("What I Bring")
5. WritingSection ("What I Write")
6. PerspectivesSection ("What I Think")
7. EarthSection (id="earth")
8. FooterCTA

MetricsBar component exists but is NOT on homepage. Reserved for About page.

---

## Scroll narrative system (the story) -- PLANNED, not yet built

The homepage tells one continuous story. A single entity evolves from pure AI
into a human-AI hybrid and finally into a living world, transforming section by
section as the user scrolls. This is the spine of the site: every homepage
section carries one beat of that transformation, rendered as a scroll-driven
video frame sequence (Apple-style scrollytelling). The entity must flow
seamlessly. The last frame shown for one section must read as the natural
predecessor of the next section's first frame.

### Narrative beats (one per homepage section)

1. Hero -- AI brain on the RIGHT side of the hero, glowing in a slow rhythmic
   pulse.
2. ProjectsSection ("What I Build") -- the brain drifts from right to center
   screen; 6 arrows radiate from it, each pointing to a project card arranged
   around the brain.
3. HackathonsSection ("What I Compete In") -- a racing figure mid-stride:
   human body, AI/robot head.
4. IdentitySection ("What I Bring") -- the figure raises a hand that is half
   human, half machine; the 6 role titles float above the open hand.
5. WritingSection ("What I Write") -- the same hybrid hand now holds a pen and
   writes on paper that shows a chart.
6. PerspectivesSection ("What I Think") -- fully human now: a person thinking,
   seen from an angle, face obscured by low light.
7. EarthSection (id="earth") -- opens into a living world: greenery and
   icebergs, multiple shifting vistas.

FooterCTA has no narrative frame.

Transformation arc: pure AI brain > AI-headed athlete > hybrid hand > writing
hybrid > human thinker > living earth. Continuity matters more than any single
frame. Keep the character, lighting, and palette consistent across the whole
arc so the cuts between sections feel like one shot.

### Asset pipeline

1. Generate stills -- Midjourney / DALL-E 3 / Flux, 7-10 stills per section,
   consistent character + lighting across the whole arc.
2. Animate -- Runway ML / Kling / Pika, short 3-5s clips per section.
3. Extract frames -- ffmpeg, one pass per clip into a numbered frame sequence.
4. Encode -- frames as WebP/AVIF, sized to delivery resolution; either an image
   sequence or one packed sprite sheet per section.
5. Wire up -- Claude Code writes the scroll-to-frame mapper: section scroll
   progress drives the frame index.

### Implementation rules (when built)

- Assets live in public/sequences/<section>/ (image sequence) or
  public/sequences/<section>.webp (sprite sheet). Never inline.
- Frame metadata (asset path, frame count, dimensions, alt text, beat label)
  lives in lib/narrative.ts. Never hardcoded in components. One entry per
  homepage section.
- Render through a single <canvas> layer. Preload + decode that section's
  frames before it enters view, then draw frame N with drawImage. Do not mount
  100+ <img> tags.
- Scroll-to-frame mapping: GSAP ScrollTrigger pinned per section with scrub;
  map section progress [0..1] to frame index [0..N-1]. Follow the existing GSAP
  context pattern (DOM listeners outside gsap.context(), revert in cleanup).
- prefers-reduced-motion: no scrubbing. Render one static representative frame
  per section instead.
- Keep frame counts modest (target ~60-120 frames/section) and lazy-load per
  section to protect Vercel free-tier bandwidth and first paint.
- The narrative canvas is its own layer, separate from and above
  ScrollBackground. ScrollBackground math symbols stay at very low opacity
  behind it.

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
Identity text sits left/center. The RIGHT side hosts the scroll narrative's
opening beat: the glowing AI brain (see "Scroll narrative system").
No metrics, no stats, no scroll indicator, no magnetic hover, no WebGL canvas
(the narrative uses a 2D <canvas> frame player, not WebGL).
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
lib/narrative.ts -- scroll narrative config: one entry per homepage section
  (asset path, frame count, dimensions, alt text, beat label). PLANNED.

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
    narrative/                 PLANNED: scroll narrative system
      NarrativeCanvas.tsx      canvas frame player + scroll-to-frame mapper
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
    narrative.ts               PLANNED: per-section frame-sequence config
  public/
    audio/
      ambient.mp3 (placeholder)
      click.mp3 (placeholder)
      hover.mp3 (placeholder)
      transition.mp3 (placeholder)
      toggle.mp3 (placeholder)
    sequences/                 PLANNED: per-section frame sequences / sprite sheets

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
- Theme default: "system" on first visit. Toggle cycles system > light > dark > system.
- Audio click: Web Audio API singleton (AudioContext ref, lazy init).
- Earth section: hardcoded dark background regardless of theme (intentional,
  documented in the file). Perspectives section background is theme-adaptive
  (--color-surface-alt) as of 2026-05-26; its perspective cards keep fixed dark
  surfaces (matches Signal page).
- Scroll narrative (PLANNED): scroll position maps to a frame index, drawn on a
  single 2D <canvas> (no WebGL, no <video>). GSAP ScrollTrigger pinned per
  section with scrub; frames preloaded + decoded per section, never 100+ <img>.
  Reduced motion renders one static frame per section. See "Scroll narrative
  system" for the full beat list and asset pipeline.

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
Narrative frames: drop sequence in public/sequences/, register in lib/narrative.ts

---

## Local dev

npm install
npm run dev

Always run npm run build before finishing any task.
Always fix all TypeScript errors before reporting complete.