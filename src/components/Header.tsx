import { Moon, Sun, History, Circle } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface HeaderProps {
  onToggleHistory: () => void;
  historyCount: number;
}

export default function Header({ onToggleHistory, historyCount }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-jade-600/10 bg-paper-100/80 backdrop-blur-md dark:border-paper-100/10 dark:bg-ink-200/80">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-jade-gradient shadow-jade">
            <Circle className="h-5 w-5 fill-amber-400 text-amber-400" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-paper-100 dark:ring-ink-200" />
          </div>
          <div className="flex flex-col leading-none">
            <h1 className="font-serif text-xl font-bold tracking-wide text-jade-600 dark:text-paper-100">
              珠玑
            </h1>
            <span className="mt-0.5 text-[10px] font-medium tracking-[0.2em] text-jade-600/50 dark:text-paper-100/40">
              BEAD COUNTER
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleHistory}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-jade-600 transition-colors hover:bg-jade-600/10 dark:text-paper-100 dark:hover:bg-paper-100/10"
            aria-label="历史记录"
            title="历史记录"
          >
            <History className="h-5 w-5" />
            {historyCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 font-mono text-[10px] font-bold text-jade-700">
                {historyCount > 99 ? "99+" : historyCount}
              </span>
            )}
          </button>
          <button
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-jade-600 transition-colors hover:bg-jade-600/10 dark:text-paper-100 dark:hover:bg-paper-100/10"
            aria-label="切换主题"
            title="切换主题"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
