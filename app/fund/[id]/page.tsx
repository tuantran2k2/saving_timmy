"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Plus, RefreshCw, TrendingUp, TrendingDown, Wallet, PiggyBank,
} from "lucide-react";
import { Fund, Transaction } from "@/lib/types";
import {
  formatVND, getTotalBalance, getCurrentMonthSummary, buildMonthlySummaries,
} from "@/lib/utils";
import TransactionModal from "@/components/TransactionModal";
import TransactionList from "@/components/TransactionList";
import SavingsChart from "@/components/SavingsChart";
import StatsCard from "@/components/StatsCard";
import FundIcon from "@/components/FundIcon";

export default function FundPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [fund, setFund] = useState<Fund | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTxModal, setShowTxModal] = useState(false);

  const fetchFund = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/funds");
    const funds: Fund[] = await res.json();
    const found = funds.find((f) => f.id === id) ?? null;
    setFund(found);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchFund();
  }, [fetchFund]);

  async function handleAddTransaction(tx: Omit<Transaction, "id">) {
    await fetch(`/api/funds/${id}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tx),
    });
    setShowTxModal(false);
    await fetchFund();
  }

  async function handleDeleteTransaction(txId: string) {
    await fetch(`/api/funds/${id}/transactions?txId=${txId}`, { method: "DELETE" });
    await fetchFund();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30 flex items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-gray-300" />
      </div>
    );
  }

  if (!fund) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Không tìm thấy quỹ này</p>
          <button
            onClick={() => router.push("/")}
            className="mt-3 text-emerald-600 font-semibold text-sm"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  const balance = getTotalBalance(fund.transactions);
  const currentMonth = getCurrentMonthSummary(fund.transactions);
  const monthlySummaries = buildMonthlySummaries(fund.transactions);
  const progress = fund.targetAmount > 0
    ? Math.min((balance / fund.targetAmount) * 100, 100)
    : null;
  const deadline = fund.deadline ? new Date(fund.deadline) : null;
  const daysLeft = deadline
    ? Math.ceil((deadline.getTime() - Date.now()) / 86400000)
    : null;
  const monthsLeft = deadline
    ? Math.max(
        (deadline.getFullYear() - new Date().getFullYear()) * 12 +
        deadline.getMonth() - new Date().getMonth(),
        1
      )
    : null;
  const remaining = fund.targetAmount > 0 ? Math.max(fund.targetAmount - balance, 0) : 0;
  const perMonth = monthsLeft && remaining > 0 ? Math.ceil(remaining / monthsLeft) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div
              className="rounded-xl p-2"
              style={{ backgroundColor: fund.color + "22" }}
            >
              <FundIcon name={fund.icon} size={20} color={fund.color} />
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900 leading-none">{fund.title}</h1>
              {fund.description && (
                <p className="text-xs text-gray-400">{fund.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchFund}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setShowTxModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-colors shadow-sm"
              style={{ backgroundColor: fund.color }}
            >
              <Plus size={16} />
              <span>Ghi chép</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hero balance */}
        <div
          className="rounded-2xl text-white p-6 shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${fund.color}, ${fund.color}cc)`,
            boxShadow: `0 8px 32px ${fund.color}40`,
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Số dư quỹ</p>
              <p className="text-4xl font-black tracking-tight">{formatVND(balance)}</p>
              <p className="text-white/70 text-xs mt-2">
                Tháng này: nạp{" "}
                <span className="text-white font-semibold">{formatVND(currentMonth.deposit)}</span>
                {" "}· rút{" "}
                <span className="text-white font-semibold">{formatVND(currentMonth.withdraw)}</span>
              </p>
            </div>
            <div className="bg-white/20 rounded-2xl p-3">
              <FundIcon name={fund.icon} size={28} color="white" />
            </div>
          </div>

          {/* Progress bar */}
          {progress !== null && (
            <div className="mt-5">
              <div className="flex justify-between text-xs text-white/70 mb-1.5">
                <span>Mục tiêu: {formatVND(fund.targetAmount)}</span>
                <span className="text-white font-bold">{progress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5">
                <div
                  className="h-full rounded-full bg-white transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {daysLeft !== null && (
                <p className="text-white/60 text-xs mt-1.5">
                  {daysLeft > 0 ? `Còn ${daysLeft} ngày` : "Đã quá hạn"}
                  {balance < fund.targetAmount && (
                    <> · cần thêm <span className="text-white font-semibold">{formatVND(fund.targetAmount - balance)}</span></>
                  )}
                </p>
              )}
              {perMonth && (
                <div className="mt-2 bg-white/15 rounded-xl px-3 py-2 flex items-center justify-between">
                  <span className="text-white/70 text-xs">Cần tiết kiệm mỗi tháng</span>
                  <span className="text-white font-bold text-sm">{formatVND(perMonth)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatsCard
            title="Nạp tháng này"
            value={formatVND(currentMonth.deposit)}
            icon={<TrendingUp size={18} />}
            color="green"
          />
          <StatsCard
            title="Rút tháng này"
            value={formatVND(currentMonth.withdraw)}
            icon={<TrendingDown size={18} />}
            color="red"
          />
          <StatsCard
            title="Chênh lệch"
            value={formatVND(Math.abs(currentMonth.net))}
            subtitle={currentMonth.net >= 0 ? "Dương (tốt)" : "Âm (cẩn thận)"}
            icon={<Wallet size={18} />}
            color={currentMonth.net >= 0 ? "blue" : "red"}
          />
          <StatsCard
            title="Giao dịch"
            value={`${fund.transactions.length}`}
            subtitle="Tổng cộng"
            icon={<PiggyBank size={18} />}
            color="purple"
          />
        </div>

        {/* Chart */}
        {monthlySummaries.length > 0 && (
          <SavingsChart data={monthlySummaries} />
        )}

        {/* Transaction list */}
        <TransactionList
          transactions={fund.transactions}
          onDelete={handleDeleteTransaction}
        />

        {/* Monthly table */}
        {monthlySummaries.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-50">
              <h2 className="font-bold text-gray-800">Tóm tắt theo tháng</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tháng</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-emerald-600 uppercase tracking-wide">Nạp vào</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-red-500 uppercase tracking-wide">Rút ra</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Số dư</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[...monthlySummaries].reverse().map((m) => (
                    <tr key={m.month} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-gray-700">{m.label}</td>
                      <td className="px-5 py-3.5 text-right text-emerald-600 font-medium">+{formatVND(m.totalDeposit)}</td>
                      <td className="px-5 py-3.5 text-right text-red-500 font-medium">-{formatVND(m.totalWithdraw)}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-gray-800">{formatVND(m.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {showTxModal && (
        <TransactionModal
          onClose={() => setShowTxModal(false)}
          onSave={handleAddTransaction}
        />
      )}
    </div>
  );
}
