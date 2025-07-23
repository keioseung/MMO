import React from "react";

export default function Town({ onTalkNPC, onEnterShop, onOpenQuestLog, onReturnWorldMap }) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">시작 마을</h2>
      <button className="btn" onClick={onTalkNPC}>마을 장로와 대화</button>
      <button className="btn ml-2" onClick={onEnterShop}>상점</button>
      <button className="btn ml-2" onClick={onOpenQuestLog}>퀘스트</button>
      <button className="btn ml-2" onClick={onReturnWorldMap}>월드맵으로</button>
    </div>
  );
} 