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
}

export const stack: StackItem[] = [
  // LLM & AI
  {
    name: "OpenAI API",
    category: "LLM & AI",
    description: "GPT-4o, embeddings, and function calling for production workloads",
  },
  {
    name: "Anthropic Claude",
    category: "LLM & AI",
    description: "Long-context reasoning and safety-oriented generation tasks",
  },
  {
    name: "LangChain",
    category: "LLM & AI",
    description: "RAG pipelines, document loaders, and retrieval chain composition",
  },
  {
    name: "LangGraph",
    category: "LLM & AI",
    description: "Stateful multi-step agent orchestration with cycle support",
  },
  {
    name: "LangFlow",
    category: "LLM & AI",
    description: "Visual multi-agent workflow builder (used in hackathon project)",
  },
  {
    name: "RAGAS",
    category: "LLM & AI",
    description: "Automated RAG evaluation metrics: faithfulness, recall, precision",
  },

  // Backend
  {
    name: "Python",
    category: "Backend",
    description: "Primary language for all AI engineering and data pipeline work",
  },
  {
    name: "FastAPI",
    category: "Backend",
    description: "Async REST APIs for serving LLM inference and orchestration endpoints",
  },
  {
    name: "Node.js",
    category: "Backend",
    description: "TypeScript-first backend services and Next.js API routes",
  },
  {
    name: "PostgreSQL",
    category: "Backend",
    description: "Relational store for structured application data and audit logs",
  },
  {
    name: "Redis",
    category: "Backend",
    description: "Caching layer for LLM responses and session state management",
  },

  // Frontend
  {
    name: "Next.js",
    category: "Frontend",
    description: "App Router, RSC, and SSG for this portfolio and client interfaces",
  },
  {
    name: "React",
    category: "Frontend",
    description: "Component model for interactive AI dashboards and tooling UIs",
  },
  {
    name: "TypeScript",
    category: "Frontend",
    description: "Strict typing across all frontend and shared library code",
  },
  {
    name: "Tailwind CSS",
    category: "Frontend",
    description: "Utility-first styling with design token integration",
  },
  {
    name: "Streamlit",
    category: "Frontend",
    description: "Rapid Python-native UIs for internal AI tools and demos",
  },

  // Data & Vector
  {
    name: "Pinecone",
    category: "Data & Vector",
    description: "Managed vector index for production RAG and semantic search",
  },
  {
    name: "Weaviate",
    category: "Data & Vector",
    description: "Open-source vector database for self-hosted retrieval workloads",
  },
  {
    name: "Pandas",
    category: "Data & Vector",
    description: "Data wrangling, profiling, and feature engineering pipelines",
  },
  {
    name: "dbt",
    category: "Data & Vector",
    description: "SQL transformation layer for structured analytics and reporting",
  },
  {
    name: "Unstructured",
    category: "Data & Vector",
    description: "Document parsing for PDFs, DOCX, and scanned image extraction",
  },

  // Infrastructure
  {
    name: "Docker",
    category: "Infrastructure",
    description: "Containerized deployments for reproducible AI service environments",
  },
  {
    name: "AWS",
    category: "Infrastructure",
    description: "EC2, S3, Lambda, and Bedrock for scalable cloud AI workloads",
  },
  {
    name: "Vercel",
    category: "Infrastructure",
    description: "Edge-optimized deployment for Next.js apps and serverless functions",
  },
  {
    name: "GitHub Actions",
    category: "Infrastructure",
    description: "CI/CD pipelines including automated eval runs on PR merge",
  },
  {
    name: "LangSmith",
    category: "Infrastructure",
    description: "LLM observability, tracing, and prompt version management",
  },
];
