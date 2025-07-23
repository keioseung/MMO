import React from "react";

export default function Dungeon({ onEnterBattle, onReturnWorldMap }) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">어둠의 던전</h2>
      <button className="btn" onClick={() => onEnterBattle('slime')}>슬라임 전투</button>
      <button className="btn ml-2" onClick={() => onEnterBattle('shadow_lord')}>보스 전투</button>
      <button className="btn ml-2" onClick={onReturnWorldMap}>월드맵으로</button>
    </div>
  );
} 