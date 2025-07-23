import React from "react";

export default function StartScreen({ onStart, characters, selectedCharacter, onSelectCharacter }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 bg-gray-800 rounded-lg shadow-lg max-w-xl">
      <h1 className="text-3xl font-bold mb-2">에테르니움: 균형의 파편</h1>
      <p className="text-gray-300 mb-4 text-center text-base">
        고대 신들이 창조한 다차원의 세계, <b>에테르니움</b>.<br/>
        신들의 전쟁으로 균형이 무너진 이 세계에서, 세 영웅이 <b>균형의 파편</b>을 찾아 모험을 시작합니다.<br/>
        각자의 상처와 운명을 안고, 혼돈과 질서의 경계에서 세계의 미래를 결정하세요.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 mb-2 w-full justify-center">
        {characters.map((char) => (
          <button
            key={char.id}
            onClick={() => onSelectCharacter(char)}
            className={`flex flex-col items-center p-4 rounded-lg border-2 transition shadow-md w-40 h-64 focus:outline-none ${
              selectedCharacter?.id === char.id
                ? "border-yellow-400 bg-gray-700 scale-105"
                : "border-gray-600 bg-gray-900 hover:border-blue-400"
            }`}
            type="button"
          >
            <img
              src={char.characterImg}
              alt={char.name}
              className="w-16 h-16 rounded-full mb-2 object-cover border-2"
              style={{ borderColor: selectedCharacter?.id === char.id ? '#fbbf24' : char.color }}
            />
            <div className="font-bold text-lg mb-1">{char.name}</div>
            <div className="text-xs text-gray-400 mb-1">{char.title}</div>
            <div className="text-xs text-gray-400 mb-1">{char.job}</div>
            <div className="text-xs text-gray-300 text-center">{char.description}</div>
          </button>
        ))}
      </div>
      <button
        className={`px-6 py-2 font-semibold rounded transition w-40 ${
          selectedCharacter
            ? "bg-blue-500 hover:bg-blue-600 text-white"
            : "bg-gray-600 text-gray-300 cursor-not-allowed"
        }`}
        onClick={selectedCharacter ? onStart : undefined}
        disabled={!selectedCharacter}
      >
        모험 시작
      </button>
    </div>
  );
} 