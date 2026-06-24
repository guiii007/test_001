import { create } from "zustand";
import type {
  Bead,
  DetectParams,
  HistoryRecord,
  DetectionResult,
} from "@/types";
import { DEFAULT_PARAMS } from "@/types";
import { loadSettings, saveSettings, loadHistory, addHistory as addHistoryStorage } from "@/lib/storage";
import { makeThumbnail } from "@/lib/image";

interface BeadState {
  // 图像
  imageCanvas: HTMLCanvasElement | null;
  imageWidth: number;
  imageHeight: number;
  hasImage: boolean;

  // 识别
  beads: Bead[];
  isDetecting: boolean;
  lastResult: DetectionResult | null;

  // 参数
  params: DetectParams;

  // 交互
  hoveredBeadId: string | null;
  addMode: boolean; // 手动添加模式

  // 历史
  history: HistoryRecord[];

  // 动作
  setImage: (canvas: HTMLCanvasElement) => void;
  setBeads: (beads: Bead[]) => void;
  setDetecting: (v: boolean) => void;
  setResult: (result: DetectionResult) => void;
  setParams: (p: Partial<DetectParams>) => void;
  setHovered: (id: string | null) => void;
  toggleAddMode: () => void;
  addBead: (x: number, y: number) => void;
  removeBead: (id: string) => void;
  reset: () => void;
  loadHistoryList: () => void;
  saveCurrentToHistory: () => void;
}

function reindex(beads: Bead[]): Bead[] {
  return beads.map((b, i) => ({ ...b, order: i + 1 }));
}

export const useBeadStore = create<BeadState>((set, get) => ({
  imageCanvas: null,
  imageWidth: 0,
  imageHeight: 0,
  hasImage: false,
  beads: [],
  isDetecting: false,
  lastResult: null,
  params: loadSettings() ?? DEFAULT_PARAMS,
  hoveredBeadId: null,
  addMode: false,
  history: loadHistory(),

  setImage: (canvas) =>
    set({
      imageCanvas: canvas,
      imageWidth: canvas.width,
      imageHeight: canvas.height,
      hasImage: true,
      beads: [],
      lastResult: null,
      hoveredBeadId: null,
      addMode: false,
    }),

  setBeads: (beads) => set({ beads }),

  setDetecting: (v) => set({ isDetecting: v }),

  setResult: (result) =>
    set({ lastResult: result, beads: result.beads, isDetecting: false }),

  setParams: (p) => {
    const next = { ...get().params, ...p };
    saveSettings(next);
    set({ params: next });
  },

  setHovered: (id) => set({ hoveredBeadId: id }),

  toggleAddMode: () => set((s) => ({ addMode: !s.addMode })),

  addBead: (x, y) => {
    const { beads, params } = get();
    // 估算半径：取现有珠子半径中位数，否则用参数中值
    const radii = beads.map((b) => b.radius);
    const radius =
      radii.length > 0
        ? radii.sort((a, b) => a - b)[Math.floor(radii.length / 2)]
        : (params.minRadius + params.maxRadius) / 2;
    const newBead: Bead = {
      id: `manual-${Date.now()}-${beads.length}`,
      x,
      y,
      radius,
      order: 0,
      confidence: 0.6,
    };
    set({ beads: reindex([...beads, newBead]) });
  },

  removeBead: (id) => {
    const { beads } = get();
    set({ beads: reindex(beads.filter((b) => b.id !== id)), hoveredBeadId: null });
  },

  reset: () =>
    set({
      imageCanvas: null,
      imageWidth: 0,
      imageHeight: 0,
      hasImage: false,
      beads: [],
      lastResult: null,
      hoveredBeadId: null,
      addMode: false,
      isDetecting: false,
    }),

  loadHistoryList: () => set({ history: loadHistory() }),

  saveCurrentToHistory: () => {
    const { imageCanvas, beads, params, lastResult } = get();
    if (!imageCanvas || beads.length === 0) return;
    const record: HistoryRecord = {
      id: `hist-${Date.now()}`,
      thumbnail: makeThumbnail(imageCanvas),
      totalCount: beads.length,
      timestamp: Date.now(),
      params: lastResult?.params ?? params,
    };
    const list = addHistoryStorage(record);
    set({ history: list });
  },
}));
