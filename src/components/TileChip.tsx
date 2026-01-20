import { useState, useEffect, useRef } from "react";
import type { Tile } from "../types";
import { cn } from "../lib/utils";

const suitSymbols: Record<string, string> = {
  spade: "♠",
  heart: "♥",
  diamond: "♦",
  club: "♣",
};

const suitColors: Record<string, string> = {
  spade: "text-slate-800",
  club: "text-slate-800",
  heart: "text-red-500",
  diamond: "text-red-500",
};

function formatCardValue(num: number): string {
  switch (num) {
    case 1: return "A";
    case 11: return "J";
    case 12: return "Q";
    case 13: return "K";
    default: return String(num);
  }
}

type TileChipProps = {
  tile: Tile;
  size?: "sm" | "md";
  className?: string;
  onDelete?: () => void;
};

export function TileChip({ tile, size = "md", className, onDelete }: TileChipProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isJoker = tile.kind === "joker";

  // Click outside to cancel delete confirmation
  useEffect(() => {
    if (!confirmDelete) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setConfirmDelete(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [confirmDelete]);

  const handleClick = () => {
    if (!onDelete) return;

    if (confirmDelete) {
      onDelete();
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
    }
  };

  const sizeClasses = {
    sm: "w-7 h-9 text-xs",
    md: "w-9 h-11 text-sm",
  };

  const iconSizes = {
    sm: "text-[10px]",
    md: "text-xs",
  };

  const deleteOverlay = onDelete && confirmDelete && (
    <div
      className="absolute inset-0 bg-red-500/60 rounded-lg flex items-center justify-center z-10"
    >
      <span className="text-white text-xs font-bold">✕</span>
    </div>
  );

  if (isJoker) {
    return (
      <div
        ref={ref}
        onClick={handleClick}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-bold shadow-md",
          onDelete && "cursor-pointer",
          sizeClasses[size],
          className
        )}
      >
        {deleteOverlay}
        <span className={size === "sm" ? "text-sm" : "text-base"}>🃏</span>
      </div>
    );
  }

  const { shape, number } = tile;

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-lg bg-white shadow-md font-bold overflow-visible",
        onDelete && "cursor-pointer",
        suitColors[shape],
        sizeClasses[size],
        className
      )}
    >
      {deleteOverlay}
      <span className="leading-none">{formatCardValue(number)}</span>
      <span className={cn("leading-none", iconSizes[size])}>{suitSymbols[shape]}</span>
    </div>
  );
}

type TileSetDisplayProps = {
  tiles: Tile[];
  size?: "sm" | "md";
  className?: string;
};

export function TileSetDisplay({ tiles, size = "md", className }: TileSetDisplayProps) {
  return (
    <div className={cn("flex gap-1", className)}>
      {tiles.map((tile, i) => (
        <TileChip key={i} tile={tile} size={size} />
      ))}
    </div>
  );
}
