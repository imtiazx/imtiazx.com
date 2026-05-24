"use client";

import { useEffect, useRef, useState } from "react";

const GREETINGS = [
  "Hello",
  "こんにちは",
  "Bonjour",
  "Hallo",
  "你好",
  "Hej",
  "Ciao",
  "안녕하세요",
  "Olá",
  "নমস্কার",
];

const NAME = "imtiazx";

const TYPE_SPEED = 38;
const HOLD_SHORT = 140;
const DELETE_SPEED = 22;
const GAP = 60;
const NAME_HOLD = 950;
const PRE_FADE = 120;
const FADE_OUT = 400;
const REDUCED_HOLD = 250;

function toGraphemes(s: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    try {
      const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
      return Array.from(seg.segment(s), (x) => x.segment);
    } catch {
      /* fall through */
    }
  }
  return Array.from(s);
}

export function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [text, setText] = useState("");
  const [isName, setIsName] = useState(false);
  const [exiting, setExiting] = useState(false);
  const cancelRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    cancelRef.current = false;
    document.body.style.overflow = "hidden";

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    const typeIn = async (word: string) => {
      const chars = toGraphemes(word);
      for (let i = 1; i <= chars.length; i++) {
        if (cancelRef.current) return;
        setText(chars.slice(0, i).join(""));
        await sleep(TYPE_SPEED);
      }
    };

    const typeOut = async (word: string) => {
      const chars = toGraphemes(word);
      for (let i = chars.length - 1; i >= 0; i--) {
        if (cancelRef.current) return;
        setText(chars.slice(0, i).join(""));
        await sleep(DELETE_SPEED);
      }
    };

    const finish = async () => {
      setExiting(true);
      await sleep(FADE_OUT);
      if (cancelRef.current) return;
      setVisible(false);
      document.body.style.overflow = "";
    };

    const run = async () => {
      if (reduced) {
        setIsName(true);
        setText(NAME);
        await sleep(REDUCED_HOLD);
        if (cancelRef.current) return;
        await finish();
        return;
      }

      for (const word of GREETINGS) {
        if (cancelRef.current) return;
        await typeIn(word);
        await sleep(HOLD_SHORT);
        await typeOut(word);
        await sleep(GAP);
      }

      if (cancelRef.current) return;

      setIsName(true);
      await typeIn(NAME);
      await sleep(NAME_HOLD);
      await typeOut(NAME);
      await sleep(PRE_FADE);
      await finish();
    };

    void run();

    return () => {
      cancelRef.current = true;
      document.body.style.overflow = "";
    };
  }, []);

  if (!visible) return null;

  const renderText = () => {
    if (!isName) return text;
    if (text.length <= 6) return text;
    return (
      <>
        {text.slice(0, 6)}
        <span style={{ color: "#EA580C" }}>{text.slice(6)}</span>
      </>
    );
  };

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#FAFAF9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: exiting ? 0 : 1,
        transition: `opacity ${FADE_OUT}ms ease-in`,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "baseline",
          fontFamily: "var(--font-mono), ui-monospace, Menlo, monospace",
          fontSize: "clamp(1.8rem, 4.2vw, 3rem)",
          color: "#1C1917",
          fontWeight: 500,
          letterSpacing: "-0.01em",
          lineHeight: 1.2,
          minHeight: "1.4em",
        }}
      >
        <span style={{ whiteSpace: "pre" }}>{renderText()}</span>
        <span
          aria-hidden
          className="loader-cursor"
          style={{
            display: "inline-block",
            width: "0.08em",
            height: "0.95em",
            backgroundColor: "#1C1917",
            marginLeft: "0.06em",
            transform: "translateY(0.12em)",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes loaderCursorBlink {
          0%, 50% {
            opacity: 1;
          }
          51%, 100% {
            opacity: 0;
          }
        }
        .loader-cursor {
          animation: loaderCursorBlink 0.65s steps(1) infinite;
        }
      `}</style>
    </div>
  );
}
