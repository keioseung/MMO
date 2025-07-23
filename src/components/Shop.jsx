import React from "react";
import { items } from "../data/items";

export default function Shop({ onBuy, onSell, onClose }) {
  return (
    <div className="p-4 bg-gray-800 text-white rounded shadow-lg">
      <h3 className="font-bold mb-2">상점</h3>
      <ul>
        {items.map(item => (
          <li key={item.id} className="mb-1">{item.name} <button className="btn btn-xs ml-2" onClick={() => onBuy(item.id)}>구매</button> <button className="btn btn-xs ml-2" onClick={() => onSell(item.id)}>판매</button></li>
        ))}
      </ul>
      <button className="btn mt-2" onClick={onClose}>닫기</button>
    </div>
  );
} 