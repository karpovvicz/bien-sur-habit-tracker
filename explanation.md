# bien sûr — Development Breakdown

A comprehensive guide to how this minimalist daily commitment tracker was built from scratch.

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Architecture & File Structure](#2-architecture--file-structure)
3. [Type System Foundation](#3-type-system-foundation)
4. [Date Utilities](#4-date-utilities)
5. [Local Storage Abstraction](#5-local-storage-abstraction)
6. [State Management with Hooks](#6-state-management-with-hooks)
7. [Component Architecture](#7-component-architecture)
8. [Styling & Theming](#8-styling--theming)
9. [Animations](#9-animations)
10. [Build & Deployment](#10-build--deployment)

---

## 1. Project Setup

### Initial Dependencies

```bash
npm init -y
npm install next@latest react@latest react-dom@latest
npm install --save-dev typescript @types/react @types/node @types/react-dom
npm install --save-dev eslint eslint-config-next
npm install --save-dev tailwindcss@^3 postcss autoprefixer
npm install class-variance-authority clsx tailwind-merge lucide-react
npm install framer-motion
```

**Why each dependency?**

- `next`, `react`, `react-dom`: Core framework (Next.js 14+ with App Router)
- TypeScript packages: Static type checking for catching errors at compile time
- `eslint` + `eslint-config-next`: Code quality and consistency
- `tailwindcss@^3`: Utility-first CSS framework (v3 for stability)
- `class-variance-authority`, `clsx`, `tailwind-merge`: Utility functions for conditional CSS classes
- `lucide-react`: Icon library (lightweight, tree-shakeable)
- `framer-motion`: Animation library for smooth micro-interactions

### Configuration Files

**tsconfig.json** — TypeScript configuration
```json
{
  "compilerOptions": {
    "strict": true,        // Enforce strict type checking
    "jsx": "react-jsx",    // Use React 17+ automatic JSX runtime
    "paths": {
      "@/*": ["./src/*"]   // Path alias for cleaner imports
    }
  }
}
```

**tailwind.config.ts** — Tailwind CSS configuration
```typescript
// Extends default theme with CSS variables for dynamic theming
theme: {
  extend: {
    colors: {
      border: "hsl(var(--border))",
      // ... CSS variables mapped to Tailwind utilities
    }
  }
}
```

**postcss.config.js** — PostCSS configuration
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},      // Process Tailwind directives
    autoprefixer: {},     // Add vendor prefixes for browser compatibility
  },
};
```

---

## 2. Architecture & File Structure

### Why This Structure?

```
src/
├── app/              # Next.js App Router (routing + layouts)
├── components/       # Reusable UI components
├── lib/             # Pure utilities (no React dependencies)
└── hooks/           # Custom React hooks
```

**Principles:**
1. **Flat hierarchy** — No nested folders beyond one level. Easy to navigate.
2. **Clear boundaries** — `lib/` is pure JavaScript/TypeScript. `components/` and `hooks/` use React.
3. **Single responsibility** — Each file does one thing well.

### File Naming Conventions

- **kebab-case** for files: `today-action.tsx`, `use-tracker.ts`
- **PascalCase** for components: `TodayAction`, `CalendarGrid`
- **camelCase** for functions: `formatDate`, `getToday`

---

## 3. Type System Foundation

**File:** `src/lib/types.ts`

```typescript
export type DayRecord = {
  date: string;              // ISO date "YYYY-MM-DD"
  completed: boolean;        // Has this day been checked in?
  completedAt: string | null; // ISO timestamp of completion
};

export type TrackerState = {
  records: Record<string, DayRecord>;  // Keyed by date for O(1) lookup
  commitment: string;                   // User's commitment text
};
```

### Key Decisions

**Why `Record<string, DayRecord>` instead of `DayRecord[]`?**

Object lookup by date key is O(1):
```typescript
// Fast — O(1)
const today = state.records["2026-03-14"];

// Slow — O(n)
const today = state.records.find(r => r.date === "2026-03-14");
```

**Why ISO date strings instead of `Date` objects?**

1. JSON serializable (important for localStorage)
2. Timezone-independent string comparison
3. Consistent across client/server

```typescript
// Works reliably
"2026-03-14" < "2026-03-15"  // true

// Date objects can be tricky with timezones
```

---

## 4. Date Utilities

**File:** `src/lib/dates.ts`

### Core Principle: Pure Functions

Every function is **pure** — same input always produces same output, no side effects.

```typescript
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
```

**Why padStart?**
```typescript
String(3).padStart(2, "0")  // "03"
String(12).padStart(2, "0") // "12"
```
Ensures consistent two-digit formatting for dates.

### Calendar Grid Algorithm

The trickiest function — `getCalendarDays()`:

```typescript
export function getCalendarDays(year: number, month: number) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Adjust for Monday start (firstDay: 0=Sun, 1=Mon, ..., 6=Sat)
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

  // Build array of 42 days (6 rows × 7 columns)
  const days = [];

  // 1. Fill previous month's trailing days
  // 2. Fill current month's days
  // 3. Fill next month's leading days
}
```

**Why 42 days?**
Calendar grids are always 6 rows × 7 columns = 42 cells. This ensures consistent layout even when months have different lengths or start on different days.

---

## 5. Local Storage Abstraction

**File:** `src/lib/storage.ts`

### Problem: SSR Hydration Mismatch

Next.js renders on the server first (no `window` or `localStorage`), then hydrates on the client. Direct access to `localStorage` in components causes mismatches.

**Solution:** Abstraction layer with runtime checks

```typescript
function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;  // Server-side

  try {
    const test = "__storage_test__";
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;  // Private browsing, quota exceeded, etc.
  }
}
```

### Graceful Degradation

```typescript
export function getTrackerState(): TrackerState {
  if (!isStorageAvailable()) return DEFAULT_STATE;  // Fallback

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_STATE;
    return JSON.parse(stored) as TrackerState;
  } catch {
    return DEFAULT_STATE;  // Corrupted data
  }
}
```

**Key Lesson:** Always handle the unhappy path. Storage can fail in many ways:
- Server-side rendering
- Private browsing mode
- Quota exceeded
- Corrupted JSON
- Browser extensions blocking storage

---

## 6. State Management with Hooks

**File:** `src/hooks/use-tracker.ts`

### Custom Hook Pattern

```typescript
export function useTracker() {
  const [state, setState] = useState<TrackerState>(...);
  const [mounted, setMounted] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    const loadedState = getTrackerState();
    setState(loadedState);
    setMounted(true);
  }, []);

  // Save to storage on state change
  useEffect(() => {
    if (mounted) {
      setTrackerState(state);
    }
  }, [state, mounted]);

  // ... methods and computed values
}
```

### Why Two `useEffect` Calls?

**First effect:** Hydration
- Runs once on mount
- Loads from localStorage
- Sets `mounted` flag

**Second effect:** Persistence
- Runs whenever `state` changes
- Only after initial mount (prevents saving default state immediately)

### Computed Values with `useMemo`

```typescript
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
```

**Why `useMemo`?**
- Streak calculation loops through dates (potentially expensive)
- Only recalculate when `state.records` changes
- Prevents recalculation on every render

### Immutable State Updates

```typescript
const checkInToday = () => {
  const today = getToday();

  setState((prev) => ({
    ...prev,                    // Copy existing state
    records: {
      ...prev.records,          // Copy existing records
      [today]: {                // Add/update today
        date: today,
        completed: true,
        completedAt: new Date().toISOString(),
      },
    },
  }));
};
```

**Never mutate state directly:**
```typescript
// ❌ Wrong — mutates state
state.records[today].completed = true;

// ✅ Right — creates new object
setState({ ...prev, records: { ...prev.records, ... } });
```

---

## 7. Component Architecture

### Component Hierarchy

```
page.tsx (Client Component)
├── TodayAction
├── StreakDisplay
├── MonthNav
└── CalendarGrid
    └── DayCell (rendered 42 times)
```

### Bottom-Up Development

Built in order from leaves to root:

1. **DayCell** — Smallest unit (single day)
2. **CalendarGrid** — Container for 42 DayCells
3. **MonthNav** — Navigation controls
4. **StreakDisplay** — Animated number
5. **TodayAction** — Hero button
6. **page.tsx** — Compose everything

**Why bottom-up?**
- Test components in isolation
- Clear dependencies (leaves have none)
- Easier to reason about data flow

### Component Design Patterns

#### 1. DayCell — Pure Presentational Component

```typescript
type DayCellProps = {
  date: string;
  record?: DayRecord;
  isCurrentMonth: boolean;
};

export function DayCell({ date, record, isCurrentMonth }: DayCellProps) {
  const today = isToday(date);
  const future = isFuture(date);
  const completed = record?.completed ?? false;

  // Compute state
  // Render based on state
}
```

**Key characteristics:**
- No state management
- Props in, JSX out
- All logic derived from props
- Highly reusable

#### 2. CalendarGrid — Layout Component

```typescript
export function CalendarGrid({ year, month, getDayRecord, direction }) {
  const days = getCalendarDays(year, month);

  return (
    <AnimatePresence mode="wait">
      <motion.div key={`${year}-${month}`}>
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
  );
}
```

**Key pattern:** Function as prop
- `getDayRecord` is passed as a function
- CalendarGrid doesn't need to know about the entire state
- Keeps coupling low

#### 3. TodayAction — Stateful Interaction Component

```typescript
export function TodayAction({ isComplete, onCheckIn }: TodayActionProps) {
  if (isComplete) {
    return <CompletedState />;
  }

  return (
    <motion.button onClick={onCheckIn} whileTap={{ scale: 0.95 }}>
      {/* Button UI */}
    </motion.button>
  );
}
```

**Event handling pattern:**
- Parent owns the state (`isTodayComplete`)
- Parent owns the mutation (`checkInToday`)
- Child receives both as props
- Child just triggers the callback

### Server vs Client Components

```typescript
// Server Component (default in Next.js App Router)
export default function Layout({ children }) {
  return <html>{children}</html>;
}

// Client Component (uses hooks, browser APIs)
"use client";
export function TodayAction() {
  const [state, setState] = useState(...);
  return ...;
}
```

**When to use "use client":**
- useState, useEffect, or other hooks
- Browser APIs (localStorage, window)
- Event handlers (onClick, onChange)
- Framer Motion animations

**When NOT to use "use client":**
- Static content
- Layout components
- Data fetching (use Server Components)

---

## 8. Styling & Theming

### CSS Variables for Theming

**File:** `src/app/globals.css`

```css
@layer base {
  :root {
    --background: 40 40% 98%;      /* Light mode: warm white */
    --foreground: 24 10% 10%;      /* Light mode: near black */
    --primary: 240 6% 10%;
    /* ... */
  }

  .dark {
    --background: 20 14% 4%;       /* Dark mode: near black */
    --foreground: 40 40% 98%;      /* Dark mode: warm white */
    --primary: 40 40% 98%;
    /* ... */
  }
}
```

**Why HSL values without `hsl()`?**

Tailwind's CSS variable system expects bare HSL values:
```css
--background: 40 40% 98%;
```

Then Tailwind generates:
```css
.bg-background {
  background-color: hsl(var(--background));
}
```

### Theme Provider Implementation

**File:** `src/components/theme-provider.tsx`

```typescript
export function ThemeProvider({ children }) {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateTheme = (e: MediaQueryList | MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    updateTheme(mediaQuery);
    mediaQuery.addEventListener("change", updateTheme);

    return () => mediaQuery.removeEventListener("change", updateTheme);
  }, []);

  return <>{children}</>;
}
```

**How it works:**
1. Check system preference with `matchMedia`
2. Add/remove `.dark` class on `<html>`
3. CSS variables update automatically
4. Listen for system preference changes

### Utility Class Patterns

```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes-always-applied",
  condition && "conditional-class",
  anotherCondition ? "if-true" : "if-false",
  today && !completed && "ring-2 ring-primary"
)} />
```

**The `cn()` helper:**
```typescript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- `clsx`: Handles conditional classes
- `twMerge`: Intelligently merges Tailwind classes (later classes override earlier)

