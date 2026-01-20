import type { Board, Hand, Tile } from "../types";
import { TileChip } from "./TileChip";
import { AddCardPicker } from "./AddCardPicker";
import { cn } from "../lib/utils";

type GameStateViewProps = {
  hand: Hand | null;
  board: Board | null;
  className?: string;
  editable?: boolean;
  onHandChange?: (hand: Hand) => void;
  onBoardChange?: (board: Board) => void;
};

export function GameStateView({
  hand,
  board,
  className,
  editable = false,
  onHandChange,
  onBoardChange,
}: GameStateViewProps) {
  if (!hand && !board) return null;

  const handleDeleteFromHand = (index: number) => {
    if (hand && onHandChange) {
      const newHand = hand.filter((_, i) => i !== index);
      onHandChange(newHand);
    }
  };

  const handleAddToHand = (tile: Tile) => {
    if (onHandChange) {
      const newHand = [...(hand || []), tile];
      onHandChange(newHand);
    }
  };

  // Flatten board for display/editing, but keep Board type for API
  const flatBoard = board?.flat() ?? [];

  const handleDeleteFromBoard = (index: number) => {
    if (onBoardChange) {
      const newFlat = flatBoard.filter((_, i) => i !== index);
      // Convert back to Board format (each card as its own "set")
      onBoardChange(newFlat.map(tile => [tile]));
    }
  };

  const handleAddToBoard = (tile: Tile) => {
    if (onBoardChange) {
      const newFlat = [...flatBoard, tile];
      onBoardChange(newFlat.map(t => [t]));
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {hand && hand.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-emerald-300 uppercase tracking-wide">Your Hand</span>
            <span className="text-xs text-emerald-400/60">({hand.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            {hand.map((tile, i) => (
              <TileChip
                key={i}
                tile={tile}
                size="md"
                onDelete={editable ? () => handleDeleteFromHand(i) : undefined}
              />
            ))}
            {editable && <AddCardPicker onAdd={handleAddToHand} size="md" />}
          </div>
        </div>
      )}

      {/* Show add button even when hand is empty but editable */}
      {editable && (!hand || hand.length === 0) && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-emerald-300 uppercase tracking-wide">Your Hand</span>
            <span className="text-xs text-emerald-400/60">(0)</span>
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            <AddCardPicker onAdd={handleAddToHand} size="md" />
          </div>
        </div>
      )}

      {flatBoard.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-emerald-300 uppercase tracking-wide">Board</span>
            <span className="text-xs text-emerald-400/60">({flatBoard.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            {flatBoard.map((tile, i) => (
              <TileChip
                key={i}
                tile={tile}
                size="md"
                onDelete={editable ? () => handleDeleteFromBoard(i) : undefined}
              />
            ))}
            {editable && <AddCardPicker onAdd={handleAddToBoard} size="md" />}
          </div>
        </div>
      )}

      {/* Show add button even when board is empty but editable */}
      {editable && flatBoard.length === 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-emerald-300 uppercase tracking-wide">Board</span>
            <span className="text-xs text-emerald-400/60">(0)</span>
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            <AddCardPicker onAdd={handleAddToBoard} size="md" />
          </div>
        </div>
      )}
    </div>
  );
}
