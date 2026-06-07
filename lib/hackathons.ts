export type HackathonStatus = "Active" | "Completed";

export interface Hackathon {
  id: string;
  name: string;
  platform: string;
  platformUrl: string;
  status: HackathonStatus;
  rank?: number;
  totalParticipants?: number;
  placement?: string;
  description: string;
  updatedAt: string;
  // Link to the competition page only (never a result/ranking URL). null when
  // there is no public page yet -- the card renders a greyed placeholder.
  competitionUrl: string | null;
  tags: string[];
}

export const hackathons: Hackathon[] = [
  {
    id: "rogii-wellbore",
    name: "Wellbore Geology Prediction",
    platform: "Kaggle",
    platformUrl: "https://kaggle.com",
    status: "Active",
    rank: 276,
    totalParticipants: 0,
    placement: "Top 10%",
    description:
      "Predicting wellbore geology from drilling parameters and sensor data. Tabular ML competition with geoscience domain complexity.",
    updatedAt: "2026-06-07",
    competitionUrl: "https://www.kaggle.com/competitions/rogii-wellbore-geology-prediction",
    tags: ["Tabular ML", "Geoscience", "Feature Engineering", "XGBoost"],
  },
  {
    id: "langflow-global",
    name: "LangFlow Global Hackathon",
    platform: "LangFlow",
    platformUrl: "https://langflow.org",
    status: "Completed",
    placement: "3rd place",
    description:
      "Built a multi-agent orchestration system for dynamic task decomposition. Placed 3rd globally.",
    updatedAt: "2024-06-01",
    competitionUrl: null,
    tags: ["LangFlow", "Multi-agent", "Orchestration", "Python"],
  },
];
