// 检测到的珠子
export interface Bead {
  id: string;
  x: number; // 圆心 x 坐标（图像坐标系）
  y: number; // 圆心 y 坐标（图像坐标系）
  radius: number; // 半径
  order: number; // 序号（从 1 开始）
  confidence: number; // 置信度 0-1
}

// 识别参数
export interface DetectParams {
  minRadius: number;
  maxRadius: number;
  threshold: number; // 累加器阈值 param2
  cannyThreshold: number; // Canny 高阈值 param1
}

// 识别结果
export interface DetectionResult {
  beads: Bead[];
  totalCount: number;
  duration: number; // 耗时(ms)
  params: DetectParams;
  timestamp: number;
}

// 历史记录
export interface HistoryRecord {
  id: string;
  thumbnail: string; // base64 缩略图
  totalCount: number;
  timestamp: number;
  params: DetectParams;
}

// OpenCV 加载状态
export type OpenCVStatus = "idle" | "loading" | "ready" | "error";

// 默认识别参数
export const DEFAULT_PARAMS: DetectParams = {
  minRadius: 12,
  maxRadius: 60,
  threshold: 28,
  cannyThreshold: 100,
};
