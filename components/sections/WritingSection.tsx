"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { posts } from "@/lib/posts";
import { PostCard } from "@/components/ui/PostCard";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function WritingSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-20 lg:py-28 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <h2
          style={{ fontFamily: "var(--font-serif)", color: "var(--color-text-primary)" }}
          className="text-3xl md:text-4xl mb-12"
        >
          What I write
        </h2>

        <motion.div
          variants={containerVariants}
          initial={prefersReducedMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
        >
          {posts.map((post) => (
            <motion.div key={post.id} variants={itemVariants} className="h-full">
              <PostCard post={post} />
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-12 flex justify-end">
          <Link
            href="/writing"
            style={{ color: "var(--color-brand)", fontFamily: "var(--font-sans)" }}
            className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all duration-150"
          >
            Read all posts
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
