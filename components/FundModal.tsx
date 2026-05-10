"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Fund, FundIcon as FundIconType } from "@/lib/types";
import FundIcon from "./FundIcon";

interface FundModalProps {
  onClose: () => void;
  onSave: (data: Omit<Fund, "id" | "transactions">) => void;
  initialData?: Fund;
}

const PRESET_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#06b6d4", "#f97316",
  "#84cc16", "#14b8a6", "#a855f7", "#f43f5e",
];

const ICONS: { key: FundIconType; label: string }[] = [
  { key: "piggy", label: "Heo đất" },
  { key: "wallet", label: "Ví tiền" },
  { key: "bitcoin", label: "Crypto" },
  { key: "briefcase", label: "Công việc" },
  { key: "plane", label: "Du lịch" },
  { key: "ship", label: "Du thuyền" },
  { key: "bike", label: "Xe đạp" },
  { key: "car", label: "Xe hơi" },
  { key: "home", label: "Nhà cửa" },
  { key: "building", label: "Bất động sản" },
  { key: "graduation", label: "Học tập" },
  { key: "book", label: "Sách" },
  { key: "laptop", label: "Công nghệ" },
  { key: "phone", label: "Điện thoại" },
  { key: "camera", label: "Máy ảnh" },
  { key: "gamepad", label: "Game" },
  { key: "music", label: "Âm nhạc" },
  { key: "dumbbell", label: "Gym" },
  { key: "food", label: "Ẩm thực" },
  { key: "coffee", label: "Cafe" },
  { key: "shopping", label: "Mua sắm" },
  { key: "heart", label: "Sức khoẻ" },
  { key: "baby", label: "Em bé" },
  { key: "paw", label: "Thú cưng" },
  { key: "gift", label: "Quà tặng" },
  { key: "star", label: "Mơ ước" },
  { key: "sun", label: "Nghỉ dưỡng" },
  { key: "tree", label: "Thiên nhiên" },
  { key: "flower", label: "Hoa" },
];

export default function FundModal({ onClose, onSave, initialData }: FundModalProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [color, setColor] = useState(initialData?.color ?? "#10b981");
  const [icon, setIcon] = useState<FundIconType>(initialData?.icon ?? "piggy");
  const [targetAmount, setTargetAmount] = useState(
    initialData?.targetAmount ? initialData.targetAmount.toLocaleString("vi-VN") : ""
  );
  const [deadline, setDeadline] = useState(initialData?.deadline ?? "");

  const isEditing = !!initialData;

  function formatAmountInput(val: string) {
    const digits = val.replace(/\D/g, "");
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;
    const parsed = parseInt(targetAmount.replace(/\D/g, ""), 10) || 0;
    onSave({ title, description, color, icon, targetAmount: parsed, deadline });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {isEditing ? "Chỉnh sửa quỹ" : "Tạo quỹ mới"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Preview */}
          <div className="flex items-center justify-center">
            <div className="rounded-2xl p-5" style={{ backgroundColor: color + "22" }}>
              <FundIcon name={icon} size={40} color={color} />
            </div>
          </div>

          {/* Icon picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biểu tượng <span className="text-gray-400 font-normal">({ICONS.length} loại)</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5 max-h-52 overflow-y-auto pr-1">
              {ICONS.map((i) => (
                <button
                  key={i.key}
                  type="button"
                  onClick={() => setIcon(i.key)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                    icon === i.key ? "border-current" : "border-gray-100 hover:border-gray-200"
                  }`}
                  style={icon === i.key ? { borderColor: color, backgroundColor: color + "11" } : {}}
                  title={i.label}
                >
                  <FundIcon name={i.key} size={18} color={icon === i.key ? color : "#9ca3af"} />
                  <span className="text-[10px] text-gray-400 leading-tight text-center">{i.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Màu sắc</label>
            {/* Preset colors */}
            <div className="flex gap-2 flex-wrap mb-3">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110 flex-shrink-0"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? `3px solid ${c}` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
            {/* RGB custom picker */}
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5"
                  title="Chọn màu tuỳ chỉnh"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={color}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setColor(v);
                  }}
                  placeholder="#10b981"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div
                className="w-10 h-10 rounded-xl border border-gray-200 flex-shrink-0"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên quỹ</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Quỹ du lịch, Mua nhà..."
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả (tuỳ chọn)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về quỹ..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:border-transparent"
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Mục tiêu (₫) <span className="text-gray-400 font-normal">— tuỳ chọn</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={targetAmount}
                onChange={(e) => setTargetAmount(formatAmountInput(e.target.value))}
                placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-right text-lg font-bold text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₫</span>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Hạn chót <span className="text-gray-400 font-normal">— tuỳ chọn</span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:border-transparent"
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
              className="flex-1 rounded-xl py-3 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: color }}
            >
              {isEditing ? "Cập nhật" : "Tạo quỹ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
