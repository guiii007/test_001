import { X, Trash2, History as HistoryIcon } from "lucide-react";
import { useBeadStore } from "@/store/useBeadStore";
import { removeHistory, clearHistory } from "@/lib/storage";

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function HistoryDrawer({ open, onClose }: HistoryDrawerProps) {
  const history = useBeadStore((s) => s.history);
  const loadHistoryList = useBeadStore((s) => s.loadHistoryList);

  const handleRemove = (id: string) => {
    removeHistory(id);
    loadHistoryList();
  };

  const handleClear = () => {
    if (history.length === 0) return;
    if (confirm("确定清空全部历史记录吗？此操作不可撤销。")) {
      clearHistory();
      loadHistoryList();
    }
  };

  return (
    <>
      {/* 遮罩 */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      {/* 抽屉 */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-paper-100 shadow-2xl transition-transform duration-300 dark:bg-ink-100 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-jade-600/10 px-5 py-4 dark:border-paper-100/10">
          <div className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5 text-amber-400" />
            <h2 className="font-serif text-lg font-bold text-jade-600 dark:text-paper-100">
              历史记录
            </h2>
            <span className="rounded-full bg-jade-600/10 px-2 py-0.5 font-mono text-xs text-jade-600/60 dark:bg-paper-100/10 dark:text-paper-100/60">
              {history.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-jade-600/60 transition-colors hover:bg-jade-600/10 dark:text-paper-100/60 dark:hover:bg-paper-100/10"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {history.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-jade-600/5 dark:bg-paper-100/5">
                <HistoryIcon className="h-7 w-7 text-jade-600/30 dark:text-paper-100/30" />
              </div>
              <p className="mt-4 text-sm text-jade-600/50 dark:text-paper-100/40">
                暂无历史记录
              </p>
              <p className="mt-1 text-xs text-jade-600/40 dark:text-paper-100/30">
                识别完成后点击「存记录」即可保存
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {history.map((record) => (
                <li
                  key={record.id}
                  className="group flex items-center gap-3 rounded-xl border border-jade-600/10 bg-white/60 p-3 transition-colors hover:border-amber-400/40 dark:border-paper-100/10 dark:bg-ink-200/60"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-200">
                    <img
                      src={record.thumbnail}
                      alt="缩略图"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-xl font-bold text-amber-500">
                        {record.totalCount}
                      </span>
                      <span className="text-xs text-jade-600/50 dark:text-paper-100/40">
                        颗
                      </span>
                    </div>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-jade-600/40 dark:text-paper-100/30">
                      {formatTime(record.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(record.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-jade-600/40 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100 dark:text-paper-100/40"
                    aria-label="删除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {history.length > 0 && (
          <div className="border-t border-jade-600/10 p-4 dark:border-paper-100/10">
            <button
              onClick={handleClear}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-red-500/20 px-4 py-2.5 text-sm font-medium text-red-500/80 transition-colors hover:bg-red-500/10 dark:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
              清空全部
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
