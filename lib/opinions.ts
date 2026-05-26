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
  // Placeholder perspectives -- realistic dummy takes to fill the carousel.
  {
    id: "evals-are-tests",
    title: "Evals are the new unit tests. Skip them and you are shipping vibes.",
    oneliner:
      "If you cannot measure a regression, you cannot claim an improvement. Build the harness before the demo.",
    platform: "Hashnode",
    url: "#",
    publishedAt: "2025-01-01",
    tags: ["Evaluation", "Testing", "LLMOps"],
  },
  {
    id: "agents-are-retries",
    title: "Most 'agents' are just retries with extra steps and a bigger bill.",
    oneliner:
      "Autonomy is not a feature you bolt on. Earn it with tight tools, hard stops, and ruthless evals.",
    platform: "X",
    url: "#",
    publishedAt: "2025-01-01",
    tags: ["Agents", "Architecture", "Cost"],
  },
  {
    id: "rag-not-dead",
    title: "RAG is not dead. Your chunking strategy is.",
    oneliner:
      "Bigger context windows do not absolve lazy retrieval. Garbage in, confidently wrong out.",
    platform: "Blog",
    url: "#",
    publishedAt: "2025-01-01",
    tags: ["RAG", "Retrieval", "Context"],
  },
  {
    id: "finetuning-tax",
    title: "Fine-tuning is the tax you pay when your prompt and retrieval are lazy.",
    oneliner:
      "Exhaust prompting and context engineering first. Most teams reach for weights when they should reach for data.",
    platform: "X",
    url: "#",
    publishedAt: "2025-01-01",
    tags: ["Fine-tuning", "Prompting", "Pragmatism"],
  },
  {
    id: "latency-is-a-feature",
    title: "Latency is a feature. Nobody waits ten seconds to feel the magic.",
    oneliner:
      "Streaming, caching, and smaller models beat a marginally smarter answer that arrives too late to matter.",
    platform: "Hashnode",
    url: "#",
    publishedAt: "2025-01-01",
    tags: ["Latency", "UX", "Inference"],
  },
];
