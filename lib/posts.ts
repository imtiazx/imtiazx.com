export type PostCategory =
  | "technical"
  | "responsible-ai"
  | "strategy"
  | "research";

export interface Post {
  id: string;
  title: string;
  category: PostCategory;
  slug: string;
  excerpt: string;
  publishedAt: string;
}

export const posts: Post[] = [
  {
    id: "rag-production",
    title: "Building RAG Systems That Hold Up in Production",
    category: "technical",
    slug: "building-rag-systems-that-hold-up-in-production",
    excerpt:
      "A practical breakdown of the architectural decisions, eval strategies, and failure modes that separate prototype RAG from production RAG.",
    publishedAt: "2025-01-01",
  },
  {
    id: "red-teaming-enterprise-llms",
    title: "Red-Teaming Enterprise LLMs: Lessons from the Field",
    category: "responsible-ai",
    slug: "red-teaming-enterprise-llms-lessons-from-the-field",
    excerpt:
      "What I found after running structured adversarial evaluations against LLMs deployed in high-stakes enterprise workflows.",
    publishedAt: "2025-01-01",
  },
  {
    id: "why-enterprise-ai-fails",
    title: "Why Most Enterprise AI Projects Fail Before Launch",
    category: "strategy",
    slug: "why-most-enterprise-ai-projects-fail-before-launch",
    excerpt:
      "The patterns I see repeatedly when AI initiatives stall at POC, and the upstream decisions that determine whether a project ships.",
    publishedAt: "2025-01-01",
  },
  {
    id: "beyond-benchmarks",
    title: "Beyond Benchmarks: Evaluating LLMs for Real-World Tasks",
    category: "research",
    slug: "beyond-benchmarks-evaluating-llms-for-real-world-tasks",
    excerpt:
      "A critical look at why standard LLM benchmarks diverge from task performance, and how to build evaluation pipelines that actually predict production quality.",
    publishedAt: "2025-01-01",
  },
  {
    id: "agentic-pipelines-production",
    title: "Agentic Pipelines: From Demo to Production",
    category: "technical",
    slug: "agentic-pipelines-from-demo-to-production",
    excerpt:
      "The engineering gaps between a compelling agent demo and a system you can deploy, monitor, and trust in a production environment.",
    publishedAt: "2025-01-01",
  },
];
