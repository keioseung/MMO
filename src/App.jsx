import React, { useState } from "react";
import StartScreen from "./components/StartScreen";
import GameCanvas from "./components/GameCanvas";
import GameOverScreen from "./components/GameOverScreen";

// 게임 상태 상수
const GameState = {
  Start: "start",
  Playing: "playing",
  GameOver: "gameover",
};

export default function App() {
  const [gameState, setGameState] = useState(GameState.Start);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    // 세션 스토리지에서 최고점 불러오기
    return Number(sessionStorage.getItem("bestScore") || 0);
  });

  // 게임 시작
  const handleStart = () => {
    setScore(0);
    setGameState(GameState.Playing);
  };

  // 게임 오버 처리
  const handleGameOver = (finalScore) => {
    setScore(finalScore);
    if (finalScore > bestScore) {
      setBestScore(finalScore);
      sessionStorage.setItem("bestScore", String(finalScore));
    }
    setGameState(GameState.GameOver);
  };

  // 다시 시작
  const handleRestart = () => {
    setScore(0);
    setGameState(GameState.Playing);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
      {gameState === GameState.Start && <StartScreen onStart={handleStart} />}
      {gameState === GameState.Playing && (
        <GameCanvas onGameOver={handleGameOver} />
      )}
      {gameState === GameState.GameOver && (
        <GameOverScreen
          score={score}
          bestScore={bestScore}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
} 