import { describe, test, expect } from "bun:test";
import { isValidSet, isValidBoard } from "./validation";
import type { Tile, TileSet } from "./types";

// Helpers
const tile = (shape: "spade" | "heart" | "diamond" | "club", number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13): Tile => ({
  kind: "regular",
  shape,
  number,
});
const joker: Tile = { kind: "joker" };

describe("isValidSet", () => {
  describe("groups", () => {
    test("valid 3-tile group", () => {
      expect(isValidSet([tile("spade", 7), tile("heart", 7), tile("diamond", 7)])).toBe(true);
    });

    test("valid 4-tile group", () => {
      expect(isValidSet([tile("spade", 5), tile("heart", 5), tile("diamond", 5), tile("club", 5)])).toBe(true);
    });

    test("group with joker", () => {
      expect(isValidSet([tile("spade", 3), tile("heart", 3), joker])).toBe(true);
    });

    test("group with 2 jokers", () => {
      expect(isValidSet([tile("spade", 9), joker, joker])).toBe(true);
    });

    test("invalid: duplicate shapes", () => {
      expect(isValidSet([tile("spade", 4), tile("spade", 4), tile("heart", 4)])).toBe(false);
    });

    test("invalid: different numbers", () => {
      expect(isValidSet([tile("spade", 4), tile("heart", 5), tile("diamond", 4)])).toBe(false);
    });

    test("invalid: too few tiles", () => {
      expect(isValidSet([tile("spade", 4), tile("heart", 4)])).toBe(false);
    });

    test("invalid: too many tiles (5)", () => {
      expect(isValidSet([tile("spade", 4), tile("heart", 4), tile("diamond", 4), tile("club", 4), joker])).toBe(false);
    });
  });

  describe("runs", () => {
    test("valid 3-tile run", () => {
      expect(isValidSet([tile("spade", 3), tile("spade", 4), tile("spade", 5)])).toBe(true);
    });

    test("valid long run", () => {
      expect(isValidSet([tile("heart", 1), tile("heart", 2), tile("heart", 3), tile("heart", 4), tile("heart", 5)])).toBe(true);
    });

    test("run with joker in middle", () => {
      expect(isValidSet([tile("diamond", 7), joker, tile("diamond", 9)])).toBe(true);
    });

    test("run with joker at end", () => {
      expect(isValidSet([tile("club", 11), tile("club", 12), joker])).toBe(true);
    });

    test("run with multiple jokers", () => {
      expect(isValidSet([tile("spade", 2), joker, joker, tile("spade", 5)])).toBe(true);
    });

    test("invalid: different shapes", () => {
      expect(isValidSet([tile("spade", 3), tile("heart", 4), tile("spade", 5)])).toBe(false);
    });

    test("invalid: non-consecutive", () => {
      expect(isValidSet([tile("spade", 3), tile("spade", 5), tile("spade", 6)])).toBe(false);
    });

    test("invalid: wrap-around", () => {
      expect(isValidSet([tile("spade", 12), tile("spade", 13), tile("spade", 1)])).toBe(false);
    });

    test("invalid: duplicate numbers", () => {
      expect(isValidSet([tile("spade", 3), tile("spade", 3), tile("spade", 4)])).toBe(false);
    });
  });

  describe("edge cases", () => {
    test("empty set is invalid", () => {
      expect(isValidSet([])).toBe(false);
    });

    test("only jokers is invalid", () => {
      expect(isValidSet([joker, joker, joker])).toBe(false);
    });
  });
});

describe("isValidBoard", () => {
  test("empty board is valid", () => {
    expect(isValidBoard([])).toBe(true);
  });

  test("board with one valid set", () => {
    expect(isValidBoard([[tile("spade", 3), tile("spade", 4), tile("spade", 5)]])).toBe(true);
  });

  test("board with multiple valid sets", () => {
    expect(
      isValidBoard([
        [tile("spade", 3), tile("spade", 4), tile("spade", 5)],
        [tile("heart", 7), tile("diamond", 7), tile("club", 7)],
      ])
    ).toBe(true);
  });

  test("board with one invalid set", () => {
    expect(
      isValidBoard([
        [tile("spade", 3), tile("spade", 4), tile("spade", 5)],
        [tile("heart", 7), tile("heart", 8)], // too short
      ])
    ).toBe(false);
  });
});
