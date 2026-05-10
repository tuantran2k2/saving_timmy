"use client";

import { useState } from "react";
import { PiggyBank, Lock, Eye, EyeOff } from "lucide-react";

interface LockScreenProps {
  onUnlock: (password: string) => void;
  error: boolean;
}

export default function LockScreen({ onUnlock, error }: LockScreenProps) {
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onUnlock(password);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-emerald-500 rounded-2xl p-4 mb-4 shadow-lg shadow-emerald-200">
            <PiggyBank size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Heo Đất</h1>
          <p className="text-gray-400 text-sm mt-1">Nhập mật khẩu để tiếp tục</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                autoFocus
                className={`w-full pl-10 pr-12 py-3.5 rounded-xl border text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 transition-all ${
                  error
                    ? "border-red-300 bg-red-50 focus:ring-red-300"
                    : "border-gray-200 focus:ring-emerald-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-xs mt-1.5 pl-1">
                Mật khẩu không đúng, thử lại!
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl py-3.5 text-sm transition-colors shadow-sm shadow-emerald-200"
          >
            Mở khoá
          </button>
        </form>
      </div>
    </div>
  );
}
