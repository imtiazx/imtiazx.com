import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SoundProvider } from "@/components/providers/SoundProvider";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { PageLoader } from "@/components/ui/PageLoader";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { DevNoticeBanner } from "@/components/ui/DevNoticeBanner";

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});


export const metadata: Metadata = {
  title: "ImtiazX | Consciousness++",
  description: "Exploring the space between human judgement and machine intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dmSerifDisplay.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${GeistSans.variable}`}
    >
      <head>
        {/* Runs synchronously before React hydrates so the correct theme class is
            on <html> from frame one. Eliminates the light/dark flash on first paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var theme = stored || 'system';
                  if (theme === 'system') {
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (prefersDark) document.documentElement.classList.add('dark');
                  } else if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <SoundProvider>
            <PageLoader />
            <ScrollProgress />
            <CustomCursor />
            <DevNoticeBanner />
            <Nav />
            <PageTransition>{children}</PageTransition>
            <Footer />
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
