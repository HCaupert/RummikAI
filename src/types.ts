// === Core Types ===
export const SHAPES = ["spade", "heart", "diamond", "club"] as const;
export const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;

export type Shape = (typeof SHAPES)[number];
export type TileNumber = (typeof NUMBERS)[number];

export type RegularTile = { kind: "regular"; shape: Shape; number: TileNumber };
export type JokerTile = { kind: "joker" };
export type Tile = RegularTile | JokerTile;

// === Containers ===
export type TileSet = Tile[];
export type Board = TileSet[];
export type Hand = Tile[];

export type GameState = { board: Board; hand: Hand };
