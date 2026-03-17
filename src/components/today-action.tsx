"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

type TodayActionProps = {
  isComplete: boolean;
  onCheckIn: () => void;
};

export function TodayAction({ isComplete, onCheckIn }: TodayActionProps) {
  if (isComplete) {
    return (
      <div className="flex flex-col items-center gap-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          <Check className="h-8 w-8" strokeWidth={2.5} />
        </motion.div>
        <p className="text-sm text-muted-foreground">done for today</p>
      </div>
    );
  }

  return (
    <motion.button
      onClick={onCheckIn}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="relative flex h-16 w-16 items-center justify-center rounded-full border border-border/50 transition-colors hover:border-border"
    >
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 rounded-full border border-primary/20"
      />
    </motion.button>
  );
}