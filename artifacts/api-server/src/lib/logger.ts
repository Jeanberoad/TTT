import pino from "pino";
import { Writable } from "stream";
import { appendRawLine } from "./logBuffer";

const isProduction = process.env.NODE_ENV === "production";
const level = process.env.LOG_LEVEL ?? "info";

const redact = [
  "req.headers.authorization",
  "req.headers.cookie",
  "res.headers['set-cookie']",
];

function buildLogger(): pino.Logger {
  if (isProduction) {
    // Write JSON to stdout AND capture lines into the in-memory ring buffer
    const captureStream = new Writable({
      write(chunk: Buffer, _enc: string, cb: () => void) {
        const text = chunk.toString();
        process.stdout.write(text);
        appendRawLine(text.trim());
        cb();
      },
    });
    return pino({ level, redact }, captureStream);
  }

  // Development: pretty-print only (no capture — that's fine for local dev)
  return pino({
    level,
    redact,
    transport: {
      target: "pino-pretty",
      options: { colorize: true },
    },
  });
}

export const logger = buildLogger();
