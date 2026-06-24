import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useOpenCV } from "@/hooks/useOpenCV";

export default function OpenCVLoader() {
  const { status, progress, retry } = useOpenCV();

  if (status === "ready") return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-paper-100/95 backdrop-blur-md dark:bg-ink-200/95">
      <div className="mx-4 max-w-md text-center">
        {status === "error" ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="mt-5 font-serif text-xl font-bold text-jade-600 dark:text-paper-100">
              引擎加载失败
            </h2>
            <p className="mt-2 text-sm text-jade-600/60 dark:text-paper-100/50">
              图像识别引擎加载失败，请检查网络连接后重试
            </p>
            <button className="btn-primary mt-6" onClick={retry}>
              <RefreshCw className="h-4 w-4" />
              重新加载
            </button>
          </>
        ) : (
          <>
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-amber-400/50" />
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-jade-gradient shadow-jade">
                <Loader2 className="h-7 w-7 animate-spin text-amber-400" />
              </div>
            </div>
            <h2 className="mt-6 font-serif text-xl font-bold text-jade-600 dark:text-paper-100">
              正在加载识别引擎
            </h2>
            <p className="mt-2 text-sm text-jade-600/60 dark:text-paper-100/50">
              首次加载需下载图像处理库，约 8MB，请稍候
            </p>
            <div className="mt-5 mx-auto h-1.5 w-56 overflow-hidden rounded-full bg-jade-600/10 dark:bg-paper-100/10">
              <div
                className="h-full rounded-full bg-amber-gradient transition-all duration-300"
                style={{ width: `${Math.round(progress)}%` }}
              />
            </div>
            <p className="mt-2 font-mono text-xs text-amber-500">
              {Math.round(progress)}%
            </p>
          </>
        )}
      </div>
    </div>
  );
}
