import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { isToday, isFuture, parseDate } from "@/lib/dates";
import { type DayRecord } from "@/lib/types";

type DayCellProps = {
  date: string;
  record?: DayRecord;
  isCurrentMonth: boolean;
};

export function DayCell({ date, record, isCurrentMonth }: DayCellProps) {
  const today = isToday(date);
  const future = isFuture(date);
  const completed = record?.completed ?? false;
  const dayNumber = parseDate(date).getDate();

  if (future || !isCurrentMonth) {
    return <div className="h-8 w-8" />;
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center">
      <div
        className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded-full transition-all",
          completed
            ? "bg-primary text-primary-foreground"
            : "border border-border/30",
          today && !completed && "border-primary border-2",
          today && completed && "ring-2 ring-primary ring-offset-2 ring-offset-background",
          !completed && !future && "opacity-40 hover:opacity-60"
        )}
      >
        {completed && <Check className="h-4 w-4" strokeWidth={2.5} />}
        {!completed && (
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            {dayNumber}
          </span>
        )}
      </div>
    </div>
  );
}