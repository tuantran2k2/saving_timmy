"use client";

import { useState } from "react";
import { Trash2, TrendingUp, TrendingDown, Search } from "lucide-react";
import { Transaction } from "@/lib/types";
import { formatVND, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/utils";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export default function TransactionList({
  transactions,
  onDelete,
}: TransactionListProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "deposit" | "withdraw">(
    "all"
  );

  const filtered = transactions
    .filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false;
      if (
        search &&
        !t.note.toLowerCase().includes(search.toLowerCase()) &&
        !CATEGORY_LABELS[t.category]
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="p-5 border-b border-gray-50 space-y-3">
        <h2 className="font-bold text-gray-800">Lịch sử giao dịch</h2>

        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm ghi chú, danh mục..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-100 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50"
          />
        </div>

        <div className="flex gap-2">
          {(["all", "deposit", "withdraw"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === f
                  ? f === "all"
                    ? "bg-gray-800 text-white"
                    : f === "deposit"
                    ? "bg-emerald-500 text-white"
                    : "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {f === "all" ? "Tất cả" : f === "deposit" ? "Nạp tiền" : "Rút tiền"}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            Không có giao dịch nào
          </div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/70 transition-colors group"
            >
              <div
                className="rounded-xl p-2.5 flex-shrink-0"
                style={{
                  backgroundColor: CATEGORY_COLORS[t.category] + "22",
                }}
              >
                {t.type === "deposit" ? (
                  <TrendingUp
                    size={18}
                    style={{ color: CATEGORY_COLORS[t.category] }}
                  />
                ) : (
                  <TrendingDown
                    size={18}
                    style={{ color: CATEGORY_COLORS[t.category] }}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-700 truncate">
                  {t.note || "Không có ghi chú"}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: CATEGORY_COLORS[t.category] + "22",
                      color: CATEGORY_COLORS[t.category],
                    }}
                  >
                    {CATEGORY_LABELS[t.category]}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(t.date).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className={`text-sm font-bold ${
                    t.type === "deposit" ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {t.type === "deposit" ? "+" : "-"}
                  {formatVND(t.amount)}
                </span>
                <button
                  onClick={() => onDelete(t.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
