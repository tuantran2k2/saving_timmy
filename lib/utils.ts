import { Transaction, MonthSummary, TransactionCategory } from "./types";

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getMonthKey(date: string): string {
  return date.slice(0, 7);
}

export function getMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  return `Th${month}/${year}`;
}

export function buildMonthlySummaries(
  transactions: Transaction[]
): MonthSummary[] {
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const monthMap = new Map<
    string,
    { deposit: number; withdraw: number }
  >();

  for (const t of sorted) {
    const key = getMonthKey(t.date);
    if (!monthMap.has(key)) monthMap.set(key, { deposit: 0, withdraw: 0 });
    const entry = monthMap.get(key)!;
    if (t.type === "deposit") entry.deposit += t.amount;
    else entry.withdraw += t.amount;
  }

  let runningBalance = 0;
  const summaries: MonthSummary[] = [];

  for (const [month, { deposit, withdraw }] of monthMap) {
    runningBalance += deposit - withdraw;
    summaries.push({
      month,
      label: getMonthLabel(month),
      totalDeposit: deposit,
      totalWithdraw: withdraw,
      net: deposit - withdraw,
      balance: runningBalance,
    });
  }

  return summaries;
}

export function getTotalBalance(transactions: Transaction[]): number {
  return transactions.reduce((acc, t) => {
    return t.type === "deposit" ? acc + t.amount : acc - t.amount;
  }, 0);
}

export function getCurrentMonthSummary(transactions: Transaction[]) {
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const thisMonth = transactions.filter(
    (t) => getMonthKey(t.date) === currentKey
  );

  const deposit = thisMonth
    .filter((t) => t.type === "deposit")
    .reduce((s, t) => s + t.amount, 0);

  const withdraw = thisMonth
    .filter((t) => t.type === "withdraw")
    .reduce((s, t) => s + t.amount, 0);

  return { deposit, withdraw, net: deposit - withdraw };
}

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  monthly: "Tiết kiệm tháng",
  bonus: "Thưởng / Thêm",
  emergency: "Khẩn cấp",
  education: "Học phí",
  medical: "Y tế",
  food: "Ăn uống",
  transport: "Đi lại",
  entertainment: "Giải trí",
  other: "Khác",
};

export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  monthly: "#10b981",
  bonus: "#3b82f6",
  emergency: "#ef4444",
  education: "#f59e0b",
  medical: "#ec4899",
  food: "#8b5cf6",
  transport: "#06b6d4",
  entertainment: "#f97316",
  other: "#6b7280",
};
