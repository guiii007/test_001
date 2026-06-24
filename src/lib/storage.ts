import type { HistoryRecord, DetectParams } from "@/types";

const HISTORY_KEY = "bead-counter:history";
const SETTINGS_KEY = "bead-counter:settings";
const MAX_HISTORY = 20;

export function loadHistory(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as HistoryRecord[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveHistory(records: HistoryRecord[]): void {
  try {
    const trimmed = records.slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn("保存历史记录失败", e);
  }
}

export function addHistory(record: HistoryRecord): HistoryRecord[] {
  const list = [record, ...loadHistory()].slice(0, MAX_HISTORY);
  saveHistory(list);
  return list;
}

export function removeHistory(id: string): HistoryRecord[] {
  const list = loadHistory().filter((r) => r.id !== id);
  saveHistory(list);
  return list;
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function loadSettings(): DetectParams | null {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DetectParams;
  } catch {
    return null;
  }
}

export function saveSettings(params: DetectParams): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(params));
  } catch (e) {
    console.warn("保存设置失败", e);
  }
}
