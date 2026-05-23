export type OpinionPlatform = "X" | "Hashnode" | "Blog";

export interface Opinion {
  id: string;
  title: string;
  oneliner: string;
  platform: OpinionPlatform;
  url: string;
  publishedAt: string;
  tags: string[];
}

export const opinions: Opinion[] = [
  {
    id: "nuclear-energy",
    title: "Nuclear energy is the only honest answer to AI's power problem.",
    oneliner:
      "Every GPU cluster we spin up is an argument for nuclear. The math is not subtle.",
    platform: "X",
    url: "#",
    publishedAt: "2025-01-01",
    tags: ["Energy", "AI Infrastructure", "Climate"],
  },
  {
    id: "ai-compute-demand",
    title: "The more compute AI demands, the more we owe the grid a rethink.",
    oneliner:
      "We are building intelligence on top of an energy system that was not designed for this. Something has to give.",
    platform: "X",
    url: "#",
    publishedAt: "2025-01-01",
    tags: ["AI", "Energy", "Infrastructure"],
  },
  {
    id: "linux-philosophy",
    title: "Linux proved that open beats closed. Every time.",
    oneliner:
      "The most critical infrastructure on earth runs on code anyone can read. That is not an accident.",
    platform: "X",
    url: "#",
    publishedAt: "2025-01-01",
    tags: ["Open Source", "Linux", "Philosophy"],
  },
  {
    id: "open-information",
    title: "Information wants to be free. Paywalls are a historical accident.",
    oneliner:
      "Knowledge locked behind payment is knowledge that compounds inequality. We built the internet for this.",
    platform: "X",
    url: "#",
    publishedAt: "2025-01-01",
    tags: ["Open Access", "Information", "Philosophy"],
  },
  {
    id: "engineering-discipline",
    title: "The best engineers think like scientists and build like craftsmen.",
    oneliner:
      "Curiosity gets you to the problem. Discipline gets you to production. You need both.",
    platform: "X",
    url: "#",
    publishedAt: "2025-01-01",
    tags: ["Engineering", "Craft", "Mindset"],
  },
];
