import React from "react";
import { items } from "../data/items";

export default function Inventory({ onClose }) {
  return (
    <div className="p-4 bg-gray-700 text-white rounded shadow-lg">
      <h3 className="font-bold mb-2">인벤토리</h3>
      <ul>
        {items.map(item => (
          <li key={item.id} className="mb-1">{item.name} - {item.description}</li>
        ))}
      </ul>
      <button className="btn mt-2" onClick={onClose}>닫기</button>
    </div>
  );
} 