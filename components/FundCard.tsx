"use client";

import { Pencil, Trash2, TrendingUp, ArrowRight } from "lucide-react";
import { Fund } from "@/lib/types";
import { formatVND, getTotalBalance } from "@/lib/utils";
import FundIcon from "./FundIcon";

interface FundCardProps {
  fund: Fund;
  onEdit: (fund: Fund) => void;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
}

export default function FundCard({ fund, onEdit, onDelete, onClick }: FundCardProps) {
  const balance = getTotalBalance(fund.transactions);
  const progress = fund.targetAmount > 0
    ? Math.min((balance / fund.targetAmount) * 100, 100)
    : 0;

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
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden"
      onClick={() => onClick(fund.id)}
    >
      {/* Color bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: fund.color }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="rounded-xl p-2.5 flex-shrink-0"
              style={{ backgroundColor: fund.color + "22" }}
            >
              <FundIcon name={fund.icon} size={20} color={fund.color} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 leading-tight">{fund.title}</h3>
              {fund.description && (
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{fund.description}</p>
              )}
            </div>
          </div>

          <div
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onEdit(fund)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(fund.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Balance */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-1">Số dư hiện tại</p>
          <p className="text-2xl font-black" style={{ color: fund.color }}>
            {formatVND(balance)}
          </p>
        </div>

        {/* Progress */}
        {fund.targetAmount > 0 && (
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Mục tiêu: {formatVND(fund.targetAmount)}</span>
              <span className="font-semibold" style={{ color: fund.color }}>
                {progress.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, backgroundColor: fund.color }}
              />
            </div>
          </div>
        )}

        {/* Per month hint */}
        {perMonth && (
          <div
            className="rounded-xl px-3 py-2 mb-3 text-xs flex items-center justify-between"
            style={{ backgroundColor: fund.color + "11" }}
          >
            <span className="text-gray-500">Cần tiết kiệm mỗi tháng</span>
            <span className="font-bold" style={{ color: fund.color }}>
              {formatVND(perMonth)}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <TrendingUp size={12} />
              {fund.transactions.length} giao dịch
            </span>
            {daysLeft !== null && (
              <span>
                {daysLeft > 0 ? `Còn ${daysLeft} ngày` : "Đã quá hạn"}
              </span>
            )}
          </div>
          <span
            className="flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: fund.color }}
          >
            Xem chi tiết <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </div>
  );
}
