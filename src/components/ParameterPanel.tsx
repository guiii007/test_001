import { useState, useEffect } from "react";
import { SlidersHorizontal, ChevronDown, RotateCcw } from "lucide-react";
import { useBeadStore } from "@/store/useBeadStore";
import { DEFAULT_PARAMS } from "@/types";

interface ParameterPanelProps {
  onRedetect: () => void;
}

export default function ParameterPanel({ onRedetect }: ParameterPanelProps) {
  const params = useBeadStore((s) => s.params);
  const setParams = useBeadStore((s) => s.setParams);
  const hasImage = useBeadStore((s) => s.hasImage);
  const isDetecting = useBeadStore((s) => s.isDetecting);
  const [expanded, setExpanded] = useState(true);

  if (!hasImage) return null;

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-amber-400" />
          <h3 className="font-serif text-sm font-semibold tracking-wide text-jade-600/70 dark:text-paper-100/60">
            识别参数
          </h3>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-jade-600/40 transition-transform dark:text-paper-100/40 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="space-y-5 px-5 pb-5">
          <SliderField
            label="最小半径"
            value={params.minRadius}
            min={4}
            max={100}
            step={1}
            unit="px"
            onChange={(v) => setParams({ minRadius: v })}
          />
          <SliderField
            label="最大半径"
            value={params.maxRadius}
            min={10}
            max={200}
            step={1}
            unit="px"
            onChange={(v) => setParams({ maxRadius: v })}
          />
          <SliderField
            label="检测灵敏度"
            value={params.threshold}
            min={10}
            max={80}
            step={1}
            hint="值越小越敏感，可能多检；值越大越严格，可能漏检"
            onChange={(v) => setParams({ threshold: v })}
          />
          <SliderField
            label="边缘阈值"
            value={params.cannyThreshold}
            min={30}
            max={200}
            step={5}
            onChange={(v) => setParams({ cannyThreshold: v })}
          />

          <div className="flex items-center gap-2 pt-1">
            <button
              className="btn-primary flex-1"
              onClick={onRedetect}
              disabled={isDetecting}
            >
              <RotateCcw className="h-4 w-4" />
              {isDetecting ? "识别中…" : "重新识别"}
            </button>
            <button
              className="btn-ghost"
              onClick={() => setParams(DEFAULT_PARAMS)}
              title="恢复默认参数"
            >
              <RotateCcw className="h-4 w-4" />
              默认
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  hint?: string;
  onChange: (v: number) => void;
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  unit,
  hint,
  onChange,
}: SliderFieldProps) {
  const [local, setLocal] = useState(value);
  useEffect(() => {
    setLocal(value);
  }, [value]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-jade-600/70 dark:text-paper-100/60">
          {label}
        </label>
        <span className="font-mono text-xs font-semibold text-amber-500">
          {local}
          {unit && <span className="ml-0.5 text-jade-600/40">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={local}
        onChange={(e) => setLocal(Number(e.target.value))}
        onMouseUp={(e) => onChange(Number((e.target as HTMLInputElement).value))}
        onTouchEnd={(e) => onChange(Number((e.target as HTMLInputElement).value))}
        className="mt-2 w-full"
      />
      {hint && (
        <p className="mt-1.5 text-[10px] leading-relaxed text-jade-600/40 dark:text-paper-100/30">
          {hint}
        </p>
      )}
    </div>
  );
}
