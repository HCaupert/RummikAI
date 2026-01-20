import type { Tile, TileSet, Board, GameState } from "./types";
import { isValidSet } from "./validation";

// =============================================================================
// Public API
// =============================================================================

/**
 * Find all ways to partition tiles into valid sets.
 * Returns array of valid boards (each board = array of valid sets).
 */
export function findValidPartitions(tiles: Tile[], cache?: Map<string, Board[]>): Board[] {
  if (tiles.length === 0) return [[]];

  const sorted = canonicalSort(tiles);
  const key = cache ? tileSetKey(sorted) : "";

  if (cache?.has(key)) {
    return cache.get(key)!;
  }

  const results: Board[] = [];
  findPartitionsRecursive(sorted, [], results);

  if (cache) {
    cache.set(key, results);
  }

  return results;
}

/**
 * Count minimum moves to go from one board to another, given placed tiles.
 */
export function countMoves(from: Board, to: Board, placed: Tile[]): number {
  if (placed.length === 0 && boardsEqual(from, to)) return 0;

  const placeMoves = countPlaceMoves(to, placed);
  const rearrangeMoves = countRearrangeMoves(from, to);

  return placeMoves + rearrangeMoves;
}

/**
 * Solve: find all playable tile combinations and their minimum move counts.
 */
export function solve(state: GameState, maxTiles?: number): Map<Tile[], number> {
  const { board, hand } = state;
  const max = maxTiles ?? hand.length;
  const results = new Map<string, { tiles: Tile[]; moves: number }>();
  const boardTiles = board.flat();
  const partitionCache = new Map<string, Board[]>();

  for (let size = 1; size <= max; size++) {
    for (const handSubset of combinations(hand, size)) {
      const allTiles = [...boardTiles, ...handSubset];
      const validBoards = findValidPartitions(allTiles, partitionCache);

      let minMoves = Infinity;
      for (const targetBoard of validBoards) {
        const moves = countMoves(board, targetBoard, handSubset);
        minMoves = Math.min(minMoves, moves);
      }

      if (minMoves < Infinity) {
        const key = tileSetKey(handSubset);
        const existing = results.get(key);
        if (!existing || existing.moves > minMoves) {
          results.set(key, { tiles: handSubset, moves: minMoves });
        }
      }
    }
  }

  const output = new Map<Tile[], number>();
  for (const { tiles, moves } of results.values()) {
    output.set(tiles, moves);
  }
  return output;
}

// =============================================================================
// Partition Finding
// =============================================================================

function findPartitionsRecursive(remaining: Tile[], currentSets: TileSet[], results: Board[]): void {
  if (remaining.length === 0) {
    results.push(currentSets.map((s) => [...s]));
    return;
  }

  const first = remaining[0]!;
  const possibleSets = findPossibleSets(first, remaining);

  for (const set of possibleSets) {
    const newRemaining = removeFromArray(remaining, set);
    findPartitionsRecursive(newRemaining, [...currentSets, set], results);
  }
}

function findPossibleSets(mustInclude: Tile, available: Tile[]): TileSet[] {
  const results: TileSet[] = [];

  if (mustInclude.kind === "regular") {
    findPossibleRuns(mustInclude, available, results);
    findPossibleGroups(mustInclude, available, results);
  } else {
    findPossibleSetsWithJoker(mustInclude, available, results);
  }

  return results;
}

function findPossibleRuns(start: Tile & { kind: "regular" }, available: Tile[], results: TileSet[]): void {
  const { shape, number } = start;
  const sameSuite = available.filter(
    (t) => (t.kind === "regular" && t.shape === shape) || t.kind === "joker"
  );

  for (let runStart = Math.max(1, number - 12); runStart <= number; runStart++) {
    for (let runEnd = number; runEnd <= 13; runEnd++) {
      const runLength = runEnd - runStart + 1;
      if (runLength < 3) continue;

      const run = tryBuildRun(shape, runStart, runEnd, sameSuite, start);
      if (run && run.length === runLength) {
        results.push(run);
      }
    }
  }
}

