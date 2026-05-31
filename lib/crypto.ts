export interface CryptoStat {
  value: string;
  label: string;
  caption: string;
}

export interface CryptoSpecialty {
  title: string;
  bullets: string[];
}

export interface CryptoTweet {
  id: string;
  author: string;
  handle: string;
  content: string;
  publishedAt: string;
  metrics: { replies: number; retweets: number; likes: number };
}

export const cryptoStats: CryptoStat[] = [
  {
    value: "8+",
    label: "Years on-chain",
    caption: "Active since 2018, across two full market cycles.",
  },
  {
    value: "L1, L2, DeFi, RWA, DePIN, NFTs",
    label: "Coverage",
    caption: "Cross-sector reading from base layers to real-world assets.",
  },
  {
    value: "2",
    label: "Market cycles",
    caption: "Lived through bull, bear, and the long sideways in between.",
  },
  {
    value: "15+",
    label: "Testnets shaped",
    caption: "Early-tester feedback on UX and protocol mechanics.",
  },
];

export const cryptoSpecialties: CryptoSpecialty[] = [
  {
    title: "Ecosystem Research",
    bullets: [
      "Protocol whitepapers and tokenomics models",
      "Team backgrounds and VC backing",
      "On-chain metrics and developer activity",
    ],
  },
  {
    title: "Portfolio Construction",
    bullets: [
      "Core (BTC, ETH), satellite (L1 challengers, L2s)",
      "Speculative early-stage protocols with testnet activity",
      "Position sizing by conviction tier",
    ],
  },
  {
    title: "Market Cycle Management",
    bullets: [
      "Stablecoin allocation in bear markets",
      "DCA strategies across volatility regimes",
      "Bear and bull playbooks",
    ],
  },
  {
    title: "Red Flag Detection",
    bullets: [
      "Unsustainable APY structures",
      "Anonymous teams with no track record",
      "Token unlock schedules designed to dump on retail",
      "Liquidity pool manipulation patterns",
    ],
  },
  {
    title: "Community Analysis",
    bullets: [
      "Twitter sentiment, Discord activity quality",
      "Governance participation rates as signal",
      "Protocol health indicators",
    ],
  },
  {
    title: "On-chain Data",
    bullets: [
      "Wallet tracking, exchange flow analysis",
      "Large holder behavior, smart money following",
      "Real-time market structure monitoring",
    ],
  },
];

// Placeholder tweets where third-party crypto accounts mention or feature
// @Web3Gen0. Real quotes get swapped in here as they're confirmed.
export const cryptoTweets: CryptoTweet[] = [
  {
    id: "t1",
    author: "Polymarket",
    handle: "Polymarket",
    content:
      "Shout out to early testers like @Web3Gen0 who pressure-tested market creation flow back in beta. Builders remember the people who showed up first.",
    publishedAt: "2026-04-19",
    metrics: { replies: 84, retweets: 320, likes: 2400 },
  },
  {
    id: "t2",
    author: "DefiIgnas",
    handle: "DefiIgnas",
    content:
      "If you want clean takes on L2 economics without the shill, @Web3Gen0 has been quietly putting out some of the most honest reads on my timeline.",
    publishedAt: "2026-04-03",
    metrics: { replies: 47, retweets: 290, likes: 1900 },
  },
  {
    id: "t3",
    author: "Aethir",
    handle: "AethirCloud",
    content:
      "Appreciation post for community testers like @Web3Gen0 who gave us structured feedback during the compute marketplace rollout. Real signal beats raid posts.",
    publishedAt: "2026-03-27",
    metrics: { replies: 38, retweets: 210, likes: 1500 },
  },
  {
    id: "t4",
    author: "Bankless",
    handle: "BanklessHQ",
    content:
      "Featured this week in our reading list: a clear breakdown of token unlock red flags from @Web3Gen0. Worth a slow read if you size positions by conviction.",
    publishedAt: "2026-04-11",
    metrics: { replies: 102, retweets: 540, likes: 3700 },
  },
  {
    id: "t5",
    author: "Route 2 FI",
    handle: "Route2FI",
    content:
      "Following @Web3Gen0 has saved me from at least two obvious rugs this cycle. No paid groups. No alpha calls. Just patient research.",
    publishedAt: "2026-04-22",
    metrics: { replies: 76, retweets: 410, likes: 2800 },
  },
  {
    id: "t6",
    author: "The Defiant",
    handle: "DefiantNews",
    content:
      "Quoted @Web3Gen0 in today's piece on RWA narratives: 'The flows tell you which sector is real before the headlines do.' Recommended read.",
    publishedAt: "2026-04-08",
    metrics: { replies: 54, retweets: 240, likes: 1850 },
  },
];
