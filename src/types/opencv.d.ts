// OpenCV.js 最小类型声明（仅覆盖本项目用到的 API）
// 完整类型见 https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html
// 注：window.cv 在运行时初始化后即为 OpenCV 实例

export interface CvMat {
  cols: number;
  rows: number;
  data32F: Float32Array;
  data32S: Int32Array;
  data8U: Uint8Array;
  delete(): void;
}

export interface CvSize {
  width: number;
  height: number;
}

export interface OpenCV {
  Mat: new () => CvMat;
  HOUGH_GRADIENT: number;
  COLOR_RGBA2GRAY: number;
  BORDER_DEFAULT: number;
  imread(source: HTMLImageElement | HTMLCanvasElement | ImageBitmap): CvMat;
  cvtColor(src: CvMat, dst: CvMat, code: number): void;
  GaussianBlur(
    src: CvMat,
    dst: CvMat,
    ksize: CvSize,
    sigmaX: number,
    sigmaY: number,
    borderType: number
  ): void;
  HoughCircles(
    image: CvMat,
    circles: CvMat,
    method: number,
    dp: number,
    minDist: number,
    param1: number,
    param2: number,
    minRadius: number,
    maxRadius: number
  ): void;
  Size: new (width: number, height: number) => CvSize;
  onRuntimeInitialized?: () => void;
}

declare global {
  interface Window {
    // 加载完成后为 OpenCV 实例；加载中可能为工厂函数
    cv?: OpenCV | ((...args: unknown[]) => Promise<OpenCV>);
    Module?: unknown;
  }
}
