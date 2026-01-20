import { z } from "zod";

// Schema for a single card - using a flat object structure that Claude supports
// kind: "regular" requires shape and number, kind: "joker" has them as null
export const TileSchema = z.object({
  kind: z.enum(["regular", "joker"]).describe("Card type: 'regular' for normal cards, 'joker' for joker cards"),
  shape: z
    .enum(["spade", "heart", "diamond", "club"])
    .nullable()
    .describe("The suit: spade (♠), heart (♥), diamond (♦), or club (♣). Set to null for jokers."),
  number: z
    .number()
    .nullable()
    .describe("The card value: Ace=1, 2-10 as-is, Jack=11, Queen=12, King=13. Must be 1-13. Set to null for jokers."),
});

// Schema for parsing response - a list of cards
export const ParsedTilesSchema = z.object({
  tiles: z
    .array(TileSchema)
    .describe(
      "List of ALL visible cards. CRITICAL: If you see duplicate cards (e.g., two 7 of spades), list each one separately. Map J/Q/K to 11/12/13. For jokers, set shape and number to null."
    ),
});

export type ParsedTiles = z.infer<typeof ParsedTilesSchema>;
