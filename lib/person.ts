export interface Metric {
  value: string;
  label: string;
}

export interface IdentityCard {
  title: string;
  description: string;
}

export interface Social {
  github: string;
  hashnode: string;
  linkedin: string;
}

export interface Person {
  name: string;
  handle: string;
  tagline: string;
  bio: string;
  metrics: Metric[];
  identityCards: IdentityCard[];
  social: Social;
}

export const person: Person = {
  name: "Md Imtiaz Ahmed Mollah",
  handle: "imtiazx",
  tagline: "I engineer AI systems from prototype to production.",
  bio: "Md Imtiaz Ahmed Mollah is an AI engineer with over four years of experience shipping production AI systems across enterprise and startup environments. At Accenture, he led responsible AI initiatives spanning bias auditing, safety evaluations, and governance frameworks for large-scale GenAI deployments across 25+ enterprise studies. He now focuses on open-source AI tooling, building frameworks that make production-grade RAG and agentic systems accessible to engineering teams worldwide.",
  metrics: [
    { value: "4+", label: "Years shipping production AI" },
    { value: "25+", label: "Enterprise GenAI studies" },
    { value: "75%", label: "Effort reduction delivered" },
    { value: "3rd", label: "LangFlow global hackathon" },
  ],
  identityCards: [
    {
      title: "GenAI Engineer",
      description: "RAG systems, agentic pipelines, LLM APIs, production evals",
    },
    {
      title: "Responsible AI",
      description: "Bias auditing, safety evals, red-teaming, governance at scale",
    },
    {
      title: "Data Scientist",
      description: "Statistical modeling, ML pipelines, experiment design",
    },
    {
      title: "System Designer",
      description: "API architecture, latency and cost tradeoffs, infra patterns",
    },
    {
      title: "AI Consultant",
      description: "Translating business problems into deployed AI end to end",
    },
    {
      title: "Technical Writer",
      description: "Deep-dive articles, open-source docs, public learning",
    },
  ],
  social: {
    github: "https://github.com/imtiazx",
    hashnode: "https://blog.imtiaz.dev",
    linkedin: "",
  },
};
