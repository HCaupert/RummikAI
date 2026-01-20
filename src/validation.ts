import type { Tile, TileSet, Board, RegularTile } from "./types";
import { SHAPES } from "./types";

const isJoker = (tile: Tile): tile is { kind: "joker" } => tile.kind === "joker";
const isRegular = (tile: Tile): tile is RegularTile => tile.kind === "regular";

/**
 * Check if a set is a valid group: 3-4 tiles, same number, all different shapes.
 * Jokers fill gaps.
 */
function isValidGroup(tiles: TileSet): boolean {
  if (tiles.length < 3 || tiles.length > 4) return false;

  const regulars = tiles.filter(isRegular);
  if (regulars.length === 0) return false; // need at least 1 to define the number

  // All regular tiles must have the same number
  const targetNumber = regulars[0]!.number;
  if (!regulars.every((t) => t.number === targetNumber)) return false;

  // All shapes must be unique among regular tiles
  const shapes = regulars.map((t) => t.shape);
  if (new Set(shapes).size !== shapes.length) return false;

  // Jokers count must not exceed available shapes
  const jokerCount = tiles.filter(isJoker).length;
  const availableSlots = SHAPES.length - shapes.length;
  if (jokerCount > availableSlots) return false;

  return true;
}

/**
 * Check if a set is a valid run: 3+ tiles, consecutive numbers, same shape.
 * Jokers fill gaps or extend ends. No wrap-around.
 */
function isValidRun(tiles: TileSet): boolean {
  if (tiles.length < 3) return false;

  const regulars = tiles.filter(isRegular);
  if (regulars.length === 0) return false; // need at least 1 to define the shape

  // All regular tiles must have the same shape
  const targetShape = regulars[0]!.shape;
  if (!regulars.every((t) => t.shape === targetShape)) return false;

  // Check no duplicate numbers
  const numbers = regulars.map((t) => t.number).sort((a, b) => a - b);
  if (new Set(numbers).size !== numbers.length) return false;

  const minNum = numbers[0]!;
  const maxNum = numbers[numbers.length - 1]!;
  const gapsInside = maxNum - minNum + 1 - regulars.length;
  const jokerCount = tiles.filter(isJoker).length;
  const jokersForEnds = jokerCount - gapsInside;

  // Not enough jokers to fill internal gaps
  if (jokersForEnds < 0) return false;

  // Check bounds: jokers at ends extend the range
  const extendLow = Math.floor(jokersForEnds / 2); // could go either way, check if ANY valid assignment exists
  // Simplified: just check if a valid span of tiles.length exists within 1-13
  // that contains all regular numbers
  const spanLength = tiles.length;
  const minPossibleStart = Math.max(1, maxNum - spanLength + 1);
  const maxPossibleStart = Math.min(14 - spanLength, minNum);

  return minPossibleStart <= maxPossibleStart;
}

/**
 * A set is valid if it's either a valid group or a valid run.
 */
export function isValidSet(tiles: TileSet): boolean {
  return isValidGroup(tiles) || isValidRun(tiles);
}

/**
 * A board is valid if all sets are valid.
 */
export function isValidBoard(board: Board): boolean {
  return board.length === 0 || board.every(isValidSet);
}
