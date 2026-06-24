import { Hash, Clock, Target, TrendingUp } from "lucide-react";
import CountUp from "./CountUp";
import { useBeadStore } from "@/store/useBeadStore";

export default function ResultStats() {
  const beads = useBeadStore((s) => s.beads);
  const lastResult = useBeadStore((s) => s.lastResult);
  const isDetecting = useBeadStore((s) => s.isDetecting);
  const hasImage = useBeadStore((s) => s.hasImage);

  const count = beads.length;
  const duration = lastResult?.duration;
  const avgConfidence =
    beads.length > 0
      ? beads.reduce((sum, b) => sum + b.confidence, 0) / beads.length
      : 0;

  if (!hasImage) return null;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-sm font-semibold tracking-wide text-jade-600/70 dark:text-paper-100/60">
          识别结果
        </h3>
        {isDetecting && (
          <span className="flex items-center gap-1.5 text-xs text-amber-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
            处理中
          </span>
        )}
      </div>

      <div className="mt-4 flex items-end gap-3">
        <div className="flex items-baseline">
          <Hash className="mb-2 h-5 w-5 text-amber-400/60" />
          <CountUp
            end={count}
            duration={900}
            className="bg-amber-gradient bg-clip-text font-mono text-6xl font-bold leading-none text-transparent"
          />
          <span
            className="ml-2 mb-1 font-serif text-lg text-jade-600/50 dark:text-paper-100/40"
            style={{ background: "none" }}
          >
            颗
          </span>
        </div>
      </div>
      <div
        className="mt-1 h-1 w-full rounded-full"
        style={{
          background:
            "linear-gradient(90deg, #D9AE5C 0%, #C8964A 50%, transparent 100%)",
          opacity: count > 0 ? 1 : 0.2,
        }}
      />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatItem
          icon={<Clock className="h-3.5 w-3.5" />}
          label="耗时"
          value={duration != null ? `${duration.toFixed(0)} ms` : "—"}
        />
        <StatItem
          icon={<Target className="h-3.5 w-3.5" />}
          label="平均置信度"
          value={
            avgConfidence > 0 ? `${(avgConfidence * 100).toFixed(0)}%` : "—"
          }
        />
      </div>

      {count === 0 && !isDetecting && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-jade-600/5 px-3 py-2 text-xs text-jade-600/60 dark:bg-paper-100/5 dark:text-paper-100/50">
          <TrendingUp className="h-3.5 w-3.5 shrink-0" />
          未检测到珠子，可调整下方参数后重新识别，或手动添加
        </div>
      )}
    </div>
  );
}

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-jade-600/5 px-3 py-2.5 dark:bg-paper-100/5">
      <div className="flex items-center gap-1.5 text-jade-600/50 dark:text-paper-100/40">
        {icon}
        <span className="text-[11px]">{label}</span>
      </div>
      <div className="mt-1 font-mono text-sm font-semibold text-jade-600 dark:text-paper-100">
        {value}
      </div>
    </div>
  );
}
