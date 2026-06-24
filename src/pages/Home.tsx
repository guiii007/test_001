import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import ImageAcquisition from "@/components/ImageAcquisition";
import AnnotationCanvas from "@/components/AnnotationCanvas";
import ResultStats from "@/components/ResultStats";
import ParameterPanel from "@/components/ParameterPanel";
import Toolbar from "@/components/Toolbar";
import HistoryDrawer from "@/components/HistoryDrawer";
import OpenCVLoader from "@/components/OpenCVLoader";
import { useBeadStore } from "@/store/useBeadStore";
import { useOpenCV } from "@/hooks/useOpenCV";
import { useDetection } from "@/hooks/useDetection";

export default function Home() {
  const hasImage = useBeadStore((s) => s.hasImage);
  const imageCanvas = useBeadStore((s) => s.imageCanvas);
  const beads = useBeadStore((s) => s.beads);
  const history = useBeadStore((s) => s.history);
  const reset = useBeadStore((s) => s.reset);
  const { status: cvStatus } = useOpenCV();
  const { run } = useDetection();

  const [historyOpen, setHistoryOpen] = useState(false);
  const autoRanRef = useRef<string | null>(null);

  // 图片加载后自动识别（OpenCV 就绪时）
  useEffect(() => {
    if (!imageCanvas || cvStatus !== "ready") return;
    const sig = `${imageCanvas.width}x${imageCanvas.height}-${beads.length}`;
    if (autoRanRef.current === sig) return;
    autoRanRef.current = sig;
    run();
  }, [imageCanvas, cvStatus, run, beads.length]);

  const handleChangeImage = () => {
    autoRanRef.current = null;
    reset();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <OpenCVLoader />
      <Header
        onToggleHistory={() => setHistoryOpen(true)}
        historyCount={history.length}
      />

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-5 sm:px-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
          {/* 左侧：图像区 */}
          <section className="flex min-h-[60vh] flex-col lg:min-h-[calc(100vh-7rem)]">
            {hasImage ? (
              <AnnotationCanvas />
            ) : (
              <ImageAcquisition />
            )}
          </section>

          {/* 右侧：结果与控制 */}
          <aside className="flex flex-col gap-4">
            <ResultStats />
            <ParameterPanel onRedetect={run} />
            <Toolbar onRedetect={run} onChangeImage={handleChangeImage} />
            <TipsCard />
          </aside>
        </div>
      </main>

      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  );
}

function TipsCard() {
  return (
    <div className="card p-5">
      <h3 className="font-serif text-sm font-semibold tracking-wide text-jade-600/70 dark:text-paper-100/60">
        使用提示
      </h3>
      <ul className="mt-3 space-y-2 text-xs leading-relaxed text-jade-600/60 dark:text-paper-100/50">
        <li className="flex gap-2">
          <span className="mt-0.5 text-amber-400">·</span>
          <span>拍摄时让珠子平铺展开，避免严重重叠遮挡</span>
        </li>
        <li className="flex gap-2">
          <span className="mt-0.5 text-amber-400">·</span>
          <span>识别不准时可调整「最小/最大半径」匹配实际珠子尺寸</span>
        </li>
        <li className="flex gap-2">
          <span className="mt-0.5 text-amber-400">·</span>
          <span>调低「检测灵敏度」可减少误检，调高则更易识别模糊珠子</span>
        </li>
        <li className="flex gap-2">
          <span className="mt-0.5 text-amber-400">·</span>
          <span>点击画布上的珠子可删除误识别项，开启「手动添加」可补漏</span>
        </li>
      </ul>
    </div>
  );
}
