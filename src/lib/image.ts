import type { Bead } from "@/types";

const MAX_DIMENSION = 2000;

/**
 * 加载图片文件为 HTMLImageElement，并按需压缩到 MAX_DIMENSION 内
 * 返回 { img, canvas } 用于检测与展示
 */
export function loadImageFromFile(
  file: File
): Promise<{ img: HTMLImageElement; canvas: HTMLCanvasElement; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const { canvas, width, height } = drawToCanvas(img);
      URL.revokeObjectURL(url);
      resolve({ img, canvas, width, height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片加载失败"));
    };
    img.src = url;
  });
}

/**
 * 从 dataURL 加载图片
 */
export function loadImageFromDataURL(
  dataUrl: string
): Promise<{ img: HTMLImageElement; canvas: HTMLCanvasElement; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const { canvas, width, height } = drawToCanvas(img);
      resolve({ img, canvas, width, height });
    };
    img.onerror = () => reject(new Error("图片加载失败"));
    img.src = dataUrl;
  });
}

function drawToCanvas(
  source: HTMLImageElement
): { canvas: HTMLCanvasElement; width: number; height: number } {
  let { naturalWidth: w, naturalHeight: h } = source;
  if (!w || !h) {
    w = source.width;
    h = source.height;
  }
  // 大图压缩
  if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(w, h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(source, 0, 0, w, h);
  return { canvas, width: w, height: h };
}

/**
 * 生成缩略图 base64（用于历史记录）
 */
export function makeThumbnail(
  canvas: HTMLCanvasElement,
  maxSize = 160
): string {
  const scale = Math.min(maxSize / canvas.width, maxSize / canvas.height, 1);
  const w = Math.round(canvas.width * scale);
  const h = Math.round(canvas.height * scale);
  const thumb = document.createElement("canvas");
  thumb.width = w;
  thumb.height = h;
  const ctx = thumb.getContext("2d")!;
  ctx.drawImage(canvas, 0, 0, w, h);
  return thumb.toDataURL("image/jpeg", 0.7);
}

/**
 * 将带标注的画布导出为 PNG
 */
export function exportCanvasAsPNG(canvas: HTMLCanvasElement, filename: string): void {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, "image/png");
}

/**
 * 在画布上绘制珠子标注（圆框 + 序号）
 */
export function drawAnnotations(
  ctx: CanvasRenderingContext2D,
  beads: Bead[],
  options: {
    hoveredId?: string | null;
    showOrder?: boolean;
    accentColor?: string;
    ringColor?: string;
  } = {}
): void {
  const { hoveredId, showOrder = true, accentColor = "#C8964A", ringColor = "#C8964A" } = options;

  beads.forEach((bead) => {
    const isHovered = bead.id === hoveredId;
    // 外圈光晕
    if (isHovered) {
      ctx.beginPath();
      ctx.arc(bead.x, bead.y, bead.radius + 6, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(200, 150, 74, 0.35)";
      ctx.lineWidth = 6;
      ctx.stroke();
    }
    // 主圆框
    ctx.beginPath();
    ctx.arc(bead.x, bead.y, bead.radius, 0, Math.PI * 2);
    ctx.strokeStyle = isHovered ? accentColor : ringColor;
    ctx.lineWidth = isHovered ? 3 : 2;
    ctx.stroke();

    // 序号标签
    if (showOrder) {
      const labelRadius = Math.max(bead.radius * 0.55, 10);
      ctx.beginPath();
      ctx.arc(bead.x, bead.y, labelRadius, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? accentColor : "rgba(31, 61, 46, 0.85)";
      ctx.fill();
      ctx.strokeStyle = "rgba(245, 241, 232, 0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#F5F1E8";
      ctx.font = `700 ${Math.max(labelRadius, 11)}px "JetBrains Mono", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(bead.order), bead.x, bead.y + 1);
    }
  });
}

/**
 * 根据画布坐标查找命中的珠子
 */
export function findBeadAt(
  beads: Bead[],
  x: number,
  y: number
): Bead | null {
  // 从后往前查找（顶层优先）
  for (let i = beads.length - 1; i >= 0; i--) {
    const b = beads[i];
    const dx = x - b.x;
    const dy = y - b.y;
    if (dx * dx + dy * dy <= b.radius * b.radius) {
      return b;
    }
  }
  return null;
}
