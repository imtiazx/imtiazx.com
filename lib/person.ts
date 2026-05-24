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
  email: string;
}

export interface Person {
  name: string;
  preferredName: string;
  handle: string;
  tagline: string;
  bio: string;
  metrics: Metric[];
  identityCards: IdentityCard[];
  social: Social;
}

export const person: Person = {
  name: "Md Imtiaz Ahmed Mollah",
  preferredName: "Imtiaz",
  handle: "imtiazx",
  tagline: "I engineer AI systems from prototype to production.",
  bio: "Imtiaz is an AI engineer at Accenture Industry X working on Generative AI R&D, where he builds RAG systems, agentic pipelines, and responsible AI evaluation tooling for enterprise deployment. His track record spans production rollouts across 25+ enterprise GenAI studies, open-source contributions to AI infrastructure, and podium finishes at global hackathons including 3rd place at LangFlow. He focuses on closing the gap between research prototypes and reliable, evaluated systems that engineering teams can actually ship.",
  metrics: [
    { value: "~5", label: "Years shipping production AI" },
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
    linkedin: "https://www.linkedin.com/in/imtiazx",
    email: "imtiaz0x1@gmail.com",
  },
};
