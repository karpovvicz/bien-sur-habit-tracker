"use client";

import { useState, useEffect, useMemo } from "react";
import { type TrackerState, type DayRecord } from "@/lib/types";
import { getTrackerState, setTrackerState } from "@/lib/storage";
import { getToday, formatDate, parseDate } from "@/lib/dates";

export function useTracker() {
  const [state, setState] = useState<TrackerState>({
    records: {},
    commitment: "my daily commitment",
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loadedState = getTrackerState();
    setState(loadedState);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setTrackerState(state);
    }
  }, [state, mounted]);

  const checkInToday = () => {
    const today = getToday();
    const now = new Date().toISOString();

    const newRecord: DayRecord = {
      date: today,
      completed: true,
      completedAt: now,
    };

    setState((prev) => ({
      ...prev,
      records: {
        ...prev.records,
        [today]: newRecord,
      },
    }));
  };

  const currentStreak = useMemo(() => {
    const today = getToday();
    let streak = 0;
    const currentDate = new Date();

    while (true) {
      const dateString = formatDate(currentDate);
      if (dateString > today) {
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      }

      const record = state.records[dateString];
      if (record && record.completed) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [state.records]);

  const isTodayComplete = useMemo(() => {
    const today = getToday();
    const record = state.records[today];
    return record ? record.completed : false;
  }, [state.records]);

  const getDayRecord = (date: string): DayRecord | undefined => {
    return state.records[date];
  };

  return {
    state,
    mounted,
    checkInToday,
    currentStreak,
    isTodayComplete,
    getDayRecord,
  };
}