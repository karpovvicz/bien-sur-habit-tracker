import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMonthName } from "@/lib/dates";

type MonthNavProps = {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  canGoNext: boolean;
};

export function MonthNav({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  canGoNext,
}: MonthNavProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={onPrevMonth}
        className="transition-transform hover:scale-105 active:scale-95"
        aria-label="Previous month"
      >
        <ChevronLeft size={16} className="text-foreground" />
      </button>

      <h2 className="text-lg font-semibold tabular-nums">
        {getMonthName(month)} {year}
      </h2>

      <button
        onClick={onNextMonth}
        disabled={!canGoNext}
        className="transition-transform hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
        aria-label="Next month"
      >
        <ChevronRight size={16} className="text-foreground" />
      </button>
    </div>
  );
}