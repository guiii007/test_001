import { useCallback } from "react";
import { useBeadStore } from "@/store/useBeadStore";
import { detectBeads } from "@/lib/detection";
import type { DetectionResult } from "@/types";

export function useDetection() {
  const imageCanvas = useBeadStore((s) => s.imageCanvas);
  const params = useBeadStore((s) => s.params);
  const setDetecting = useBeadStore((s) => s.setDetecting);
  const setResult = useBeadStore((s) => s.setResult);

  const run = useCallback(() => {
    if (!imageCanvas) return;
    const cv = window.cv;
    if (!cv || typeof cv === "function" || !("Mat" in cv)) {
      console.warn("OpenCV 未就绪");
      return;
    }
    setDetecting(true);
    // 异步执行，让 UI 有机会渲染 loading 状态
    setTimeout(() => {
      try {
        const { beads, duration } = detectBeads(imageCanvas, params);
        const result: DetectionResult = {
          beads,
          totalCount: beads.length,
          duration,
          params: { ...params },
          timestamp: Date.now(),
        };
        setResult(result);
      } catch (e) {
        console.error("识别失败", e);
        setDetecting(false);
      }
    }, 60);
  }, [imageCanvas, params, setDetecting, setResult]);

  return { run };
}
