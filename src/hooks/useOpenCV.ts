import { useEffect, useState, useCallback } from "react";
import type { OpenCVStatus } from "@/types";
import type { OpenCV } from "@/types/opencv";

const OPENCV_CDN =
  "https://docs.opencv.org/4.10.0/opencv.js";

let loadPromise: Promise<void> | null = null;

/** 判断 cv 是否已就绪为 OpenCV 实例 */
function isReady(cv: unknown): cv is OpenCV {
  return !!cv && typeof cv === "object" && "Mat" in (cv as object);
}

/** 将可能是工厂函数的 cv 解析为 OpenCV 实例 */
function resolveCV(cv: Window["cv"]): Promise<OpenCV> {
  if (typeof cv === "function") {
    return (cv as (...args: unknown[]) => Promise<OpenCV>)();
  }
  return Promise.resolve(cv as OpenCV);
}

function loadOpenCV(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  // 已就绪
  if (isReady(window.cv)) return Promise.resolve();
  // 正在加载
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById("opencv-script") as HTMLScriptElement | null;
    const script =
      existing ||
      (document.createElement("script") as HTMLScriptElement);
    script.id = "opencv-script";
    script.async = true;
    script.src = OPENCV_CDN;

    const onReady = () => {
      const raw = window.cv;
      if (!raw) {
        reject(new Error("OpenCV 加载失败"));
        return;
      }
      // 已是实例
      if (isReady(raw)) {
        resolve();
        return;
      }
      // 工厂函数
      if (typeof raw === "function") {
        resolveCV(raw)
          .then(() => resolve())
          .catch(() => reject(new Error("OpenCV 初始化失败")));
        return;
      }
      // 带 onRuntimeInitialized 回调
      const obj = raw as OpenCV;
      if (typeof obj.onRuntimeInitialized !== "undefined") {
        obj.onRuntimeInitialized = () => resolve();
      } else {
        // 轮询等待运行时初始化
        let tries = 0;
        const timer = setInterval(() => {
          tries += 1;
          if (isReady(window.cv)) {
            clearInterval(timer);
            resolve();
          } else if (tries > 200) {
            clearInterval(timer);
            reject(new Error("OpenCV 初始化超时"));
          }
        }, 100);
      }
    };

    script.onload = onReady;
    script.onerror = () =>
      reject(new Error("OpenCV 脚本加载失败，请检查网络"));
    if (!existing) document.head.appendChild(script);
  });

  return loadPromise;
}

export function useOpenCV() {
  const [status, setStatus] = useState<OpenCVStatus>("idle");
  const [progress, setProgress] = useState(0);

  const init = useCallback(async () => {
    if (status === "loading" || status === "ready") return;
    setStatus("loading");
    setProgress(15);
    // 模拟加载进度反馈
    const timer = setInterval(() => {
      setProgress((p) => (p < 90 ? p + Math.random() * 8 : p));
    }, 400);
    try {
      await loadOpenCV();
      setProgress(100);
      setStatus("ready");
    } catch (e) {
      console.error(e);
      setStatus("error");
    } finally {
      clearInterval(timer);
    }
  }, [status]);

  useEffect(() => {
    init();
  }, [init]);

  return { status, progress, retry: init };
}
