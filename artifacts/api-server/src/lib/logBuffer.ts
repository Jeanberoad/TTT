export interface LogEntry {
  time: string;
  level: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
  msg: string;
  data?: string;
}

const MAX_ENTRIES = 200;
const BUFFER: LogEntry[] = [];

const LEVEL_NAME: Record<number, LogEntry["level"]> = {
  10: "trace",
  20: "debug",
  30: "info",
  40: "warn",
  50: "error",
  60: "fatal",
};

export function appendRawLine(line: string): void {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line) as Record<string, unknown>;
    const levelNum = typeof obj.level === "number" ? obj.level : 30;
    const entry: LogEntry = {
      time: typeof obj.time === "number"
        ? new Date(obj.time).toISOString()
        : new Date().toISOString(),
      level: LEVEL_NAME[levelNum] ?? "info",
      msg: typeof obj.msg === "string" ? obj.msg : line,
      data: (() => {
        const { time: _t, level: _l, msg: _m, pid: _p, hostname: _h, ...rest } = obj;
        return Object.keys(rest).length ? JSON.stringify(rest) : undefined;
      })(),
    };
    BUFFER.push(entry);
    if (BUFFER.length > MAX_ENTRIES) BUFFER.shift();
  } catch {
    // not JSON — ignore (e.g. pino-pretty output in dev)
  }
}

export function getRecentLogs(n = 100): LogEntry[] {
  return BUFFER.slice(-n).reverse();
}

export function clearLogs(): void {
  BUFFER.length = 0;
}
