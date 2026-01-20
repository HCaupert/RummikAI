import type { Tile } from "../types";
import { TileSetDisplay } from "./TileChip";
import { cn } from "../lib/utils";
import { ArrowRight } from "lucide-react";

type Solution = {
  tiles: Tile[];
  moves: number;
};

type SolutionsViewProps = {
  solutions: Solution[];
  isLoading?: boolean;
  className?: string;
};

export function SolutionsView({ solutions, isLoading, className }: SolutionsViewProps) {
  if (isLoading) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8 gap-3", className)}>
        <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-emerald-300">Analyzing possible plays...</span>
      </div>
    );
  }

  if (solutions.length === 0) {
    return (
      <div className={cn("text-center py-6", className)}>
        <p className="text-sm text-emerald-300/70">
          No valid plays found with your current hand.
        </p>
        <p className="text-xs text-emerald-400/50 mt-1">
          Try uploading different photos or check if the cards were detected correctly.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="text-xs text-emerald-400/60 mb-1">
        {solutions.length} possible {solutions.length === 1 ? "play" : "plays"} found
      </div>

      <div className="flex flex-col gap-2">
        {solutions.map((solution, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <TileSetDisplay tiles={solution.tiles} size="sm" className="flex-wrap" />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <ArrowRight className="w-4 h-4 text-emerald-400/50" />
              <div className="text-right">
                <div className="text-sm font-semibold text-white">
                  {solution.moves}
                </div>
                <div className="text-xs text-emerald-400/60">
                  {solution.moves === 1 ? "move" : "moves"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
