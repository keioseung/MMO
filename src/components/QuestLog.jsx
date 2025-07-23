import React from "react";
import { quests } from "../data/quests";

export default function QuestLog({ onClose }) {
  return (
    <div className="p-4 bg-gray-800 text-white rounded shadow-lg">
      <h3 className="font-bold mb-2">퀘스트 목록</h3>
      <ul>
        {quests.map(q => (
          <li key={q.id} className="mb-1">{q.name} - {q.description}</li>
        ))}
      </ul>
      <button className="btn mt-2" onClick={onClose}>닫기</button>
    </div>
  );
} 