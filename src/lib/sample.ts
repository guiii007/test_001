/**
 * 生成示例手串图片（Canvas 绘制）
 * 模拟单圈/多圈石珠手串，供用户无图时快速体验
 */
export function generateSampleBracelet(
  type: "single" | "multi" = "single"
): HTMLCanvasElement {
  const W = 1200;
  const H = 900;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // 背景：木纹/桌面质感
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#3a2a1c");
  bg.addColorStop(0.5, "#4a3525");
  bg.addColorStop(1, "#2e1f14");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 木纹纹理
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 40; i++) {
    ctx.beginPath();
    const y = (H / 40) * i + Math.random() * 8;
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(W * 0.3, y + Math.random() * 10 - 5, W * 0.6, y + Math.random() * 10 - 5, W, y);
    ctx.stroke();
  }

  const beadColors = [
    "#1F3D2E", "#2F6B50", "#4F8A6E", "#7FAE97",
    "#6B4C20", "#8E652A", "#B07F35", "#C8964A",
    "#5a3a2a", "#3a2a1c",
  ];

  const drawBead = (cx: number, cy: number, r: number, color: string) => {
    // 阴影
    ctx.beginPath();
    ctx.arc(cx + 2, cy + 3, r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fill();
    // 主体（径向渐变模拟石珠光泽）
    const grad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
    grad.addColorStop(0, lighten(color, 0.4));
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, darken(color, 0.4));
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    // 高光
    ctx.beginPath();
    ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fill();
  };

  if (type === "single") {
    // 单圈手串：圆形排列
    const cx = W / 2;
    const cy = H / 2;
    const ringR = 300;
    const count = 18;
    const beadR = 42;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
      const x = cx + Math.cos(angle) * ringR;
      const y = cy + Math.sin(angle) * ringR;
      drawBead(x, y, beadR, beadColors[i % beadColors.length]);
    }
  } else {
    // 多圈手串：3 圈堆叠
    const cx = W / 2;
    const cy = H / 2;
    const configs = [
      { ringR: 320, count: 22, beadR: 34 },
      { ringR: 250, count: 18, beadR: 32 },
      { ringR: 180, count: 14, beadR: 30 },
    ];
    configs.forEach((cfg, idx) => {
      for (let i = 0; i < cfg.count; i++) {
        const angle = (Math.PI * 2 * i) / cfg.count - Math.PI / 2 + idx * 0.2;
        const x = cx + Math.cos(angle) * cfg.ringR;
        const y = cy + Math.sin(angle) * cfg.ringR;
        drawBead(x, y, cfg.beadR, beadColors[(i + idx) % beadColors.length]);
      }
    });
  }

  return canvas;
}

function lighten(hex: string, amount: number): string {
  const { r, g, b } = parseHex(hex);
  return `rgb(${Math.min(255, r + (255 - r) * amount)},${Math.min(255, g + (255 - g) * amount)},${Math.min(255, b + (255 - b) * amount)})`;
}

function darken(hex: string, amount: number): string {
  const { r, g, b } = parseHex(hex);
  return `rgb(${Math.max(0, r * (1 - amount))},${Math.max(0, g * (1 - amount))},${Math.max(0, b * (1 - amount))})`;
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}
