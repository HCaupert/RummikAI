import { serve } from "bun";
import index from "./index.html";
import { parseHand, parseBoard } from "./api/parse";
import { solve } from "./solver";
import type { Board, Hand, Tile } from "./types";

type Solution = { tiles: Tile[]; moves: number };

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes
    "/*": index,

    "/api/parse-hand": {
      async POST(req) {
        try {
          const body = await req.json();
          const { image } = body as { image: string };

          if (!image) {
            return Response.json({ error: "No image provided" }, { status: 400 });
          }

          const result = await parseHand(image);
          return Response.json(result);
        } catch (error) {
          console.error("Parse hand error:", error);
          return Response.json(
            { error: error instanceof Error ? error.message : "Failed to parse hand" },
            { status: 500 }
          );
        }
      },
    },

    "/api/parse-board": {
      async POST(req) {
        try {
          const body = await req.json();
          const { image } = body as { image: string };

          if (!image) {
            return Response.json({ error: "No image provided" }, { status: 400 });
          }

          const result = await parseBoard(image);
          return Response.json(result);
        } catch (error) {
          console.error("Parse board error:", error);
          return Response.json(
            { error: error instanceof Error ? error.message : "Failed to parse board" },
            { status: 500 }
          );
        }
      },
    },

    "/api/solve": {
      async POST(req) {
        try {
          const body = await req.json();
          const { board, hand } = body as { board: Board; hand: Hand };

          if (!board || !hand) {
            return Response.json({ error: "Board and hand are required" }, { status: 400 });
          }

          // Solve with max 5 tiles
          const result = solve({ board, hand }, 5);

          // Convert Map to sorted array
          const solutions: Solution[] = [];
          for (const [tiles, moves] of result.entries()) {
            solutions.push({ tiles, moves });
          }

          // Sort by moves ascending, then by tile count descending (more tiles = better play)
          solutions.sort((a, b) => {
            if (a.moves !== b.moves) return a.moves - b.moves;
            return b.tiles.length - a.tiles.length;
          });

          return Response.json({ solutions });
        } catch (error) {
          console.error("Solve error:", error);
          return Response.json(
            { error: error instanceof Error ? error.message : "Failed to solve" },
            { status: 500 }
          );
        }
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
