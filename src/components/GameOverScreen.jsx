import React from "react";

export default function GameOverScreen({ score, bestScore, onRestart, character, ranking = [], achievements = {}, achievementList = [] }) {
  const getMessage = () => {
    if (!character) return "모험이 여기서 끝났습니다.";
    // 엔딩 분기 예시
    if (character.id === "liad") {
      if (score >= 3000) return "리아드는 신의 의지를 넘어 균형의 파편을 완전히 되찾았다. 새로운 왕국의 전설이 시작된다.";
      if (score >= 2000) return "리아드는 마지막 시련을 극복하며, 언젠가 진정한 균형을 이룰 것을 다짐한다.";
      if (score >= 1000) return "리아드는 검을 쥔 채, 언젠가 다시 도전할 것을 마음에 새긴다.";
      return "리아드는 다시 한 번 검을 쥐고, 언젠가 균형의 파편을 되찾으리라 다짐합니다.";
    }
    if (character.id === "sera") {
      if (score >= 3000) return "세라는 운명의 실타래를 완전히 풀어내며, 새로운 미래를 창조한다.";
      if (score >= 2000) return "세라는 시간의 흐름 속에서 또 다른 가능성을 발견한다.";
      if (score >= 1000) return "세라는 흐트러진 운명의 실타래를 바라보며, 또 다른 가능성을 꿈꿉니다.";
      return "세라는 흐트러진 운명의 실타래를 바라보며, 또 다른 가능성을 꿈꿉니다.";
    }
    if (character.id === "kyle") {
      if (score >= 3000) return "카일은 어둠을 완전히 지배하며, 새로운 전설의 암살자가 된다.";
      if (score >= 2000) return "카일은 그림자를 넘어, 진정한 자유를 향해 나아간다.";
      if (score >= 1000) return "카일은 어둠 속에서 조용히 미소 짓습니다. 다음엔 반드시 그림자를 넘어설 것입니다.";
      return "카일은 어둠 속에서 조용히 미소 짓습니다. 다음엔 반드시 그림자를 넘어설 것입니다.";
    }
    if (character.id === "iris") {
      if (score >= 3000) return "이리스는 에테르의 흐름을 완전히 통제하며, 세계에 평화를 가져온다.";
      if (score >= 2000) return "이리스는 현자의 지혜로 새로운 가능성을 열어간다.";
      if (score >= 1000) return "이리스는 보호막 너머로 다가오는 미래를 조용히 응시한다.";
      return "이리스는 보호막 너머로 다가오는 미래를 조용히 응시한다.";
    }
    return "모험이 여기서 끝났습니다.";
  };
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-red-400 mb-2">게임 오버!</h2>
      <div className="mb-2 text-lg">
        <div>점수: <span className="font-bold">{score}</span></div>
        <div>최고점: <span className="font-bold text-blue-400">{bestScore}</span></div>
      </div>
      <div className="text-gray-300 text-center mb-2 min-h-[40px]">{getMessage()}</div>
      {/* 랭킹 리스트 */}
      <div className="w-64 bg-gray-900 rounded p-2 mt-2 mb-2 border border-gray-700">
        <div className="font-bold text-yellow-300 mb-1">🏆 랭킹 TOP 10</div>
        {ranking.length === 0 && <div className="text-xs text-gray-400">기록 없음</div>}
        {ranking.map((r, i) => (
          <div key={i} className={`flex flex-row justify-between text-xs px-2 py-1 rounded ${r.score === score ? 'bg-yellow-900 text-yellow-200 font-bold' : 'text-gray-300'}`}>
            <span>{i+1}. {r.name}</span>
            <span>{r.score}</span>
          </div>
        ))}
      </div>
      {/* 업적 리스트 */}
      <div className="w-64 bg-gray-900 rounded p-2 mt-2 mb-2 border border-gray-700">
        <div className="font-bold text-green-300 mb-1">🏅 업적</div>
        {achievementList.map((a) => (
          <div key={a.id} className={`flex flex-row justify-between text-xs px-2 py-1 rounded ${achievements[a.id] ? 'bg-green-900 text-green-200 font-bold' : 'text-gray-500 opacity-60'}`}>
            <span>{a.name}</span>
            <span>{a.desc}</span>
          </div>
        ))}
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