function tryBuildRun(
  shape: string,
  startNum: number,
  endNum: number,
  available: Tile[],
  mustInclude: Tile
): TileSet | null {
  const run: Tile[] = [];
  const used = new Set<number>();
  let includedMustInclude = false;

  for (let n = startNum; n <= endNum; n++) {
    const idx = available.findIndex((t, i) => {
      if (used.has(i)) return false;
      return t.kind === "regular" && t.shape === shape && t.number === n;
    });

    if (idx !== -1) {
      const tile = available[idx]!;
      if (tile === mustInclude) includedMustInclude = true;
      run.push(tile);
      used.add(idx);
    } else {
      const jokerIdx = available.findIndex((t, i) => !used.has(i) && t.kind === "joker");
      if (jokerIdx !== -1) {
        const tile = available[jokerIdx]!;
        if (tile === mustInclude) includedMustInclude = true;
        run.push(tile);
        used.add(jokerIdx);
      } else {
        return null;
      }
    }
  }

  return includedMustInclude ? run : null;
}

function findPossibleGroups(start: Tile & { kind: "regular" }, available: Tile[], results: TileSet[]): void {
  const { number } = start;
  const sameNumber = available.filter(
    (t) => (t.kind === "regular" && t.number === number) || t.kind === "joker"
  );

  const regularTiles = sameNumber.filter((t) => t.kind === "regular") as Array<Tile & { kind: "regular" }>;
  const jokers = sameNumber.filter((t) => t.kind === "joker");
  const shapes = [...new Set(regularTiles.map((t) => t.shape))];

  for (let size = 3; size <= 4; size++) {
    const shapeCombos = combinations(shapes, Math.min(size, shapes.length));

    for (const shapeCombo of shapeCombos) {
      const jokersNeeded = size - shapeCombo.length;
      if (jokersNeeded > jokers.length) continue;

      const group: Tile[] = [];
      let includesStart = false;

      for (const shape of shapeCombo) {
        const tile = regularTiles.find((t) => t.shape === shape)!;
        if (tile === start) includesStart = true;
        group.push(tile);
      }

      for (let j = 0; j < jokersNeeded; j++) {
        const jk = jokers[j]!;
        if ((jk as Tile) === (start as Tile)) includesStart = true;
        group.push(jk);
      }

      if (includesStart && isValidSet(group)) {
        results.push(group);
      }
    }
  }
}

function findPossibleSetsWithJoker(joker: Tile, available: Tile[], results: TileSet[]): void {
  const regulars = available.filter((t) => t.kind === "regular") as Array<Tile & { kind: "regular" }>;

  // Try runs
  const shapes = [...new Set(regulars.map((t) => t.shape))];
  for (const shape of shapes) {
    const sameSuite = available.filter(
      (t) => (t.kind === "regular" && t.shape === shape) || t.kind === "joker"
    );

    for (let runStart = 1; runStart <= 11; runStart++) {
      for (let runEnd = runStart + 2; runEnd <= 13; runEnd++) {
        const run = tryBuildRun(shape, runStart, runEnd, sameSuite, joker);
        if (run && run.length === runEnd - runStart + 1) {
          results.push(run);
        }
      }
    }
  }

  // Try groups
  const numbers = [...new Set(regulars.map((t) => t.number))];
  for (const num of numbers) {
    const sameNum = available.filter(
      (t) => (t.kind === "regular" && t.number === num) || t.kind === "joker"
    );

    const regTiles = sameNum.filter((t) => t.kind === "regular") as Array<Tile & { kind: "regular" }>;
    const jokerTiles = sameNum.filter((t) => t.kind === "joker");

    for (let size = 3; size <= 4; size++) {
      const regCount = Math.min(size - 1, regTiles.length);
      if (regCount + jokerTiles.length < size) continue;

      const shapeCombos = combinations([...new Set(regTiles.map((t) => t.shape))], regCount);

      for (const shapeCombo of shapeCombos) {
        const group: Tile[] = shapeCombo.map((s) => regTiles.find((t) => t.shape === s)!);
        const jokersNeeded = size - group.length;

        if (jokersNeeded > jokerTiles.length) continue;

        let includesOurJoker = false;
        for (let j = 0; j < jokersNeeded; j++) {
          const jt = jokerTiles[j]!;
          if (jt === joker) includesOurJoker = true;
          group.push(jt);
        }

        if (includesOurJoker && isValidSet(group)) {
          results.push(group);
        }
      }
    }
  }
}

