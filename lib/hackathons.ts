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
  // Optional public repo for the submission. Rendered as a secondary "View code" link.
  repoUrl?: string;
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
    name: "AI Devs India: LangFlow Challenge",
    platform: "LangFlow",
    platformUrl: "https://langflow.org",
    status: "Completed",
    placement: "3rd of 12,000+",
    totalParticipants: 12000,
    description:
      "Implemented advanced prompt engineering techniques within LangFlow workflows, competing against 12,000+ participants across India in a live AI engineering challenge. Prize: ₹25,000.",
    updatedAt: "2024-06-01",
    competitionUrl: "https://www.crowdcast.io/c/challenge-2-ai-devs",
    tags: ["LangFlow", "Prompt Engineering", "Workflows", "AI Engineering"],
  },
  {
    id: "bridgei2i-cv",
    name: "BRIDGEi2i Internal Kaggle: Computer Vision",
    platform: "Kaggle",
    platformUrl: "https://kaggle.com",
    status: "Completed",
    placement: "1st place",
    description:
      "Won 1st place by building a YOLOv4 transfer learning model to extract algebraic expressions from images. Deployed as a Streamlit app and presented at internal townhall. Prize: ₹50,000.",
    updatedAt: "2021-01-01",
    competitionUrl: "https://www.kaggle.com/competitions/computer-vision-1",
    repoUrl: "https://github.com/imtiazx/Extracting-Arithmetic-Expression-using-YOLO",
    tags: ["YOLOv4", "Computer Vision", "Transfer Learning", "Streamlit"],
  },
];
