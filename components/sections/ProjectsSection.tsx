"use client";

import { useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { projects } from "@/lib/projects";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

// First half of the deck slides in from the left edge of the viewport, second
// half from the right. The grid drives `animate` directly off useInView so
// scrolling the section out and back in re-runs the slide reliably.
const itemVariants: Variants = {
  hidden: (direction: "left" | "right") => ({
    opacity: 0,
    x: direction === "left" ? "-55vw" : "55vw",
  }),
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const HEADING = "What I Build";
const SUBTEXT =
  "Core projects, production systems, deployed AI infrastructure, flagship engineering work.";

export function ProjectsSection() {
  const prefersReducedMotion = useReducedMotion();
  const splitIndex = Math.ceil(projects.length / 2);
  const gridRef = useRef<HTMLDivElement>(null);
  // `once: false` (the default) so this re-fires every time the grid leaves
  // and re-enters the viewport.
  const isInView = useInView(gridRef, { amount: 0.15 });
  const animateState = prefersReducedMotion || isInView ? "visible" : "hidden";

  return (
    <section className="py-20 lg:py-28 overflow-x-clip">
      <div className="container">
        <div className="mb-12">
          <ScrollReveal variant="fadeUp">
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                color: "var(--color-text-primary)",
              }}
              className="text-3xl md:text-4xl"
            >
              {HEADING}
            </h2>
          </ScrollReveal>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--color-text-muted)",
            }}
            className="mt-3 text-base md:text-lg max-w-2xl"
          >
            {SUBTEXT}
          </p>
        </div>

        <motion.div
          ref={gridRef}
          variants={containerVariants}
          initial="hidden"
          animate={animateState}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
        >
          {projects.map((project, index) => {
            const direction = index < splitIndex ? "left" : "right";
            return (
              <motion.div
                key={project.id}
                custom={direction}
                variants={itemVariants}
                className="h-full"
              >
                <ProjectCard project={project} />
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-12 flex justify-end">
          <Link
            href="/lab"
            style={{ color: "var(--color-brand)", fontFamily: "var(--font-sans)" }}
            className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all duration-150"
          >
            View all projects
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
