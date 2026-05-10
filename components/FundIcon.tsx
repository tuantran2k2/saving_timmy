"use client";

import {
  PiggyBank, Plane, Home, Car, Heart, Star, Gift, BookOpen,
  Coffee, Music, Camera, ShoppingBag, Phone, Laptop, Baby,
  Dumbbell, Gamepad2, UtensilsCrossed, GraduationCap, Briefcase, Wallet,
  Bitcoin, Building2, Ship, Bike, PawPrint, Sun, TreePine, Flower,
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
  coffee: Coffee,
  music: Music,
  camera: Camera,
  shopping: ShoppingBag,
  phone: Phone,
  laptop: Laptop,
  baby: Baby,
  dumbbell: Dumbbell,
  gamepad: Gamepad2,
  food: UtensilsCrossed,
  graduation: GraduationCap,
  briefcase: Briefcase,
  wallet: Wallet,
  bitcoin: Bitcoin,
  building: Building2,
  ship: Ship,
  bike: Bike,
  paw: PawPrint,
  sun: Sun,
  tree: TreePine,
  flower: Flower,
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
