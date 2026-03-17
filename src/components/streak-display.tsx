"use client";

import { motion, AnimatePresence } from "framer-motion";

type StreakDisplayProps = {
  streak: number;
};

export function StreakDisplay({ streak }: StreakDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-12 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={streak}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-4xl font-light tabular-nums"
          >
            {streak}
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="text-sm text-muted-foreground">day streak</p>
    </div>
  );
}