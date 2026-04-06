export type PaymentStatus = "success" | "failed" | "timeout" | "pending" | "rejected";

export interface PaymentAttempt {
  time: string;
  phone: string;
  plan: string;
  amount: number;
  status: PaymentStatus;
  transactionId?: string;
  message?: string;
}

const MAX_ENTRIES = 10;
const ATTEMPTS: PaymentAttempt[] = [];

export function logPaymentAttempt(entry: PaymentAttempt): void {
  ATTEMPTS.unshift({ ...entry, time: entry.time ?? new Date().toISOString() });
  if (ATTEMPTS.length > MAX_ENTRIES) ATTEMPTS.pop();
}

export function getPaymentAttempts(): PaymentAttempt[] {
  return [...ATTEMPTS];
}

export function getPaymentCount(): number {
  return ATTEMPTS.length;
}
