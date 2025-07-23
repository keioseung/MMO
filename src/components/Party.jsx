import React from "react";

export default function Party({ party, onRemoveMember, onClose }) {
  return (
    <div className="p-4 bg-gray-700 text-white rounded shadow-lg">
      <h3 className="font-bold mb-2">파티</h3>
      <ul>
        {party && party.length > 0 ? party.map(member => (
          <li key={member.id} className="mb-1">{member.name} <button className="btn btn-xs ml-2" onClick={() => onRemoveMember(member.id)}>제외</button></li>
        )) : <li>파티원이 없습니다</li>}
      </ul>
      <button className="btn mt-2" onClick={onClose}>닫기</button>
    </div>
  );
} 