import React from "react";
import { maps } from "../data/maps";

export default function WorldMap({ onEnterTown, onEnterDungeon, onOpenQuestLog, onOpenInventory }) {
  const map = maps.find(m => m.id === 'world');
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">월드맵</h2>
      <div className="mb-2">(여기에 타일맵/플레이어/오브젝트/미니맵 등 실제 게임 맵이 표시됩니다)</div>
      <button className="btn" onClick={onEnterTown}>마을 입장</button>
      <button className="btn ml-2" onClick={onEnterDungeon}>던전 입장</button>
      <button className="btn ml-2" onClick={onOpenQuestLog}>퀘스트</button>
      <button className="btn ml-2" onClick={onOpenInventory}>인벤토리</button>
    </div>
  );
} 