import { describe, test, expect } from "bun:test";
import { findValidPartitions, countMoves, solve } from "./solver";
import type { Tile, Board, GameState } from "./types";

// Helpers
const t = (shape: "spade" | "heart" | "diamond" | "club", number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13): Tile => ({
  kind: "regular",
  shape,
  number,
});
const joker: Tile = { kind: "joker" };

describe("findValidPartitions", () => {
  test("empty tiles → one empty partition", () => {
    const result = findValidPartitions([]);
    expect(result).toEqual([[]]);
  });

  test("exactly one valid run", () => {
    const tiles = [t("spade", 3), t("spade", 4), t("spade", 5)];
    const result = findValidPartitions(tiles);
    expect(result.length).toBe(1);
    expect(result[0]!.length).toBe(1); // one set
  });

  test("exactly one valid group", () => {
    const tiles = [t("spade", 7), t("heart", 7), t("diamond", 7)];
    const result = findValidPartitions(tiles);
    expect(result.length).toBe(1);
    expect(result[0]!.length).toBe(1);
  });

  test("tiles that cannot form any valid set → no partitions", () => {
    const tiles = [t("spade", 1), t("heart", 5)]; // only 2 tiles, can't form set
    const result = findValidPartitions(tiles);
    expect(result).toEqual([]);
  });

  test("two separate valid sets", () => {
    const tiles = [
      t("spade", 3), t("spade", 4), t("spade", 5),
      t("heart", 7), t("diamond", 7), t("club", 7),
    ];
    const result = findValidPartitions(tiles);
    expect(result.length).toBe(1);
    expect(result[0]!.length).toBe(2); // two sets
  });

  test("tiles with multiple valid partitions", () => {
    // 7♠ 7♥ 7♦ 7♣ can be: one group of 4, or two groups of 3 (but wait, can't - need different colors)
    // Let's use a run that can split: 1-6 spade can be [1,2,3] + [4,5,6] or [1,2,3,4,5,6]
    const tiles = [
      t("spade", 1), t("spade", 2), t("spade", 3),
      t("spade", 4), t("spade", 5), t("spade", 6),
    ];
    const result = findValidPartitions(tiles);
    // Should have at least 2: full run [1-6], or split [1-3] + [4-6]
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  test("with joker", () => {
    const tiles = [t("spade", 3), joker, t("spade", 5)];
    const result = findValidPartitions(tiles);
    expect(result.length).toBe(1);
    expect(result[0]!.length).toBe(1);
  });
});

describe("countMoves", () => {
  test("simple place: add one tile to existing run", () => {
    const from: Board = [[t("spade", 3), t("spade", 4), t("spade", 5)]];
    const to: Board = [[t("spade", 3), t("spade", 4), t("spade", 5), t("spade", 6)]];
    const placed = [t("spade", 6)];
    expect(countMoves(from, to, placed)).toBe(1);
  });

  test("place contiguous tiles: add two tiles to run = 1 move", () => {
    const from: Board = [[t("spade", 3), t("spade", 4), t("spade", 5)]];
    const to: Board = [[t("spade", 3), t("spade", 4), t("spade", 5), t("spade", 6), t("spade", 7)]];
    const placed = [t("spade", 6), t("spade", 7)];
    expect(countMoves(from, to, placed)).toBe(1);
  });

  test("place into new set = 1 move", () => {
    const from: Board = [[t("spade", 3), t("spade", 4), t("spade", 5)]];
    const to: Board = [
      [t("spade", 3), t("spade", 4), t("spade", 5)],
      [t("heart", 7), t("diamond", 7), t("club", 7)],
    ];
    const placed = [t("heart", 7), t("diamond", 7), t("club", 7)];
    expect(countMoves(from, to, placed)).toBe(1);
  });

  test("split + place = 2 moves", () => {
    const from: Board = [[t("spade", 1), t("spade", 2), t("spade", 3), t("spade", 4), t("spade", 5), t("spade", 6)]];
    const to: Board = [
      [t("spade", 1), t("spade", 2), t("spade", 3)],
      [t("spade", 4), t("spade", 5), t("spade", 6), t("spade", 7)],
    ];
    const placed = [t("spade", 7)];
    expect(countMoves(from, to, placed)).toBe(2); // 1 split + 1 place
  });

  test("merge + place = 2 moves", () => {
    const from: Board = [
      [t("spade", 1), t("spade", 2), t("spade", 3)],
      [t("spade", 5), t("spade", 6), t("spade", 7)],
    ];
    const to: Board = [[t("spade", 1), t("spade", 2), t("spade", 3), t("spade", 4), t("spade", 5), t("spade", 6), t("spade", 7)]];
    const placed = [t("spade", 4)];
    expect(countMoves(from, to, placed)).toBe(2); // 1 merge + 1 place
  });

  test("no change = 0 moves", () => {
    const board: Board = [[t("spade", 3), t("spade", 4), t("spade", 5)]];
    expect(countMoves(board, board, [])).toBe(0);
  });
});

describe("solve", () => {
  test("simple case: can place one tile", () => {
    const state: GameState = {
      board: [[t("spade", 3), t("spade", 4), t("spade", 5)]],
      hand: [t("spade", 6)],
    };
    const result = solve(state);
    // Should find that 6♠ can be played in 1 move
    expect(result.size).toBe(1);
    const entry = [...result.entries()][0]!;
    const [tiles, moves] = entry;
    expect(tiles).toHaveLength(1);
    expect(moves).toBe(1);
  });

  test("no valid plays", () => {
    const state: GameState = {
      board: [[t("spade", 3), t("spade", 4), t("spade", 5)]],
      hand: [t("heart", 10)], // can't extend the run, can't form new set
    };
    const result = solve(state);
    expect(result.size).toBe(0);
  });

  test("multiple tiles, returns minimum moves", () => {
    const state: GameState = {
      board: [[t("spade", 1), t("spade", 2), t("spade", 3), t("spade", 4), t("spade", 5), t("spade", 6)]],
      hand: [t("spade", 7)],
    };
    const result = solve(state);
    // Can play 7♠ by either:
    // - extending [1-6] to [1-7] = 1 move
    // - split [1-3][4-6] then add to second = 2 moves
    // Should return minimum = 1
    expect(result.size).toBe(1);
    const entry = [...result.entries()][0]!;
    expect(entry[1]).toBe(1);
  });
});