```typescript
cn("p-4", "p-8")  // Result: "p-8" (not "p-4 p-8")
```

---

## 9. Animations

### Framer Motion Patterns

#### 1. Tap Animation (Spring Physics)

```typescript
<motion.button
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 500, damping: 30 }}
>
```

**Parameters:**
- `stiffness: 500` — High = snappy
- `damping: 30` — Controls bounce (higher = less bounce)

#### 2. Pulse Animation (Infinite Loop)

```typescript
<motion.div
  animate={{ opacity: [0.5, 1, 0.5] }}
  transition={{
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  }}
/>
```

**Keyframe array:**
- `[0.5, 1, 0.5]` creates smooth loop (start → peak → start)
- No abrupt jump when repeating

#### 3. Enter/Exit Animations

```typescript
<AnimatePresence mode="wait">
  <motion.div
    key={uniqueKey}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
  />
</AnimatePresence>
```

**AnimatePresence:**
- Keeps component in DOM during exit animation
- `mode="wait"` waits for exit to finish before entering next
- Requires unique `key` to detect changes

#### 4. Direction-Aware Slide

```typescript
<motion.div
  custom={direction}  // Pass data to variants
  initial={{ opacity: 0, x: direction > 0 ? 20 : -20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: direction > 0 ? -20 : 20 }}
/>
```

