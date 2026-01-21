import {generateText, Output} from "ai";
import {ParsedTilesSchema, type ParsedTiles} from "../lib/schemas";
import type {Tile, Board, Shape, TileNumber} from "../types";
import {findValidPartitions} from "../solver";
import {openrouter} from "@openrouter/ai-sdk-provider";

const PARSE_PROMPT = `You are analyzing a photo of playing cards for a Rummy game.
Identify ALL cards visible in the image and return them as a structured list.

IMPORTANT RULES:
1. Each card has a SUIT (spade ♠, heart ♥, diamond ♦, club ♣) and a VALUE
2. Map face cards to numbers: Ace=1, Jack (J)=11, Queen (Q)=12, King (K)=13
3. Number cards (2-10) use their face value
4. Jokers are special cards - set kind to "joker" and shape/number to null
5. A standard deck has duplicates - if you see multiple cards of the same rank/suit, LIST EACH ONE SEPARATELY
6. Count carefully - do not skip or merge cards

Return every single card you can see.`;

// Transform the flat schema result to proper discriminated Tile type
function transformToTiles(parsed: ParsedTiles): Tile[] {
  return parsed.tiles.map((t) => {
    if (t.kind === "joker") {
      return { kind: "joker" as const };
    }
    return {
      kind: "regular" as const,
      shape: t.shape as Shape,
      number: t.number as TileNumber,
    };
  });
}

export async function parseTilesFromImage(imageBase64: string): Promise<Tile[]> {
  const result = await generateText({
    model: openrouter(process.env.AI_MODEL ?? "openai/gpt-5.2"),
    output: Output.object({
      schema: ParsedTilesSchema,
    }),
    messages: [
      {role: "system", content: PARSE_PROMPT},
      {
        role: "user",
        content: [
          { type: "image", image: imageBase64 },
        ],
      },
    ],
  });

  return transformToTiles(result.output);
}

export async function parseHand(imageBase64: string): Promise<{ hand: Tile[] } | { error: string }> {
  try {
    const tiles = await parseTilesFromImage(imageBase64);
    return { hand: tiles };
  } catch (error) {
    console.error("Failed to parse hand:", error);
    return { error: error instanceof Error ? error.message : "Failed to parse hand image" };
  }
}

export async function parseBoard(imageBase64: string): Promise<{ board: Board } | { error: string }> {
  try {
    const tiles = await parseTilesFromImage(imageBase64);

    // Find valid partitions of the board tiles
    // The solver will figure out how to group them
    const partitions = findValidPartitions(tiles);

    if (partitions.length === 0) {
      // If no valid partition found, return tiles as individual sets (fallback)
      // This allows the solver to work with whatever we parsed
      return { board: tiles.map((t) => [t]) };
    }

    // Return the first valid partition
    return { board: partitions[0]! };
  } catch (error) {
    console.error("Failed to parse board:", error);
    return { error: error instanceof Error ? error.message : "Failed to parse board image" };
  }
}
