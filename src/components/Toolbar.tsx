import { RefreshCw, ImagePlus, Save, Trash2 } from "lucide-react";
import { useBeadStore } from "@/store/useBeadStore";

interface ToolbarProps {
  onRedetect: () => void;
  onChangeImage: () => void;
}

export default function Toolbar({ onRedetect, onChangeImage }: ToolbarProps) {
  const hasImage = useBeadStore((s) => s.hasImage);
  const beads = useBeadStore((s) => s.beads);
  const isDetecting = useBeadStore((s) => s.isDetecting);
  const reset = useBeadStore((s) => s.reset);
  const saveCurrentToHistory = useBeadStore((s) => s.saveCurrentToHistory);

  if (!hasImage) return null;

  return (
    <div className="card flex flex-wrap items-center gap-2 p-3">
      <button
        className="btn-primary flex-1 sm:flex-none"
        onClick={onRedetect}
        disabled={isDetecting}
      >
        <RefreshCw className={`h-4 w-4 ${isDetecting ? "animate-spin" : ""}`} />
        重新识别
      </button>
      <button className="btn-ghost" onClick={onChangeImage}>
        <ImagePlus className="h-4 w-4" />
        换图
      </button>
      <button
        className="btn-ghost"
        onClick={saveCurrentToHistory}
        disabled={beads.length === 0}
      >
        <Save className="h-4 w-4" />
        存记录
      </button>
      <button
        className="btn-ghost text-red-500/80 hover:bg-red-500/10 dark:text-red-400"
        onClick={() => {
          if (confirm("确定要清空当前图片与结果吗？")) reset();
        }}
      >
        <Trash2 className="h-4 w-4" />
        清空
      </button>
    </div>
  );
}
