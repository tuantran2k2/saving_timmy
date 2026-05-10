"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PiggyBank, Plus, RefreshCw, Wallet } from "lucide-react";
import { Fund } from "@/lib/types";
import { formatVND, getTotalBalance } from "@/lib/utils";
import FundCard from "@/components/FundCard";
import FundModal from "@/components/FundModal";

export default function Home() {
  const router = useRouter();
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFund, setEditingFund] = useState<Fund | null>(null);

  const fetchFunds = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/funds");
    const json = await res.json();
    setFunds(Array.isArray(json) ? json : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFunds();
  }, [fetchFunds]);

  async function handleCreate(data: Omit<Fund, "id" | "transactions">) {
    await fetch("/api/funds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowModal(false);
    await fetchFunds();
  }

  async function handleEdit(data: Omit<Fund, "id" | "transactions">) {
    if (!editingFund) return;
    await fetch("/api/funds", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editingFund, ...data }),
    });
    setEditingFund(null);
    await fetchFunds();
  }

  async function handleDelete(id: string) {
    if (!confirm("Xoá quỹ này? Tất cả giao dịch trong quỹ sẽ bị mất.")) return;
    await fetch(`/api/funds?id=${id}`, { method: "DELETE" });
    await fetchFunds();
  }

  const totalAllFunds = funds.reduce(
    (sum, f) => sum + getTotalBalance(f.transactions),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 rounded-xl p-2">
              <PiggyBank size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900 leading-none">Heo Đất</h1>
              <p className="text-xs text-gray-400">Quản lý tiết kiệm cá nhân</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchFunds}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-200"
            >
              <Plus size={16} />
              <span>Tạo quỹ</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Total hero */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 shadow-lg shadow-emerald-200/50">
          <p className="text-emerald-100 text-sm font-medium mb-1">Tổng tất cả quỹ</p>
          <p className="text-4xl font-black tracking-tight">
            {loading ? "..." : formatVND(totalAllFunds)}
          </p>
          <p className="text-emerald-200 text-xs mt-2">
            {funds.length} quỹ đang hoạt động
          </p>
        </div>

        {/* Summary row */}
        {funds.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {funds.map((f) => {
              const bal = getTotalBalance(f.transactions);
              return (
                <button
                  key={f.id}
                  onClick={() => router.push(`/fund/${f.id}`)}
                  className="bg-white rounded-2xl border border-gray-100 p-4 text-left shadow-sm hover:shadow-md transition-all group"
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                    style={{ backgroundColor: f.color + "22" }}
                  >
                    <Wallet size={16} style={{ color: f.color }} />
                  </div>
                  <p className="text-xs text-gray-400 truncate">{f.title}</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: f.color }}>
                    {formatVND(bal)}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* Fund grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-52 animate-pulse" />
            ))}
          </div>
        ) : funds.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <PiggyBank size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">Chưa có quỹ nào</p>
            <p className="text-gray-400 text-sm mt-1">Tạo quỹ đầu tiên để bắt đầu theo dõi tiết kiệm</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors"
            >
              + Tạo quỹ đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {funds.map((f) => (
              <FundCard
                key={f.id}
                fund={f}
                onEdit={(fund) => setEditingFund(fund)}
                onDelete={handleDelete}
                onClick={(id) => router.push(`/fund/${id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <FundModal onClose={() => setShowModal(false)} onSave={handleCreate} />
      )}

      {editingFund && (
        <FundModal
          onClose={() => setEditingFund(null)}
          onSave={handleEdit}
          initialData={editingFund}
        />
      )}
    </div>
  );
}
