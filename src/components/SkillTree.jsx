import React from "react";

export default function SkillTree({ skills, onLearnSkill, onClose }) {
  return (
    <div className="p-4 bg-gray-800 text-white rounded shadow-lg">
      <h3 className="font-bold mb-2">스킬트리</h3>
      <ul>
        {skills && skills.length > 0 ? skills.map(skill => (
          <li key={skill.id} className="mb-1">{skill.name} <button className="btn btn-xs ml-2" onClick={() => onLearnSkill(skill.id)}>습득</button></li>
        )) : <li>습득 가능한 스킬 없음</li>}
      </ul>
      <button className="btn mt-2" onClick={onClose}>닫기</button>
    </div>
  );
} 