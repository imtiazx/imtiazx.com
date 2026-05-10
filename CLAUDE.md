# CLAUDE.md — imtiazx.ai portfolio

Read this file completely before touching any file in this repo.

---

## What this is

Personal portfolio for Md Imtiaz Ahmed Mollah.
Target audience: senior engineers and hiring managers at product companies.
The site must feel premium, engineered, and intentional -- not like a template.

---

## Stack

- Framework: Next.js 14 App Router
- Styling: Tailwind CSS plus CSS custom properties for design tokens
- Animation: Framer Motion
- Audio: Howler.js
- Icons: Lucide React (SVG only, never emoji)
- Fonts: DM Serif Display, DM Sans, JetBrains Mono (all from Google Fonts)
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

## Three-theme system

Themes: light (default), dark, system
Implementation: .dark class on html element
Persistence: localStorage key "theme"
First visit with no stored preference: read prefers-color-scheme
Toggle in nav cycles: light > dark > system > light

---

## Audio system

Three states: ambient (music + UI sounds), interactive (UI sounds only), mute
Default state: interactive
Toggle in nav cycles through states in order
All audio files in /public/audio/
Managed by Howler.js
Volume cap on ambient music: 0.15 (15%)
Audio must respect OS mute setting via Howler's onfade callbacks

UI sound events:
- Button click: /public/audio/click.mp3
- Card hover: /public/audio/hover.mp3
- Page transition: /public/audio/transition.mp3
- Theme toggle: /public/audio/toggle.mp3

---

## Project status types

Production -- live, deployed, publicly usable (teal badge)
Development -- actively being built (purple badge)
Ideation -- planned, not started (amber badge)

---

## Content files (single source of truth)

lib/projects.ts -- all 6 projects, typed Project interface
lib/posts.ts -- all writing posts, typed Post interface
lib/stack.ts -- tech stack grouped by category
lib/person.ts -- bio, metrics, identity cards, social links

Never hardcode any of this data in components.

---

## Directory structure

imtiazx.ai/
  CLAUDE.md
  package.json
  tailwind.config.ts
  app/
    layout.tsx         root layout, theme + audio providers
    globals.css        all CSS custom properties and base styles
    page.tsx           homepage
    work/
      page.tsx
    writing/
      page.tsx
    stack/
      page.tsx
    about/
      page.tsx
  components/
    layout/
      Nav.tsx          sticky nav, theme toggle, audio toggle
      Footer.tsx
    ui/
      ProjectCard.tsx  card with status badge and 4 link buttons
      PostCard.tsx
      StatusBadge.tsx
      ChipTag.tsx
      CustomCursor.tsx
    sections/
      Hero.tsx
      MetricsBar.tsx
      ProjectsSection.tsx
      IdentitySection.tsx
      WritingSection.tsx
      FooterCTA.tsx
    providers/
      ThemeProvider.tsx
      AudioProvider.tsx
  lib/
    projects.ts
    posts.ts
    stack.ts
    person.ts
  public/
    audio/
      ambient.mp3
      click.mp3
      hover.mp3
      transition.mp3
      toggle.mp3

---

## Adding a new project

Edit lib/projects.ts only. Add a new object to the projects array.
The UI auto-renders it. No other file changes needed.

## Adding a new page section

Create a new component in components/sections/.
Import and place it in the relevant page.tsx.
Never put content or data inside the section component.

---

## Local dev

npm install
npm run dev

---

## Modular extension pattern

Projects: add to lib/projects.ts
Posts: add to lib/posts.ts
Stack items: add to lib/stack.ts
New UI component: components/ui/
New page section: components/sections/
New page: app/[pagename]/page.tsx

---

## Design tokens (use these, never invent new values)

Brand purple: var(--color-purple)
Accent teal: var(--color-teal)
Accent coral: var(--color-coral)
Accent amber: var(--color-amber)
Accent blue: var(--color-blue)
Accent green: var(--color-green)

---

## Content decisions

Domain: imtiazx.ai
Logo: imtiazx. (lowercase, purple dot after x)
Tagline: "I engineer AI systems from prototype to production."
Writing platform: Hashnode at blog.imtiaz.dev

Metrics bar (homepage):
- 4+ Years shipping production AI
- 25+ Enterprise GenAI studies
- 75% Effort reduction delivered
- 3rd LangFlow global hackathon

Identity cards (homepage):
- GenAI engineer: RAG systems, agentic pipelines, LLM APIs, production evals
- Responsible AI: bias auditing, safety evals, red-teaming, governance at scale
- Data scientist: statistical modeling, ML pipelines, experiment design
- System designer: API architecture, latency and cost tradeoffs, infra patterns
- AI consultant: translating business problems into deployed AI end to end
- Technical writer: deep-dive articles, open-source docs, public learning