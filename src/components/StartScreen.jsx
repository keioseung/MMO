import React from "react";

export default function StartScreen({ onStart }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-2">Dodge the Bullets</h1>
      <p className="text-gray-300 mb-4 text-center">
        화살표 키로 네모(플레이어)를 움직여 점점 빨라지는 탄막(원)을 피해보세요!<br />
        최대한 오래 살아남아 최고 점수에 도전하세요.
      </p>
      <button
        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition"
        onClick={onStart}
      >
        게임 시작
      </button>
    </div>
  );
} 