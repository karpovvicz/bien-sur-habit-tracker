"use client";

import { useState } from "react";
import { useTracker } from "@/hooks/use-tracker";
import { TodayAction } from "@/components/today-action";
import { StreakDisplay } from "@/components/streak-display";
import { CalendarGrid } from "@/components/calendar-grid";
import { MonthNav } from "@/components/month-nav";
import { isSameMonth } from "@/lib/dates";

export default function Home() {
  const { checkInToday, currentStreak, isTodayComplete, getDayRecord, mounted } = useTracker();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(0);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setDirection(-1);
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setDirection(1);
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const canGoNext = !isSameMonth(currentDate, new Date());

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen px-6 py-8 md:px-12 md:py-12">
      <div className="mx-auto max-w-md">
        <h1 className="mb-8 text-sm font-medium uppercase tracking-[0.2em]">
          bien sûr
        </h1>

        <div className="mb-8 flex flex-col items-center gap-8">
          <TodayAction isComplete={isTodayComplete} onCheckIn={checkInToday} />
          <StreakDisplay streak={currentStreak} />
        </div>

        <div className="mt-12">
          <MonthNav
            year={year}
            month={month}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            canGoNext={canGoNext}
          />
          <div className="mt-6">
            <CalendarGrid
              year={year}
              month={month}
              getDayRecord={getDayRecord}
              direction={direction}
            />
          </div>
        </div>
      </div>
    </main>
  );
}