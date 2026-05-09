"use client";

import {
  PiggyBank, Plane, Home, Car, Heart, Star, Gift, BookOpen,
} from "lucide-react";
import { FundIcon as FundIconType } from "@/lib/types";

const iconMap = {
  piggy: PiggyBank,
  plane: Plane,
  home: Home,
  car: Car,
  heart: Heart,
  star: Star,
  gift: Gift,
  book: BookOpen,
};

interface FundIconProps {
  name: FundIconType;
  size?: number;
  color?: string;
  className?: string;
}

export default function FundIcon({ name, size = 20, color, className }: FundIconProps) {
  const Icon = iconMap[name] ?? PiggyBank;
  return <Icon size={size} color={color} className={className} />;
}
