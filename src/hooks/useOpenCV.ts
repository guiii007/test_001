import { useEffect, useState, useRef, useCallback } from "react";
import type { OpenCVStatus } from "@/types";
import type { OpenCV } from "@/types/opencv";

// 官方推荐 URL：4.x 始终指向最新稳定预编译版本
const OPENCV_CDN = "https://docs.opencv.org/4.x/opencv.js";

let loadPromise: Promise<void> | null = null;

/** 判断 cv 是否已完全就绪（WASM 运行时初始化完成） */
function isReady(cv: unknown): cv is OpenCV {
  return !!cv && typeof cv === "object" && "Mat" in (cv as object);
}

/**
 * 加载 OpenCV.js 并等待 WASM 运行时完全初始化。
 *
 * 关键点：script.onload 仅表示脚本下载完成，此时 window.cv 可能尚未定义，
 * 或已定义但 WASM 仍在初始化。需要轮询等待 cv.Mat 可用。
 */
function loadOpenCV(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("no window"));
  }
  // 已就绪
  if (isReady(window.cv)) return Promise.resolve();
  // 正在加载中（复用同一个 promise）
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let timeoutTimer: ReturnType<typeof setTimeout> | null = null;
    let callbackSet = false;

    const cleanup = () => {
      if (pollTimer) clearInterval(pollTimer);
      if (timeoutTimer) clearTimeout(timeoutTimer);
    };

    /**
     * 轮询等待 cv 就绪：
     * 1. window.cv 未定义 → 继续等
     * 2. cv 已定义但无 Mat → 设置 onRuntimeInitialized 回调 + 继续轮询作保险
     * 3. cv.Mat 可用 → 完成
     */
    const waitForReady = () => {
      pollTimer = setInterval(() => {
        const cv = window.cv;
        if (!cv) return; // 脚本还在解析，cv 尚未挂载到 window

        // 已完全就绪
        if (isReady(cv)) {
          cleanup();
          resolve();
          return;
        }

        // cv 对象已出现，但 WASM 还在初始化：注册回调 + 轮询双保险
        if (typeof cv === "object" && !callbackSet) {
          callbackSet = true;
          try {
            (cv as OpenCV).onRuntimeInitialized = () => {
              if (isReady(window.cv)) {
                cleanup();
                resolve();
              }
            };
          } catch {
            // 某些版本 cv 是只读的，忽略赋值错误，靠轮询兜底
          }
        }
      }, 120);

      // 60 秒超时（OpenCV.js 约 8MB，慢网络下需要时间）
      timeoutTimer = setTimeout(() => {
        cleanup();
        reject(
          new Error(
            "OpenCV 初始化超时（60秒）。请检查网络连接后点击重新加载。"
          )
        );
      }, 60000);
    };

    // 若脚本标签已存在（如 HMR 重载场景），直接等待就绪
    const existing = document.getElementById(
      "opencv-script"
    ) as HTMLScriptElement | null;
    if (existing) {
      waitForReady();
      return;
    }

    const script = document.createElement("script");
    script.id = "opencv-script";
    script.async = true;
    script.src = OPENCV_CDN;
    script.onload = () => {
      // 脚本下载完成，开始等待 WASM 运行时初始化
      waitForReady();
    };
    script.onerror = () => {
      cleanup();
      reject(new Error("OpenCV 脚本下载失败，请检查网络连接"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function useOpenCV() {
  const [status, setStatus] = useState<OpenCVStatus>("idle");
  const [progress, setProgress] = useState(0);
  // 用 ref 防止 useEffect 因 status 变化而重复触发（避免加载失败→error→重载循环）
  const startedRef = useRef(false);

  const doLoad = useCallback(async () => {
    setStatus("loading");
    setProgress(8);

    // 进度条平滑增长：越接近 90 越慢，给 WASM 初始化留时间
    const progressTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        const increment = (90 - p) * 0.05 + 0.3;
        return Math.min(90, p + increment);
      });
    }, 400);

    try {
      await loadOpenCV();
      setProgress(100);
      setStatus("ready");
    } catch (e) {
      console.error("OpenCV 加载失败", e);
      setStatus("error");
      // 重置 promise，允许重试
      loadPromise = null;
    } finally {
      clearInterval(progressTimer);
    }
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    doLoad();
  }, [doLoad]);

  const retry = useCallback(() => {
    loadPromise = null;
    startedRef.current = true;
    doLoad();
  }, [doLoad]);

  return { status, progress, retry };
}
