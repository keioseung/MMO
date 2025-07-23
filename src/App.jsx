import React, { useState } from "react";
import StartScreen from "./components/StartScreen";
import GameCanvas from "./components/GameCanvas";
import GameOverScreen from "./components/GameOverScreen";
import BattleScreen from "./components/BattleScreen"; // 추후 생성 예정

// 게임 상태 상수
const GameState = {
  Start: "start",
  Playing: "playing",
  Battle: "battle",
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
    special: "위기 시 1회 자동 무적(피격 시 1초간 무적)",
    characterImg: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=256&h=256&facepad=2",
    mapImg: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    fullBodyImg: "https://opengameart.org/sites/default/files/warrior_full.png"
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
    special: "탄막 전체 1회 감속(Shift키로 발동, 3초간 느려짐)",
    characterImg: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=256&h=256&facepad=2",
    mapImg: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
    fullBodyImg: "https://opengameart.org/sites/default/files/mage_full.png"
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
    special: "은신(스페이스바로 1초간 탄막 통과 가능, 쿨타임 8초)",
    characterImg: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=256&h=256&facepad=2",
    mapImg: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    fullBodyImg: "https://opengameart.org/sites/default/files/archer_full.png"
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
    special: "30초마다 자동 보호막(1회 피격 무시, 최대 2회 중첩)",
    characterImg: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=256&h=256&facepad=2",
    mapImg: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80",
    fullBodyImg: "https://opengameart.org/sites/default/files/sorceress_full.png"
  },
];

// 랭킹(로컬 최고점수) 관리 함수
function getRanking() {
  return JSON.parse(localStorage.getItem('ranking') || '[]');
}
function saveRanking(name, score) {
  const ranking = getRanking();
  ranking.push({ name, score });
  ranking.sort((a, b) => b.score - a.score);
  localStorage.setItem('ranking', JSON.stringify(ranking.slice(0, 10)));
}

// 업적 데이터
const ACHIEVEMENTS = [
  { id: 'score1000', name: '점수 1000 돌파', desc: '점수 1000점 이상 달성', check: (score, flags) => score >= 1000 },
  { id: 'score2000', name: '점수 2000 돌파', desc: '점수 2000점 이상 달성', check: (score, flags) => score >= 2000 },
  { id: 'score3000', name: '점수 3000 돌파', desc: '점수 3000점 이상 달성', check: (score, flags) => score >= 3000 },
  { id: 'boss', name: '보스 처치', desc: '보스를 쓰러뜨림', check: (score, flags) => flags.bossDefeated },
  { id: 'qte3', name: 'QTE 3회 성공', desc: 'QTE 3회 이상 성공', check: (score, flags) => flags.qteSuccess >= 3 },
  { id: 'nohit', name: '무피격 클리어', desc: '피격 없이 클리어', check: (score, flags) => flags.noHit },
];
function getAchievements() {
  return JSON.parse(localStorage.getItem('achievements') || '{}');
}
function saveAchievements(newAch) {
  const ach = { ...getAchievements(), ...newAch };
  localStorage.setItem('achievements', JSON.stringify(ach));
}

// 업적 달성 체크 및 저장
function checkAndSaveAchievements(score, flags) {
  const achieved = {};
  ACHIEVEMENTS.forEach(a => {
    if (a.check(score, flags)) achieved[a.id] = true;
  });
  saveAchievements(achieved);
  return achieved;
}

export default function App() {
  const [gameState, setGameState] = useState(GameState.Start);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    // 세션 스토리지에서 최고점 불러오기
    return Number(sessionStorage.getItem("bestScore") || 0);
  });
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [enemy, setEnemy] = useState(null); // 전투 적 정보
  // 페이드 상태
  const [fade, setFade] = useState(null); // 'in' | 'out' | null

  // 게임 시작
  const handleStart = () => {
    setScore(0);
    setGameState(GameState.Playing);
    setEnemy(null);
  };

  // 캐릭터 선택
  const handleSelectCharacter = (char) => {
    setSelectedCharacter(char);
  };

  // 탐험 중 적과 충돌 시 전투 진입
  const handleEnterBattle = (enemyData) => {
    setFade('out');
    setTimeout(() => {
      setEnemy(enemyData);
      setGameState(GameState.Battle);
      setFade('in');
      setTimeout(() => setFade(null), 400);
    }, 400);
  };

  // 전투 종료 후(승리) 탐험 재개
  const handleBattleWin = () => {
    setFade('out');
    setTimeout(() => {
      setEnemy(null);
      setGameState(GameState.Playing);
      setFade('in');
      setTimeout(() => setFade(null), 400);
    }, 400);
  };

  // 전투 종료 후(패배) 게임 오버
  const handleBattleLose = () => {
    setFade('out');
    setTimeout(() => {
      setEnemy(null);
      setGameState(GameState.GameOver);
      setFade('in');
      setTimeout(() => setFade(null), 400);
    }, 400);
  };

  // 게임 오버 처리
  const handleGameOver = (finalScore, flags = {}) => {
    setScore(finalScore);
    if (finalScore > bestScore) {
      setBestScore(finalScore);
      sessionStorage.setItem("bestScore", String(finalScore));
    }
    if (selectedCharacter) {
      saveRanking(selectedCharacter.name, finalScore);
    }
    const achieved = checkAndSaveAchievements(finalScore, flags);
    setGameState(GameState.GameOver);
  };

  // 다시 시작
  const handleRestart = () => {
    setScore(0);
    setGameState(GameState.Playing);
    setEnemy(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 relative overflow-hidden">
      {/* 페이드 오버레이 */}
      {fade && <div className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-400 ${fade === 'in' ? 'animate-fadein' : 'animate-fadeout'}`} style={{ background: '#111', opacity: fade === 'in' ? 0 : 0.85 }} />}
      {gameState === GameState.Start && (
        <StartScreen
          onStart={handleStart}
          characters={CHARACTERS}
          selectedCharacter={selectedCharacter}
          onSelectCharacter={handleSelectCharacter}
          ranking={getRanking()}
          achievements={getAchievements()}
          achievementList={ACHIEVEMENTS}
        />
      )}
      {gameState === GameState.Playing && (
        <GameCanvas
          onGameOver={handleGameOver}
          character={selectedCharacter}
          onEnterBattle={handleEnterBattle}
        />
      )}
      {gameState === GameState.Battle && (
        <BattleScreen
          character={selectedCharacter}
          enemy={enemy}
          onWin={handleBattleWin}
          onLose={handleBattleLose}
          ranking={getRanking()}
          onGameOver={handleGameOver}
          achievements={getAchievements()}
          achievementList={ACHIEVEMENTS}
        />
      )}
      {gameState === GameState.GameOver && (
        <GameOverScreen
          score={score}
          bestScore={bestScore}
          onRestart={handleRestart}
          character={selectedCharacter}
          ranking={getRanking()}
          achievements={getAchievements()}
          achievementList={ACHIEVEMENTS}
        />
      )}
    </div>
  );
} 