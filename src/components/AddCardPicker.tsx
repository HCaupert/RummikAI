import { useState, useEffect, useRef } from "react";
import type { Tile, Shape, TileNumber } from "../types";
import { SHAPES, NUMBERS } from "../types";
import { Plus } from "lucide-react";
import { cn } from "../lib/utils";

const suitSymbols: Record<Shape, string> = {
  spade: "♠",
  heart: "♥",
  diamond: "♦",
  club: "♣",
};

const suitColors: Record<Shape, string> = {
  spade: "text-slate-800",
  club: "text-slate-800",
  heart: "text-red-500",
  diamond: "text-red-500",
};

function formatCardValue(num: TileNumber): string {
  switch (num) {
    case 1: return "A";
    case 11: return "J";
    case 12: return "Q";
    case 13: return "K";
    default: return String(num);
  }
}

type AddCardPickerProps = {
  onAdd: (tile: Tile) => void;
  size?: "sm" | "md";
};

export function AddCardPicker({ onAdd, size = "md" }: AddCardPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSuit, setSelectedSuit] = useState<Shape | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSelectedSuit(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleAddCard = (number: TileNumber) => {
    if (selectedSuit) {
      onAdd({ kind: "regular", shape: selectedSuit, number });
      setSelectedSuit(null);
      setIsOpen(false);
    }
  };

  const handleAddJoker = () => {
    onAdd({ kind: "joker" });
    setIsOpen(false);
  };

  const sizeClasses = {
    sm: "w-7 h-9",
    md: "w-9 h-11",
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center justify-center rounded-lg border-2 border-dashed border-emerald-400/50 hover:border-emerald-400 hover:bg-emerald-400/10 text-emerald-400 transition-colors",
          sizeClasses[size]
        )}
      >
        <Plus className="w-4 h-4" />
      </button>
    );
  }

  // Suit selection
  if (!selectedSuit) {
    return (
      <div ref={ref} className="flex items-center gap-1 bg-slate-800 rounded-lg p-1.5 shadow-lg">
        {SHAPES.map((suit) => (
          <button
            key={suit}
            onClick={() => setSelectedSuit(suit)}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-md bg-white hover:bg-gray-100 text-lg transition-colors",
              suitColors[suit]
            )}
          >
            {suitSymbols[suit]}
          </button>
        ))}
        <button
          onClick={handleAddJoker}
          className="w-8 h-8 flex items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-sm transition-colors"
        >
          🃏
        </button>
      </div>
    );
  }

  // Number selection
  return (
    <div ref={ref} className="flex flex-col gap-1 bg-slate-800 rounded-lg p-1.5 shadow-lg">
      <div className="flex items-center justify-between px-1">
        <span className={cn("text-lg", suitColors[selectedSuit])}>
          {suitSymbols[selectedSuit]}
        </span>
        <button
          onClick={() => setSelectedSuit(null)}
          className="text-xs text-gray-400 hover:text-white"
        >
          ← Back
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {NUMBERS.map((num) => (
          <button
            key={num}
            onClick={() => handleAddCard(num)}
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded bg-white hover:bg-gray-100 text-xs font-bold transition-colors",
              suitColors[selectedSuit]
            )}
          >
            {formatCardValue(num)}
          </button>
        ))}
      </div>
    </div>
  );
}
