import React from "react";

export default function BattleScreen({ character, enemy, onWin, onLose, ranking, onGameOver, achievements, achievementList }) {
  return (
    <div className="p-4 bg-gray-900 text-white rounded shadow-lg">
      <h3 className="font-bold mb-2">전투</h3>
      <div className="mb-2">플레이어: {character?.name} (HP: {character?.stats?.hp ?? 100})</div>
      <div className="mb-2">적: {enemy?.name} (HP: {enemy?.hp ?? 100})</div>
      <button className="btn" onClick={onWin}>승리</button>
      <button className="btn ml-2" onClick={onLose}>패배</button>
      <div className="mt-4 text-xs text-gray-400">(실제 전투 로직/스킬/이펙트/파티 등은 추후 구현)</div>
    </div>
  );
} 