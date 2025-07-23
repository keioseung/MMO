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

const CHARACTERS = [
  {
    id: "liad",
    name: "리아드",
    title: "에테르의 검",
    job: "전사(기사)",
    description:
      "몰락한 왕국의 마지막 후계자. 에테르의 힘이 깃든 검을 사용하며, 내면에 깊은 상처와 책임감을 지닌 냉철한 리더.",
    color: "#60a5fa",
    speed: 4, // 표준 속도
    size: 36, // 약간 큼
    special: "위기 시 1회 자동 무적(피격 시 1초간 무적)"
  },
  {
    id: "sera",
    name: "세라",
    title: "운명의 실타래",
    job: "마법사(운명술사)",
    description:
      "시간과 운명을 읽는 고대 종족의 마지막 생존자. 에테르의 흐름을 조작해 시간과 공간을 왜곡하는 마법을 사용.",
    color: "#a78bfa",
    speed: 3.2, // 느리지만
    size: 28, // 작음
    special: "탄막 전체 1회 감속(Shift키로 발동, 3초간 느려짐)"
  },
  {
    id: "kyle",
    name: "카일",
    title: "그림자 사냥꾼",
    job: "궁수(암살자)",
    description:
      "어둠의 길드에서 자란 천재 암살자. 그림자와 융합해 은신, 기습, 독화살 등 다양한 암살 기술을 구사.",
    color: "#fbbf24",
    speed: 5.2, // 빠름
    size: 24, // 매우 작음
    special: "은신(스페이스바로 1초간 탄막 통과 가능, 쿨타임 8초)"
  },
  {
    id: "iris",
    name: "이리스",
    title: "에테르의 현자",
    job: "지원형 마법사",
    description:
      "에테르의 흐름을 자유롭게 다루는 현자. 위기 순간마다 동료와 자신을 보호하는 힘을 발휘한다.",
    color: "#34d399",
    speed: 3.8, // 중간
    size: 32, // 표준
    special: "30초마다 자동 보호막(1회 피격 무시, 최대 2회 중첩)"
  },
];

export default function App() {
  const [gameState, setGameState] = useState(GameState.Start);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    // 세션 스토리지에서 최고점 불러오기
    return Number(sessionStorage.getItem("bestScore") || 0);
  });
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // 게임 시작
  const handleStart = () => {
    setScore(0);
    setGameState(GameState.Playing);
  };

  // 캐릭터 선택
  const handleSelectCharacter = (char) => {
    setSelectedCharacter(char);
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
      {gameState === GameState.Start && (
        <StartScreen
          onStart={handleStart}
          characters={CHARACTERS}
          selectedCharacter={selectedCharacter}
          onSelectCharacter={handleSelectCharacter}
        />
      )}
      {gameState === GameState.Playing && (
        <GameCanvas onGameOver={handleGameOver} character={selectedCharacter} />
      )}
      {gameState === GameState.GameOver && (
        <GameOverScreen
          score={score}
          bestScore={bestScore}
          onRestart={handleRestart}
          character={selectedCharacter}
        />
      )}
    </div>
  );
} 