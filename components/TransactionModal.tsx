"use client";

import { useState } from "react";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { TransactionCategory, TransactionType } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/utils";

interface TransactionModalProps {
  onClose: () => void;
  onSave: (data: {
    type: TransactionType;
    amount: number;
    note: string;
    date: string;
    category: TransactionCategory;
  }) => void;
}

const depositCategories: TransactionCategory[] = ["monthly", "bonus", "other"];
const withdrawCategories: TransactionCategory[] = [
  "emergency",
  "education",
  "medical",
  "food",
  "transport",
  "entertainment",
  "other",
];

export default function TransactionModal({
  onClose,
  onSave,
}: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>("deposit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<TransactionCategory>("monthly");

  const categories = type === "deposit" ? depositCategories : withdrawCategories;

  function handleTypeChange(t: TransactionType) {
    setType(t);
    setCategory(t === "deposit" ? "monthly" : "emergency");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseInt(amount.replace(/\D/g, ""), 10);
    if (!parsed || parsed <= 0) return;
    onSave({ type, amount: parsed, note, date, category });
  }

  function formatAmountInput(val: string) {
    const digits = val.replace(/\D/g, "");
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Thêm giao dịch</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2 bg-gray-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => handleTypeChange("deposit")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                type === "deposit"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <TrendingUp size={16} />
              Nạp tiền
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("withdraw")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                type === "withdraw"
                  ? "bg-white text-red-500 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <TrendingDown size={16} />
              Rút tiền
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Số tiền (₫)
            </label>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={(e) =>
                  setAmount(formatAmountInput(e.target.value))
                }
                placeholder="0"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right text-lg font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                ₫
              </span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Danh mục
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as TransactionCategory)
              }
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ghi chú
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Mua thuốc cho mẹ, tiết kiệm tháng 5..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ngày
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white transition-colors ${
                type === "deposit"
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              Lưu giao dịch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
