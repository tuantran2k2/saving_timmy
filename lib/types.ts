export type TransactionType = "deposit" | "withdraw";

export type TransactionCategory =
  | "monthly"
  | "bonus"
  | "emergency"
  | "education"
  | "medical"
  | "food"
  | "transport"
  | "entertainment"
  | "other";

export type FundIcon =
  | "piggy" | "plane" | "home" | "car" | "heart" | "star" | "gift" | "book"
  | "coffee" | "music" | "camera" | "shopping" | "phone" | "laptop" | "baby"
  | "dumbbell" | "gamepad" | "food" | "graduation" | "briefcase" | "wallet"
  | "bitcoin" | "building" | "ship" | "bike" | "paw" | "sun" | "tree" | "flower";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  note: string;
  date: string;
  category: TransactionCategory;
}

export interface Fund {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: FundIcon;
  targetAmount: number;
  deadline: string;
  transactions: Transaction[];
}

export interface MonthSummary {
  month: string;
  label: string;
  totalDeposit: number;
  totalWithdraw: number;
  net: number;
  balance: number;
}
