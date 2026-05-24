export type StackCategory =
  | "LLM & AI"
  | "Backend"
  | "Frontend"
  | "Data & Vector"
  | "Infrastructure";

export interface StackItem {
  name: string;
  category: StackCategory;
  description: string;
  proficiency?: number;
  note?: string;
}

export const stack: StackItem[] = [
  // LLM & AI
  {
    name: "OpenAI API",
    category: "LLM & AI",
    description: "GPT-4o, embeddings, and function calling for production workloads",
    proficiency: 95,
    note: "Daily driver for embeddings, structured outputs, and function calling",
  },
  {
    name: "Anthropic Claude",
    category: "LLM & AI",
    description: "Long-context reasoning and safety-oriented generation tasks",
    proficiency: 90,
    note: "Long-context synthesis and safety-sensitive enterprise tasks",
  },
  {
    name: "LangChain",
    category: "LLM & AI",
    description: "RAG pipelines, document loaders, and retrieval chain composition",
    proficiency: 90,
    note: "RAG plumbing, loaders, and retrieval-chain composition",
  },
  {
    name: "LangGraph",
    category: "LLM & AI",
    description: "Stateful multi-step agent orchestration with cycle support",
    proficiency: 80,
    note: "Stateful multi-step agent graphs with cycles and checkpoints",
  },
  {
    name: "LangFlow",
    category: "LLM & AI",
    description: "Visual multi-agent workflow builder (used in hackathon project)",
    proficiency: 85,
    note: "Rapid agent prototyping; took 3rd at the global hackathon with it",
  },
  {
    name: "RAGAS",
    category: "LLM & AI",
    description: "Automated RAG evaluation metrics: faithfulness, recall, precision",
    proficiency: 80,
    note: "Faithfulness, recall, and answer-relevance metrics in CI",
  },

  // Backend
  {
    name: "Python",
    category: "Backend",
    description: "Primary language for all AI engineering and data pipeline work",
    proficiency: 95,
    note: "Primary language for every AI service and data pipeline I ship",
  },
  {
    name: "FastAPI",
    category: "Backend",
    description: "Async REST APIs for serving LLM inference and orchestration endpoints",
    proficiency: 85,
    note: "Async inference endpoints with strict pydantic schemas",
  },
  {
    name: "Node.js",
    category: "Backend",
    description: "TypeScript-first backend services and Next.js API routes",
    proficiency: 75,
    note: "TypeScript-first services and Next.js route handlers",
  },
  {
    name: "PostgreSQL",
    category: "Backend",
    description: "Relational store for structured application data and audit logs",
    proficiency: 80,
    note: "Structured app data, eval results, and audit logs",
  },
  {
    name: "Redis",
    category: "Backend",
    description: "Caching layer for LLM responses and session state management",
    proficiency: 70,
    note: "Response caches and short-lived session state",
  },

  // Frontend
  {
    name: "Next.js",
    category: "Frontend",
    description: "App Router, RSC, and SSG for this portfolio and client interfaces",
    proficiency: 80,
    note: "App Router, RSC, and SSG -- this site is built on it",
  },
  {
    name: "React",
    category: "Frontend",
    description: "Component model for interactive AI dashboards and tooling UIs",
    proficiency: 80,
    note: "Component model for dashboards and internal AI tooling",
  },
  {
    name: "TypeScript",
    category: "Frontend",
    description: "Strict typing across all frontend and shared library code",
    proficiency: 80,
    note: "Strict mode across the entire frontend and shared libs",
  },
  {
    name: "Tailwind CSS",
    category: "Frontend",
    description: "Utility-first styling with design token integration",
    proficiency: 85,
    note: "Utility-first styling layered over CSS custom-property tokens",
  },
  {
    name: "Streamlit",
    category: "Frontend",
    description: "Rapid Python-native UIs for internal AI tools and demos",
    proficiency: 75,
    note: "Same-day internal UIs for evals and stakeholder demos",
  },

  // Data & Vector
  {
    name: "Pinecone",
    category: "Data & Vector",
    description: "Managed vector index for production RAG and semantic search",
    proficiency: 85,
    note: "Managed vector index for production RAG and semantic search",
  },
  {
    name: "Weaviate",
    category: "Data & Vector",
    description: "Open-source vector database for self-hosted retrieval workloads",
    proficiency: 75,
    note: "Self-hosted alternative when data residency matters",
  },
  {
    name: "Pandas",
    category: "Data & Vector",
    description: "Data wrangling, profiling, and feature engineering pipelines",
    proficiency: 90,
    note: "Wrangling, profiling, and feature engineering for tabular ML",
  },
  {
    name: "dbt",
    category: "Data & Vector",
    description: "SQL transformation layer for structured analytics and reporting",
    proficiency: 70,
    note: "SQL transformation layer feeding analytics and eval rollups",
  },
  {
    name: "Unstructured",
    category: "Data & Vector",
    description: "Document parsing for PDFs, DOCX, and scanned image extraction",
    proficiency: 80,
    note: "Parsing messy PDFs, DOCX, and scanned images for ingestion",
  },

  // Infrastructure
  {
    name: "Docker",
    category: "Infrastructure",
    description: "Containerized deployments for reproducible AI service environments",
    proficiency: 80,
    note: "Reproducible service images across dev, CI, and prod",
  },
  {
    name: "AWS",
    category: "Infrastructure",
    description: "EC2, S3, Lambda, and Bedrock for scalable cloud AI workloads",
    proficiency: 75,
    note: "EC2, S3, Lambda, and Bedrock for cloud AI workloads",
  },
  {
    name: "Vercel",
    category: "Infrastructure",
    description: "Edge-optimized deployment for Next.js apps and serverless functions",
    proficiency: 85,
    note: "Edge-optimized hosting for everything Next.js I ship",
  },
  {
    name: "GitHub Actions",
    category: "Infrastructure",
    description: "CI/CD pipelines including automated eval runs on PR merge",
    proficiency: 80,
    note: "CI/CD with automated eval runs on every PR merge",
  },
  {
    name: "LangSmith",
    category: "Infrastructure",
    description: "LLM observability, tracing, and prompt version management",
    proficiency: 80,
    note: "Tracing, prompt versioning, and regression spotting in prod",
  },
];
