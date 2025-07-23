import React from "react";

export default function NPCDialog({ npc, onAcceptQuest, onClose }) {
  return (
    <div className="p-4 bg-gray-900 text-white rounded shadow-lg">
      <h3 className="font-bold mb-2">{npc?.name || 'NPC'}</h3>
      <div className="mb-2">{npc?.dialog || '어서 오게, 용사여!'}</div>
      <button className="btn" onClick={onAcceptQuest}>퀘스트 수락</button>
      <button className="btn ml-2" onClick={onClose}>닫기</button>
    </div>
  );
} 