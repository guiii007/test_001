import type { Bead, DetectParams } from "@/types";
import type { OpenCV } from "@/types/opencv";

interface RawCircle {
  x: number;
  y: number;
  radius: number;
}

/** 获取已就绪的 OpenCV 实例（运行时已确保加载完成） */
function getCV(): OpenCV {
  const cv = window.cv;
  if (!cv || typeof cv === "function" || !("Mat" in cv)) {
    throw new Error("OpenCV 未就绪");
  }
  return cv;
}

/**
 * 使用 OpenCV.js 进行霍夫圆变换检测珠子
 * 输入为 HTMLImageElement / HTMLCanvasElement / ImageBitmap
 */
export function detectBeads(
  source: HTMLImageElement | HTMLCanvasElement | ImageBitmap,
  params: DetectParams
): { beads: Bead[]; duration: number } {
  const cv = getCV();

  const start = performance.now();

  const src = cv.imread(source);
  const gray = new cv.Mat();
  const blurred = new cv.Mat();
  const circles = new cv.Mat();

  try {
    // 灰度化
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    // 高斯降噪，消除细小纹理干扰
    const ksize = new cv.Size(5, 5);
    cv.GaussianBlur(gray, blurred, ksize, 1.5, 1.5, cv.BORDER_DEFAULT);

    // 圆心最小间距：取最小半径的 1.4 倍，避免同一珠子被多次检测
    const minDist = Math.max(params.minRadius * 1.4, 10);

    cv.HoughCircles(
      blurred,
      circles,
      cv.HOUGH_GRADIENT,
      1.2, // dp 累加器分辨率比
      minDist,
      params.cannyThreshold, // param1 Canny 高阈值
      params.threshold, // param2 累加器阈值
      params.minRadius,
      params.maxRadius
    );

    // 解析检测结果
    const raw: RawCircle[] = [];
    for (let i = 0; i < circles.cols; i++) {
      const x = circles.data32F[i * 3];
      const y = circles.data32F[i * 3 + 1];
      const r = circles.data32F[i * 3 + 2];
      if (x > 0 && y > 0 && r > 0) {
        raw.push({ x, y, radius: r });
      }
    }

    // 后处理：去重 + 过滤异常
    const filtered = postProcess(raw, params);

    // 排序生成序号：从左到右、从上到下（按 y 分带后 x 排序）
    const sorted = sortByReadingOrder(filtered);

    const beads: Bead[] = sorted.map((c, idx) => ({
      id: `bead-${idx}-${Math.round(c.x)}-${Math.round(c.y)}`,
      x: c.x,
      y: c.y,
      radius: c.radius,
      order: idx + 1,
      confidence: computeConfidence(c, filtered),
    }));

    return { beads, duration: performance.now() - start };
  } finally {
    src.delete();
    gray.delete();
    blurred.delete();
    circles.delete();
  }
}

/**
 * 后处理：去除重叠圆 + 过滤半径异常
 */
function postProcess(raw: RawCircle[], params: DetectParams): RawCircle[] {
  if (raw.length === 0) return [];

  // 按半径排序，优先保留更稳定的检测
  const sorted = [...raw].sort((a, b) => a.radius - b.radius);

  // 半径中位数，用于过滤异常值
  const radii = sorted.map((c) => c.radius);
  const median = radii[Math.floor(radii.length / 2)];
  const radiusTolerance = median * 0.6; // 允许偏离中位数 60%

  const kept: RawCircle[] = [];
  for (const c of sorted) {
    // 半径异常过滤
    if (Math.abs(c.radius - median) > radiusTolerance && sorted.length > 3) {
      continue;
    }
    // 重叠去重：若与已保留的圆心距离小于两者较小半径，则跳过
    const tooClose = kept.some((k) => {
      const dx = c.x - k.x;
      const dy = c.y - k.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist < Math.min(c.radius, k.radius) * 0.8;
    });
    if (!tooClose) kept.push(c);
  }

  // 兜底：若过滤过狠，放宽半径限制
  if (kept.length === 0 && raw.length > 0) {
    return raw;
  }

  void params;
  return kept;
}

/**
 * 按阅读顺序排序：先按 y 分带（带宽=中位半径*2），带内按 x 排序
 */
function sortByReadingOrder(circles: RawCircle[]): RawCircle[] {
  if (circles.length === 0) return [];
  const radii = circles.map((c) => c.radius);
  const median = radii.sort((a, b) => a - b)[Math.floor(radii.length / 2)];
  const bandHeight = Math.max(median * 2.2, 20);

  // 按 y 中心分带
  const sortedByY = [...circles].sort((a, b) => a.y - b.y);
  const bands: RawCircle[][] = [];
  for (const c of sortedByY) {
    const lastBand = bands[bands.length - 1];
    if (lastBand && Math.abs(c.y - lastBand[0].y) < bandHeight) {
      lastBand.push(c);
    } else {
      bands.push([c]);
    }
  }
  // 带内按 x 排序，交替方向更符合手串环绕（这里统一从左到右）
  return bands.flatMap((band) => band.sort((a, b) => a.x - b.x));
}

/**
 * 置信度估算：半径越接近中位数，置信度越高
 */
function computeConfidence(c: RawCircle, all: RawCircle[]): number {
  if (all.length === 0) return 0.5;
  const radii = all.map((x) => x.radius);
  const median = radii.sort((a, b) => a - b)[Math.floor(radii.length / 2)];
  const diff = Math.abs(c.radius - median) / median;
  return Math.max(0.4, Math.min(1, 1 - diff * 0.8));
}
