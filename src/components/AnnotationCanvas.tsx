import { useEffect, useRef, useState, useCallback } from "react";
import { MousePointerClick, Trash2, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { useBeadStore } from "@/store/useBeadStore";
import { drawAnnotations, findBeadAt, exportCanvasAsPNG } from "@/lib/image";
import type { Bead } from "@/types";

interface AnnotationCanvasProps {
  onExport?: () => void;
}

export default function AnnotationCanvas({ onExport }: AnnotationCanvasProps) {
  const imageCanvas = useBeadStore((s) => s.imageCanvas);
  const beads = useBeadStore((s) => s.beads);
  const isDetecting = useBeadStore((s) => s.isDetecting);
  const hoveredBeadId = useBeadStore((s) => s.hoveredBeadId);
  const addMode = useBeadStore((s) => s.addMode);
  const setHovered = useBeadStore((s) => s.setHovered);
  const addBead = useBeadStore((s) => s.addBead);
  const removeBead = useBeadStore((s) => s.removeBead);
  const toggleAddMode = useBeadStore((s) => s.toggleAddMode);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [fitScale, setFitScale] = useState(1);
  const [scanProgress, setScanProgress] = useState(0);

  // 绘制
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const src = imageCanvas;
    if (!canvas || !src) return;
    canvas.width = src.width;
    canvas.height = src.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(src, 0, 0);
    if (!isDetecting && beads.length > 0) {
      drawAnnotations(ctx, beads, { hoveredId: hoveredBeadId });
    }
  }, [imageCanvas, beads, isDetecting, hoveredBeadId]);

  useEffect(() => {
    render();
  }, [render]);

  // 计算 fit scale
  useEffect(() => {
    const compute = () => {
      const container = containerRef.current;
      if (!container || !imageCanvas) return;
      const cw = container.clientWidth - 32;
      const ch = container.clientHeight - 32;
      const scale = Math.min(cw / imageCanvas.width, ch / imageCanvas.height, 1);
      setFitScale(scale);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [imageCanvas]);

  // 扫描动画
  useEffect(() => {
    if (!isDetecting) {
      setScanProgress(0);
      return;
    }
    let raf: number;
    const animate = () => {
      setScanProgress((p) => (p >= 1 ? 0 : p + 0.008));
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isDetecting]);

  // 坐标转换：CSS 像素 -> 画布内部坐标
  const toCanvasCoord = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (addMode) return;
    const coord = toCanvasCoord(e.clientX, e.clientY);
    if (!coord) return;
    const found = findBeadAt(beads, coord.x, coord.y);
    setHovered(found ? found.id : null);
  };

  const handleClick = (e: React.MouseEvent) => {
    const coord = toCanvasCoord(e.clientX, e.clientY);
    if (!coord) return;
    if (addMode) {
      addBead(coord.x, coord.y);
      return;
    }
    const found = findBeadAt(beads, coord.x, coord.y);
    if (found) {
      removeBead(found.id);
    }
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // 导出带标注的图：重绘一份带标注的到临时画布
    const tmp = document.createElement("canvas");
    tmp.width = canvas.width;
    tmp.height = canvas.height;
    const ctx = tmp.getContext("2d")!;
    ctx.drawImage(imageCanvas!, 0, 0);
    drawAnnotations(ctx, beads, {});
    exportCanvasAsPNG(tmp, `珠玑计数_${beads.length}颗_${Date.now()}.png`);
    onExport?.();
  };

  const displayScale = fitScale * zoom;
  const displayWidth = imageCanvas ? imageCanvas.width * displayScale : 0;
  const displayHeight = imageCanvas ? imageCanvas.height * displayScale : 0;

  return (
    <div
      ref={containerRef}
      className="relative flex h-full min-h-[400px] items-center justify-center overflow-hidden rounded-2xl border border-jade-600/10 bg-ink-200/90 p-4 dark:border-paper-100/10"
    >
      {/* 棋盘格背景体现透明 */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(45deg, #2a2a2a 25%, transparent 25%), linear-gradient(-45deg, #2a2a2a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a2a2a 75%), linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
        }}
      />

      {imageCanvas && (
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHovered(null)}
          className="relative max-h-full max-w-full rounded-lg shadow-2xl"
          style={{
            width: displayWidth || undefined,
            height: displayHeight || undefined,
            cursor: addMode
              ? "crosshair"
              : hoveredBeadId
              ? "pointer"
              : "default",
          }}
        />
      )}

      {/* 扫描动画 */}
      {isDetecting && imageCanvas && (
        <div
          className="pointer-events-none absolute left-4 right-4"
          style={{
            top: `calc(50% - ${displayHeight / 2}px + ${scanProgress * displayHeight}px)`,
            height: "2px",
            width: displayWidth,
            margin: "0 auto",
            background:
              "linear-gradient(90deg, transparent, #C8964A, transparent)",
            boxShadow: "0 0 12px 2px rgba(200,150,74,0.6)",
          }}
        />
      )}

      {/* 检测中遮罩 */}
      {isDetecting && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-jade-600/80 px-5 py-2.5 font-mono text-sm text-amber-400 shadow-jade backdrop-blur-sm">
            识别中…
          </div>
        </div>
      )}

      {/* 工具浮层 */}
      {imageCanvas && !isDetecting && (
        <div className="absolute right-4 top-4 flex flex-col gap-1.5">
          <ToolButton
            onClick={() => setZoom((z) => Math.min(z + 0.2, 3))}
            disabled={zoom >= 3}
            title="放大"
          >
            <ZoomIn className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.4))}
            disabled={zoom <= 0.4}
            title="缩小"
          >
            <ZoomOut className="h-4 w-4" />
          </ToolButton>
          <ToolButton onClick={() => setZoom(1)} title="重置缩放">
            <Maximize className="h-4 w-4" />
          </ToolButton>
        </div>
      )}

      {/* 左下角信息 */}
      {imageCanvas && (
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <span className="rounded-md bg-black/50 px-2 py-1 font-mono text-[11px] text-paper-100 backdrop-blur-sm">
            {imageCanvas.width} × {imageCanvas.height}
          </span>
          {beads.length > 0 && (
            <span className="rounded-md bg-amber-400/80 px-2 py-1 font-mono text-[11px] font-bold text-jade-700 backdrop-blur-sm">
              {beads.length} 颗
            </span>
          )}
        </div>
      )}

      {/* 模式提示 */}
      {imageCanvas && !isDetecting && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          {addMode ? (
            <button
              onClick={toggleAddMode}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-medium text-jade-700 shadow-amber transition-transform hover:scale-105"
            >
              <MousePointerClick className="h-3.5 w-3.5" />
              点击画布添加（完成）
            </button>
          ) : (
            <button
              onClick={toggleAddMode}
              className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-paper-100 backdrop-blur-sm transition-colors hover:bg-black/70"
            >
              <MousePointerClick className="h-3.5 w-3.5" />
              手动添加
            </button>
          )}
          <button
            onClick={handleExport}
            disabled={beads.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-paper-100 backdrop-blur-sm transition-colors hover:bg-black/70 disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            导出标注图
          </button>
        </div>
      )}

      {/* 操作提示 */}
      {imageCanvas && !isDetecting && beads.length > 0 && !addMode && (
        <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-[11px] text-paper-100/80 backdrop-blur-sm">
          悬停查看 · 点击珠子删除
        </div>
      )}
    </div>
  );
}

function ToolButton({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black/50 text-paper-100 backdrop-blur-sm transition-colors hover:bg-black/70 disabled:opacity-30"
    >
      {children}
    </button>
  );
}

// 供外部调用导出
export type { Bead };
