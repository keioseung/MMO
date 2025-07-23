import React from "react";

export default function GameOverScreen({ score, bestScore, onRestart }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-red-400 mb-2">게임 오버!</h2>
      <div className="mb-2 text-lg">
        <div>점수: <span className="font-bold">{score}</span></div>
        <div>최고점: <span className="font-bold text-blue-400">{bestScore}</span></div>
      </div>
      <button
        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition"
        onClick={onRestart}
      >
        다시 도전
      </button>
    </div>
  );
} 