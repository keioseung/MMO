import React from "react";

export default function Equipment({ equipped, onUnequip, onClose }) {
  return (
    <div className="p-4 bg-gray-700 text-white rounded shadow-lg">
      <h3 className="font-bold mb-2">장비</h3>
      <ul>
        {equipped && equipped.length > 0 ? equipped.map(eq => (
          <li key={eq.id} className="mb-1">{eq.name} <button className="btn btn-xs ml-2" onClick={() => onUnequip(eq.id)}>해제</button></li>
        )) : <li>장착 중인 장비 없음</li>}
      </ul>
      <button className="btn mt-2" onClick={onClose}>닫기</button>
    </div>
  );
} 