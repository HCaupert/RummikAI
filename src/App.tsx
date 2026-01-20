import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { ImageUploader } from "./components/ImageUploader";
import { GameStateView } from "./components/GameStateView";
import { SolutionsView } from "./components/SolutionsView";
import type { Tile, Board, Hand } from "./types";
import { RotateCcw, Sparkles } from "lucide-react";
import "./index.css";

type Solution = { tiles: Tile[]; moves: number };

async function parseHand(image: string): Promise<{ hand: Hand } | { error: string }> {
  const res = await fetch("/api/parse-hand", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image }),
  });
  return res.json();
}

async function parseBoard(image: string): Promise<{ board: Board } | { error: string }> {
  const res = await fetch("/api/parse-board", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image }),
  });
  return res.json();
}

async function solvePuzzle(board: Board, hand: Hand): Promise<{ solutions: Solution[] }> {
  const res = await fetch("/api/solve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ board, hand }),
  });
  return res.json();
}

export function App() {
  const [hand, setHand] = useState<Hand | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [solutions, setSolutions] = useState<Solution[] | null>(null);

  const handMutation = useMutation({
    mutationFn: parseHand,
    onSuccess: (data) => {
      if ("hand" in data) {
        setHand(data.hand);
        setSolutions(null);
      }
    },
  });

  const boardMutation = useMutation({
    mutationFn: parseBoard,
    onSuccess: (data) => {
      if ("board" in data) {
        setBoard(data.board);
        setSolutions(null);
      }
    },
  });

  const solveMutation = useMutation({
    mutationFn: ({ board, hand }: { board: Board; hand: Hand }) => solvePuzzle(board, hand),
    onSuccess: (data) => {
      setSolutions(data.solutions);
    },
  });

  useEffect(() => {
    if (hand && board && !solveMutation.isPending && solutions === null) {
      solveMutation.mutate({ board, hand });
    }
  }, [hand, board, solveMutation.isPending, solutions]);

  const handleReset = () => {
    setHand(null);
    setBoard(null);
    setSolutions(null);
    handMutation.reset();
    boardMutation.reset();
    solveMutation.reset();
  };

  const handStatus = handMutation.isPending
    ? "loading"
    : handMutation.isError || (handMutation.data && "error" in handMutation.data)
      ? "error"
      : hand
        ? "success"
        : "idle";

  const boardStatus = boardMutation.isPending
    ? "loading"
    : boardMutation.isError || (boardMutation.data && "error" in boardMutation.data)
      ? "error"
      : board
        ? "success"
        : "idle";

  const handError =
    handMutation.error?.message ||
    (handMutation.data && "error" in handMutation.data ? handMutation.data.error : undefined);

  const boardError =
    boardMutation.error?.message ||
    (boardMutation.data && "error" in boardMutation.data ? boardMutation.data.error : undefined);

  const hasData = hand || board;
  const showSolutions = solveMutation.isPending || solutions !== null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 via-emerald-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 bg-emerald-900/80 backdrop-blur-sm border-b border-emerald-700/50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🃏</span>
            <h1 className="text-xl font-bold text-white">RummyKai</h1>
          </div>
          {hasData && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-emerald-200 hover:text-white hover:bg-emerald-700/50 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-4 space-y-4">
        {/* Upload Section */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
          <h2 className="text-sm font-medium text-emerald-200 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-bold">1</span>
            Take photos of your cards
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <ImageUploader
              label="Your Hand"
              onImageSelect={(img) => handMutation.mutate(img)}
              status={handStatus}
              resultText={hand ? `${hand.length} cards` : undefined}
              error={handError}
            />
            <ImageUploader
              label="The Board"
              onImageSelect={(img) => boardMutation.mutate(img)}
              status={boardStatus}
              resultText={board ? `${board.flat().length} cards` : undefined}
              error={boardError}
            />
          </div>
        </section>

        {/* Parsed Cards */}
        {hasData && (
          <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <h2 className="text-sm font-medium text-emerald-200 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-bold">2</span>
              Detected cards
              <span className="text-xs text-emerald-400/60 font-normal">(tap to edit)</span>
            </h2>
            <GameStateView
              hand={hand}
              board={board}
              editable={true}
              onHandChange={(newHand) => {
                setHand(newHand);
                setSolutions(null);
              }}
              onBoardChange={(newBoard) => {
                setBoard(newBoard);
                setSolutions(null);
              }}
            />
          </section>
        )}

        {/* Solutions */}
        {showSolutions && (
          <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <h2 className="text-sm font-medium text-emerald-200 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Possible plays
            </h2>
            <SolutionsView
              solutions={solutions ?? []}
              isLoading={solveMutation.isPending}
            />
          </section>
        )}

        {/* Empty state */}
        {!hasData && (
          <div className="text-center py-8">
            <p className="text-emerald-300/70 text-sm">
              Upload photos of your hand and the board to find the best plays
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
