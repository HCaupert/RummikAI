import type { Board, Hand } from "../types";
import { TileChip } from "./TileChip";
import { cn } from "../lib/utils";

type GameStateViewProps = {
  hand: Hand | null;
  board: Board | null;
  className?: string;
};

export function GameStateView({ hand, board, className }: GameStateViewProps) {
  if (!hand && !board) return null;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {hand && hand.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-emerald-300 uppercase tracking-wide">Your Hand</span>
            <span className="text-xs text-emerald-400/60">({hand.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {hand.map((tile, i) => (
              <TileChip key={i} tile={tile} size="md" />
            ))}
          </div>
        </div>
      )}

      {board && board.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-emerald-300 uppercase tracking-wide">Board</span>
            <span className="text-xs text-emerald-400/60">({board.flat().length} cards in {board.length} sets)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {board.map((set, i) => (
              <div
                key={i}
                className="flex gap-0.5 bg-white/10 rounded-lg p-1.5"
              >
                {set.map((tile, j) => (
                  <TileChip key={j} tile={tile} size="sm" />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
