// "Origins" album: early AI art experiments from 2022, before image-gen
// went mainstream. Currently a single album with two pieces — a vertical
// generative reel and a horizontal still. Add more pieces by extending
// the `pieces` array, or add a second album by appending to `albums`.

export type ExperimentMediaKind = "video" | "image";

export interface ExperimentMedia {
  kind: ExperimentMediaKind;
  src: string;
  poster?: string;        // video only: first-frame still
  width: number;
  height: number;
  alt: string;
}

export interface ExperimentPiece {
  id: string;
  title: string;
  subtitle: string;       // one short line under the title
  description: string;
  date: string;           // human-readable display date
  media: ExperimentMedia;
  sourceUrl: string;
  sourceLabel: string;    // e.g. "View on Instagram"
}

export interface ExperimentAlbum {
  id: string;
  title: string;
  subtitle: string;
  pieces: ExperimentPiece[];
}

export const albums: ExperimentAlbum[] = [
  {
    id: "origins",
    title: "Origins",
    subtitle:
      "Early AI art experiments. Made in 2022, before image-gen went mainstream.",
    pieces: [
      {
        id: "pre-prompt",
        title: "Pre-Prompt",
        subtitle: "Shine@AI 2022 · Generative reel",
        description:
          "Cycled through StyleGAN and a handful of other architectures before landing on early diffusion guided by CLIP. Selected for AI Hub Q2 Townhall: Shine@AI, played to a 1,000+ audience of engineers and researchers, online and offline.",
        date: "Created Q2 2022 · Published to Instagram Dec 2022",
        media: {
          kind: "video",
          src: "/experiments/shine-ai-2022.mp4",
          poster: "/experiments/shine-ai-2022-poster.webp",
          width: 720,
          height: 1280,
          alt: "Pre-Prompt generative reel: a continuous AI-generated motion piece from 2022, shown at the AI Hub Shine@AI townhall.",
        },
        sourceUrl: "https://www.instagram.com/p/CmOIoOVDO9w/",
        sourceLabel: "View on Instagram (Dec 2022)",
      },
      {
        id: "art001-dancing-woman",
        title: "Art001: Dancing Woman",
        subtitle: "First AI art · May 31, 2022",
        description:
          "One of my first pieces created by artificial intelligence. Made when generative imagery was still a niche research curiosity, not a product category.",
        date: "Created and published May 31, 2022",
        media: {
          kind: "image",
          src: "/experiments/dancing-woman-with-colours.jpg",
          width: 1228,
          height: 735,
          alt: "Art001: Dancing Woman — an early AI-generated still of a dancing figure surrounded by colour, made in May 2022.",
        },
        sourceUrl: "https://www.instagram.com/p/CeOyX4bP6i_/",
        sourceLabel: "View on Instagram (May 2022)",
      },
    ],
  },
];