// =============================================================================
// Move Counting
// =============================================================================

function countPlaceMoves(to: Board, placed: Tile[]): number {
  if (placed.length === 0) return 0;

  const targetSetIndices = new Set<number>();
  for (const tile of placed) {
    const setIdx = to.findIndex((set) => set.some((t) => tilesEqual(t, tile)));
    if (setIdx !== -1) targetSetIndices.add(setIdx);
  }

  return targetSetIndices.size;
}

function countRearrangeMoves(from: Board, to: Board): number {
  const fromTiles = from.flat();

  // Map from-sets to to-sets
  const fromToMapping = new Map<number, Set<number>>();
  for (let i = 0; i < from.length; i++) fromToMapping.set(i, new Set());

  const toFromMapping = new Map<number, Set<number>>();
  for (let i = 0; i < to.length; i++) toFromMapping.set(i, new Set());

  for (const tile of fromTiles) {
    const fromIdx = from.findIndex((set) => set.some((t) => tilesEqual(t, tile)));
    const toIdx = to.findIndex((set) => set.some((t) => tilesEqual(t, tile)));

    if (fromIdx !== -1 && toIdx !== -1) {
      fromToMapping.get(fromIdx)!.add(toIdx);
      toFromMapping.get(toIdx)!.add(fromIdx);
    }
  }

  // Count splits (1 from-set → multiple to-sets)
  let splits = 0;
  for (const [, toSets] of fromToMapping) {
    if (toSets.size > 1) splits += toSets.size - 1;
  }

  // Count merges (multiple from-sets → 1 to-set)
  let merges = 0;
  for (const [, fromSets] of toFromMapping) {
    if (fromSets.size > 1) merges += fromSets.size - 1;
  }

  return Math.max(splits, merges);
}

// =============================================================================
// Utilities
// =============================================================================

function canonicalSort(tiles: Tile[]): Tile[] {
  return [...tiles].sort((a, b) => {
    if (a.kind === "joker" && b.kind === "joker") return 0;
    if (a.kind === "joker") return 1;
    if (b.kind === "joker") return -1;
    if (a.shape !== b.shape) return a.shape.localeCompare(b.shape);
    return a.number - b.number;
  });
}

function removeFromArray(tiles: Tile[], toRemove: Tile[]): Tile[] {
  const result = [...tiles];
  for (const t of toRemove) {
    const idx = result.findIndex((r) => r === t);
    if (idx !== -1) result.splice(idx, 1);
  }
  return result;
}

function combinations<T>(arr: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (arr.length === 0 || size > arr.length) return [];

  const [first, ...rest] = arr;
  const withFirst = combinations(rest, size - 1).map((c) => [first!, ...c]);
  const withoutFirst = combinations(rest, size);
  return [...withFirst, ...withoutFirst];
}

function tilesEqual(a: Tile, b: Tile): boolean {
  if (a.kind === "joker" && b.kind === "joker") return true;
  if (a.kind === "regular" && b.kind === "regular") {
    return a.shape === b.shape && a.number === b.number;
  }
  return false;
}

function boardsEqual(a: Board, b: Board): boolean {
  if (a.length !== b.length) return false;
  const aSorted = a.map((s) => canonicalSort(s));
  const bSorted = b.map((s) => canonicalSort(s));
  return JSON.stringify(aSorted.sort()) === JSON.stringify(bSorted.sort());
}

function tileSetKey(tiles: Tile[]): string {
  return canonicalSort(tiles)
    .map((t) => (t.kind === "joker" ? "J" : `${t.shape[0]}${t.number}`))
    .join(",");
}
