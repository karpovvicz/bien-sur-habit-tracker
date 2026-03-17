"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DayCell } from "./day-cell";
import { getCalendarDays } from "@/lib/dates";
import { type DayRecord } from "@/lib/types";

type CalendarGridProps = {
  year: number;
  month: number;
  getDayRecord: (date: string) => DayRecord | undefined;
  direction: number;
};

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function CalendarGrid({
  year,
  month,
  getDayRecord,
  direction,
}: CalendarGridProps) {
  const days = getCalendarDays(year, month);

  return (
    <div className="w-full">
      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={i}
            className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={`${year}-${month}`}
          custom={direction}
          initial={{ opacity: 0, x: direction > 0 ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction > 0 ? -20 : 20 }}
          transition={{
            duration: 0.12,
            ease: "easeInOut",
          }}
          className="grid grid-cols-7 gap-1"
        >
          {days.map(({ date, isCurrentMonth }) => (
            <DayCell
              key={date}
              date={date}
              record={getDayRecord(date)}
              isCurrentMonth={isCurrentMonth}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}