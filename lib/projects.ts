export type ProjectStatus = "Production" | "Development" | "Ideation";

export interface ProjectLinks {
  live: string | null;
  code: string | null;
  trailer: string | null;
  docs: string | null;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  status: ProjectStatus;
  origin: string;
  description: string;
  tags: string[];
  accentColor: string;
  links: ProjectLinks;
  // When set, hovering the card opens a cursor-following preview panel that
  // crossfades through these images. Paths are public/ relative.
  showcaseImages?: string[];
}

export const projects: Project[] = [
  {
    id: "ragscope",
    title: "RAGScope",
    subtitle: "Benchmarking harness for RAG retrieval strategies.",
    status: "Production",
    origin: "Open source",
    description:
      "Upload a corpus, run it through 4 retrieval strategies (Naive, HyDE, Multi-query, Hybrid BM25 + dense), and see which wins on faithfulness, context utilization, and answer relevancy. Deterministic eval pipeline, not an agent.",
    tags: ["FastAPI", "Next.js", "pgvector", "RAGAS", "OpenAI", "Supabase"],
    accentColor: "var(--color-teal)",
    links: {
      live: "https://ragscope.vercel.app",
      code: "https://github.com/imtiazx/ragscope",
      trailer: null,
      docs: "https://github.com/imtiazx/ragscope/blob/main/docs/RAGScope_Reference.pdf",
    },
    showcaseImages: [
      "/projects/ragscope/01-overview.jpg",
      "/projects/ragscope/02-strategies.jpg",
      "/projects/ragscope/03-metrics.jpg",
      "/projects/ragscope/04-chat.jpg",
    ],
  },
  {
    id: "docuagent",
    title: "DocuAgent",
    subtitle: "Enterprise document processing that delivered 75% effort reduction",
    status: "Development",
    origin: "Client engagement",
    description:
      "A multi-modal document processing pipeline for enterprise clients that extracts, classifies, and synthesizes information from complex PDFs, spreadsheets, and scanned documents. Delivered a 75% reduction in manual review effort across the target workflow.",
    tags: ["Python", "FastAPI", "GPT-4o", "RAG", "Enterprise", "Unstructured"],
    accentColor: "var(--color-blue)",
    links: { live: null, code: null, trailer: null, docs: null },
  },
  {
    id: "langflow-multi-agent",
    title: "LangFlow Multi-Agent System",
    subtitle: "3rd place at the LangFlow global hackathon",
    status: "Ideation",
    origin: "Hackathon",
    description:
      "A multi-agent orchestration system built on LangFlow that enables collaborative task decomposition across specialized sub-agents. Earned 3rd place in the LangFlow global hackathon for its approach to dynamic agent routing and shared memory.",
    tags: ["LangFlow", "Python", "Multi-agent", "Orchestration", "OpenAI"],
    accentColor: "var(--color-purple)",
    links: { live: null, code: null, trailer: null, docs: null },
  },
  {
    id: "bias-probe",
    title: "BiasProbe",
    subtitle: "Automated bias detection and safety evaluation for deployed LLMs",
    status: "Ideation",
    origin: "Open source",
    description:
      "A CLI and Python library for running structured bias audits, demographic parity checks, and red-team scenarios against any LLM API. Designed for responsible AI teams who need reproducible, audit-ready evidence of safety evaluation.",
    tags: ["Python", "Safety", "Red-teaming", "Bias", "Governance", "CLI"],
    accentColor: "var(--color-coral)",
    links: { live: null, code: null, trailer: null, docs: null },
  },
  {
    id: "agent-forge",
    title: "AgentForge",
    subtitle: "Composable agentic workflow builder for production reliability",
    status: "Ideation",
    origin: "Side project",
    description:
      "A framework for assembling production-grade agentic pipelines with built-in retry logic, structured output validation, cost tracking, and observability hooks. Targets teams moving from LangChain notebooks to maintainable, deployed agents.",
    tags: ["LangGraph", "Python", "Agents", "OpenAI", "Observability", "TypeScript"],
    accentColor: "var(--color-amber)",
    links: { live: null, code: null, trailer: null, docs: null },
  },
  {
    id: "ai-governance-lens",
    title: "AI Governance Lens",
    subtitle: "Real-time monitoring dashboard for deployed AI systems",
    status: "Ideation",
    origin: "Open source",
    description:
      "A monitoring dashboard that tracks model drift, bias metric trends, and policy compliance across an organization's deployed AI systems. Built for AI governance teams who need live visibility into production model behavior without a data team.",
    tags: ["Python", "Streamlit", "Monitoring", "Governance", "Drift", "Compliance"],
    accentColor: "var(--color-green)",
    links: { live: null, code: null, trailer: null, docs: null },
  },
];