**Effect:**
- Next month: slide in from right (x: 20 → 0), exit to left (0 → -20)
- Previous month: slide in from left (x: -20 → 0), exit to right (0 → 20)

### Animation Performance

**Use transform properties (GPU-accelerated):**
- ✅ `opacity`, `scale`, `x`, `y`, `rotate`
- ❌ `width`, `height`, `top`, `left`

**Keep animations under 300ms:**
```typescript
transition={{ duration: 0.12 }}  // 120ms — feels instant
transition={{ duration: 0.3 }}   // 300ms — maximum for UI
transition={{ duration: 3 }}     // Only for ambient animations (pulse)
```

---

## 10. Build & Deployment

### Build Process

```bash
npm run build
```

**What happens:**
1. TypeScript compilation
2. Tailwind CSS purging (removes unused classes)
3. Next.js optimization (code splitting, minification)
4. Static page generation (for routes that don't need runtime data)

**Output:**
```
Route (app)
┌ ○ /              Static (pre-rendered)
└ ○ /_not-found    Static
```

### Production Optimizations

**Automatic from Next.js:**
- Code splitting (only load what's needed per route)
- Image optimization
- Font optimization (Inter via `next/font`)
- Minification
- Tree shaking (remove unused code)

**Bundle Size Targets:**
- Total JS: < 80KB gzipped
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s

### Environment Variables

For future backend integration:

```bash
# .env.local (gitignored)
NEXT_PUBLIC_API_URL=https://api.example.com
```

**Naming convention:**
- `NEXT_PUBLIC_*` — Available in browser
- Others — Server-side only

---

## Key Learnings & Patterns

### 1. TypeScript Best Practices

**Never use `any`:**
```typescript
// ❌ Bad
function parseJSON(str: string): any { }

// ✅ Good
function parseJSON<T>(str: string): T { }
```

**Use explicit return types:**
```typescript
// ✅ Good — catches errors early
export function formatDate(date: Date): string {
  return date.toString();  // TypeScript error: wrong type
}
```

### 2. React Patterns

**Avoid prop drilling:**
```typescript
// ❌ Bad
<Parent>
  <Middle data={data}>
    <Child data={data} />
  </Middle>
</Parent>

// ✅ Good — pass functions down
<Parent>
  <Middle>
    <Child getData={() => data} />
  </Middle>
</Parent>
```

**Prefer composition:**
```typescript
// ✅ Component accepts children
export function Card({ children }) {
  return <div className="card">{children}</div>;
}
```

### 3. Performance

**useMemo for expensive calculations:**
```typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveThing(data);
}, [data]);
```

**useCallback for stable function references:**
```typescript
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

### 4. State Management

**Keep state close to where it's used:**
```typescript
// ✅ Good
function Calendar() {
  const [month, setMonth] = useState(0);
  return <MonthView month={month} />;
}
```

**Lift state only when necessary:**
```typescript
// When multiple components need it
function App() {
  const [globalState, setGlobalState] = useState();
  return (
    <>
      <ComponentA state={globalState} />
      <ComponentB state={globalState} />
    </>
  );
}
```

### 5. Error Handling

**Always handle the unhappy path:**
```typescript
try {
  const result = riskyOperation();
  return result;
} catch (error) {
  console.error("Operation failed:", error);
  return fallbackValue;
}
```

**Graceful degradation:**
```typescript
if (!isFeatureSupported()) {
  return <BasicVersion />;
}
return <EnhancedVersion />;
```

---

## Architecture Decisions Summary

| Decision | Why |
|----------|-----|
| No backend | Local-first simplicity, instant sync, no auth complexity |
| TypeScript strict mode | Catch errors at compile time, better DX |
| Tailwind CSS | Rapid development, consistent design system |
| Framer Motion | Best-in-class React animations, declarative |
| Custom hooks | Separate concerns, reusable logic |
| Pure functions in `lib/` | Testable, predictable, no side effects |
| CSS variables for theming | Runtime theme switching without JS |
| Server Components by default | Better performance, smaller client bundles |
| Flat file structure | Easy navigation, no deep nesting |
| ISO date strings | Serializable, timezone-safe, sortable |

---

## Development Workflow

### Recommended Order for Features

1. **Types first** — Define data structure
2. **Utilities** — Pure functions for data manipulation
3. **Hooks** — State management layer
4. **Components (bottom-up)** — Leaves to root
5. **Styling** — After functionality works
6. **Animations** — Polish at the end

### Debugging Tips

**React DevTools:**
- Install React DevTools browser extension
- Inspect component tree
- View props and state

**console.log strategically:**
```typescript
useEffect(() => {
  console.log("State changed:", state);
}, [state]);
```

**TypeScript errors:**
- Read the error from bottom to top
- Start with the deepest error
- Most errors are type mismatches

**Next.js errors:**
- Check terminal (server errors)
- Check browser console (client errors)
- Clear `.next` folder if weird behavior: `rm -rf .next`

---

## Next Steps for Learning

### To deepen understanding:

1. **Add features:**
   - Edit commitment text
   - Monthly/yearly stats view
   - Export data to CSV

2. **Explore patterns:**
   - Add React Context for global state
   - Implement custom error boundary
   - Add unit tests with Vitest

3. **Optimization:**
   - Measure performance with Lighthouse
   - Add service worker for offline support
   - Implement virtual scrolling for large datasets

4. **Backend integration:**
   - Add API routes in Next.js
   - Connect to database (Postgres, SQLite)
   - Implement user authentication

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion)
- [shadcn/ui](https://ui.shadcn.com)

---

**Remember:** Code is read more than it's written. Optimize for clarity, not cleverness.