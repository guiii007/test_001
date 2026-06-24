import { useRef, useState, useCallback } from "react";
import { Upload, Camera, Sparkles, Image as ImageIcon, X } from "lucide-react";
import { loadImageFromFile } from "@/lib/image";
import { generateSampleBracelet } from "@/lib/sample";
import { useBeadStore } from "@/store/useBeadStore";

export default function ImageAcquisition() {
  const setImage = useBeadStore((s) => s.setImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!file.type.startsWith("image/")) {
        setError("请选择图片文件");
        return;
      }
      try {
        const { canvas } = await loadImageFromFile(file);
        setImage(canvas);
      } catch {
        setError("图片加载失败，请重试");
      }
    },
    [setImage]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const openCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      // 等待 video 元素挂载
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 50);
    } catch {
      setError("无法访问摄像头，请检查权限或使用上传功能");
    }
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0, w, h);
    closeCamera();
    setImage(canvas);
  };

  const loadSample = (type: "single" | "multi") => {
    const canvas = generateSampleBracelet(type);
    setImage(canvas);
  };

  return (
    <div className="flex h-full flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
      />

      {!cameraOpen ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className="relative flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-jade-600/25 bg-white/40 p-8 text-center transition-colors dark:border-paper-100/20 dark:bg-ink-100/40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, rgba(200,150,74,0.06) 0%, transparent 60%)",
          }}
        >
          {/* 装饰珠子图案 */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.07]">
            <div className="grid grid-cols-5 gap-6">
              {Array.from({ length: 25 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full bg-jade-600 dark:bg-amber-400"
                />
              ))}
            </div>
          </div>

          <div
            className={`relative flex h-20 w-20 items-center justify-center rounded-full bg-jade-gradient shadow-jade transition-transform ${
              dragging ? "scale-110" : ""
            }`}
          >
            <ImageIcon className="h-9 w-9 text-amber-400" />
            <span className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-amber-400/60" />
          </div>

          <h2 className="mt-6 font-serif text-2xl font-bold text-jade-600 dark:text-paper-100">
            拍照即数珠
          </h2>
          <p className="mt-2 max-w-sm text-sm text-jade-600/60 dark:text-paper-100/50">
            上传手串照片或直接拍照，AI 自动识别每一颗珠子并标注序号
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              className="btn-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              上传图片
            </button>
            <button className="btn-ghost" onClick={openCamera}>
              <Camera className="h-4 w-4" />
              拍照
            </button>
          </div>

          <div className="mt-8 flex items-center gap-2 text-xs text-jade-600/40 dark:text-paper-100/30">
            <span className="h-px w-8 bg-current" />
            <span>或试试示例</span>
            <span className="h-px w-8 bg-current" />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1.5 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-400/25 dark:text-amber-300"
              onClick={() => loadSample("single")}
            >
              <Sparkles className="h-3.5 w-3.5" />
              单圈手串
            </button>
            <button
              className="inline-flex items-center gap-1.5 rounded-full bg-jade-600/10 px-3 py-1.5 text-xs font-medium text-jade-600 transition-colors hover:bg-jade-600/20 dark:text-jade-300"
              onClick={() => loadSample("multi")}
            >
              <Sparkles className="h-3.5 w-3.5" />
              多圈佛珠
            </button>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <p className="mt-6 text-xs text-jade-600/40 dark:text-paper-100/30">
            支持拖拽上传 · 图片仅在本地处理，不会上传服务器
          </p>
        </div>
      ) : (
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-2xl bg-black">
          <video
            ref={videoRef}
            className="flex-1 object-contain"
            playsInline
            muted
          />
          <button
            onClick={closeCamera}
            className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            aria-label="关闭摄像头"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-gradient-to-t from-black/70 to-transparent p-6">
            <button
              onClick={capture}
              className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              aria-label="拍照"
            >
              <span className="h-12 w-12 rounded-full border-4 border-jade-600 bg-amber-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
