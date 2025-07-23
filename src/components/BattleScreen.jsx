import React, { useState } from "react";
import { characters } from "../data/characters";
import { monsters } from "../data/monsters";
import { items } from "../data/items";

// 간단한 스킬/이펙트 정의 (실제 게임에서는 별도 파일로 분리 가능)
const SKILLS = {
  slash: { name: "베기", power: 1.2, mp: 0, effect: "slash" },
  guard: { name: "방어", power: 0, mp: 0, effect: "guard" },
  fireball: { name: "파이어볼", power: 1.5, mp: 10, effect: "fire" },
  heal: { name: "힐", power: -1, mp: 12, effect: "heal" },
  arrow_shot: { name: "화살", power: 1.1, mp: 0, effect: "arrow" },
  evasion: { name: "회피", power: 0, mp: 5, effect: "evasion" },
  body_slam: { name: "몸통박치기", power: 1.0, mp: 0, effect: "slam" },
  club_attack: { name: "몽둥이질", power: 1.2, mp: 0, effect: "club" },
  dark_blast: { name: "암흑폭발", power: 2.0, mp: 15, effect: "dark" },
  summon_minions: { name: "소환", power: 0, mp: 20, effect: "summon" },
};

function getSkillInfo(id) {
  return SKILLS[id] || { name: id, power: 1, mp: 0, effect: "" };
}

export default function BattleScreen({ character, enemy, onWin, onLose, ranking, onGameOver, achievements, achievementList }) {
  // 파티: 주인공 + 동료(최대 3명)
  const [party, setParty] = useState([
    { ...character, hp: character?.stats?.hp ?? 100, mp: character?.stats?.mp ?? 30, alive: true },
    // 동료 예시: 실제로는 탐험에서 합류한 동료를 받아와야 함
    { id: 'mage', name: '세라', class: '마법사', hp: 70, mp: 60, alive: true, skills: ['fireball', 'heal'] },
  ]);
  const [enemies, setEnemies] = useState([
    { ...enemy, hp: enemy?.hp ?? 100, alive: true },
  ]);
  const [turn, setTurn] = useState(0); // 0: 아군, 1: 적
  const [activeIdx, setActiveIdx] = useState(0); // 현재 행동중인 캐릭터 인덱스
  const [log, setLog] = useState([]); // 전투 로그
  const [effect, setEffect] = useState(null); // 이펙트(간단한 텍스트/색상)
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [battleEnd, setBattleEnd] = useState(false);
  const [winner, setWinner] = useState(null); // 'party' | 'enemy'

  // 턴 진행
  function nextTurn() {
    // 승패 판정
    if (enemies.every(e => !e.alive)) {
      setBattleEnd(true); setWinner('party'); setLog(l => [...l, '전투 승리!']);
      setTimeout(() => onWin(), 1200);
      return;
    }
    if (party.every(p => !p.alive)) {
      setBattleEnd(true); setWinner('enemy'); setLog(l => [...l, '전투 패배...']);
      setTimeout(() => onLose(), 1200);
      return;
    }
    // 다음 턴
    if (turn === 0) { // 아군 턴
      // 다음 살아있는 파티원
      let idx = activeIdx + 1;
      while (idx < party.length && !party[idx].alive) idx++;
      if (idx < party.length) {
        setActiveIdx(idx);
      } else {
        setTurn(1); setActiveIdx(0);
        setTimeout(enemyTurn, 800);
      }
    } else { // 적 턴
      setTurn(0); setActiveIdx(0);
    }
  }

  // 아군 행동
  function handleAction(action, skillId) {
    if (battleEnd) return;
    const actor = party[activeIdx];
    if (!actor || !actor.alive) return;
    if (action === 'attack') {
      // 기본 공격
      const targetIdx = enemies.findIndex(e => e.alive);
      if (targetIdx === -1) return;
      const target = enemies[targetIdx];
      const dmg = Math.max(1, Math.floor(actor.stats.atk * 1.0 - (target.stats?.def ?? 0) * 0.5));
      setEffect({ type: 'attack', target: 'enemy', value: dmg });
      setEnemies(es => es.map((e, i) => i === targetIdx ? { ...e, hp: Math.max(0, e.hp - dmg), alive: e.hp - dmg > 0 } : e));
      setLog(l => [...l, `${actor.name}의 공격! ${target.name}에게 ${dmg} 데미지`]);
      setTimeout(() => { setEffect(null); nextTurn(); }, 800);
    } else if (action === 'skill' && skillId) {
      const skill = getSkillInfo(skillId);
      if (actor.mp < skill.mp) {
        setLog(l => [...l, `${actor.name}: MP 부족!`]);
        return;
      }
      if (skill.power < 0) {
        // 힐류
        setParty(ps => ps.map((p, i) => i === activeIdx ? { ...p, hp: Math.min(p.hp - skill.power * actor.stats.atk, p.stats.hp), mp: p.mp - skill.mp } : p));
        setEffect({ type: 'heal', target: 'party', value: -skill.power * actor.stats.atk });
        setLog(l => [...l, `${actor.name}의 ${skill.name}! HP 회복`]);
      } else {
        // 공격류
        const targetIdx = enemies.findIndex(e => e.alive);
        if (targetIdx === -1) return;
        const target = enemies[targetIdx];
        const dmg = Math.max(1, Math.floor(actor.stats.atk * skill.power - (target.stats?.def ?? 0) * 0.5));
        setEffect({ type: skill.effect, target: 'enemy', value: dmg });
        setEnemies(es => es.map((e, i) => i === targetIdx ? { ...e, hp: Math.max(0, e.hp - dmg), alive: e.hp - dmg > 0 } : e));
        setParty(ps => ps.map((p, i) => i === activeIdx ? { ...p, mp: p.mp - skill.mp } : p));
        setLog(l => [...l, `${actor.name}의 ${skill.name}! ${target.name}에게 ${dmg} 데미지`]);
      }
      setTimeout(() => { setEffect(null); nextTurn(); }, 900);
    } else if (action === 'item' && selectedItem) {
      // 아이템 사용(HP 회복류만 예시)
      setParty(ps => ps.map((p, i) => i === activeIdx ? { ...p, hp: Math.min(p.hp + (selectedItem.effect.hp || 0), p.stats.hp) } : p));
      setLog(l => [...l, `${actor.name}이(가) ${selectedItem.name} 사용! HP +${selectedItem.effect.hp}`]);
      setTimeout(() => { setEffect(null); nextTurn(); }, 700);
    } else if (action === 'guard') {
      setLog(l => [...l, `${actor.name}이(가) 방어 자세! (턴간 데미지 50% 감소)`]);
      setTimeout(() => { setEffect(null); nextTurn(); }, 500);
    }
  }

  // 적 행동(랜덤)
  function enemyTurn() {
    if (battleEnd) return;
    const actor = enemies[0];
    if (!actor || !actor.alive) { nextTurn(); return; }
    const targetIdx = party.findIndex(p => p.alive);
    if (targetIdx === -1) { nextTurn(); return; }
    const target = party[targetIdx];
    const dmg = Math.max(1, Math.floor((actor.stats?.atk ?? 10) * 1.0 - (target.stats?.def ?? 0) * 0.5));
    setEffect({ type: 'attack', target: 'party', value: dmg });
    setParty(ps => ps.map((p, i) => i === targetIdx ? { ...p, hp: Math.max(0, p.hp - dmg), alive: p.hp - dmg > 0 } : p));
    setLog(l => [...l, `${actor.name}의 공격! ${target.name}에게 ${dmg} 데미지`]);
    setTimeout(() => { setEffect(null); nextTurn(); }, 900);
  }

  // UI 렌더링
  return (
    <div className="p-4 bg-gray-900 text-white rounded shadow-lg min-w-[340px]">
      <h3 className="font-bold mb-2 text-lg">전투</h3>
      <div className="flex flex-row gap-4 mb-2">
        {/* 파티 UI */}
        <div className="flex-1">
          <div className="font-bold mb-1">아군 파티</div>
          {party.map((p, i) => (
            <div key={p.id} className={`mb-1 p-1 rounded ${i===activeIdx && turn===0 ? 'bg-blue-800' : 'bg-gray-700'} ${!p.alive ? 'opacity-50' : ''}`}>
              <span className="font-bold text-blue-300">{p.name}</span> ({p.class}) HP:{p.hp}/{p.stats?.hp} MP:{p.mp}/{p.stats?.mp}
              {i===activeIdx && turn===0 && p.alive && (
                <div className="mt-1 flex flex-row gap-2">
                  <button className="btn btn-xs" onClick={()=>handleAction('attack')}>공격</button>
                  {p.skills && p.skills.map(sid => <button key={sid} className="btn btn-xs" onClick={()=>handleAction('skill', sid)}>{getSkillInfo(sid).name}</button>)}
                  <button className="btn btn-xs" onClick={()=>handleAction('guard')}>방어</button>
                  {/* 아이템 사용 예시 */}
                  <button className="btn btn-xs" onClick={()=>handleAction('item')}>아이템</button>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* 적 UI */}
        <div className="flex-1">
          <div className="font-bold mb-1">적</div>
          {enemies.map((e, i) => (
            <div key={e.id} className={`mb-1 p-1 rounded bg-red-900 ${!e.alive ? 'opacity-50' : ''}`}>
              <span className="font-bold text-red-200">{e.name}</span> HP:{e.hp}/{e.stats?.hp}
            </div>
          ))}
        </div>
      </div>
      {/* 이펙트/애니메이션(간단 텍스트) */}
      {effect && (
        <div className="my-2 text-center text-yellow-300 animate-pulse">
          {effect.type === 'attack' && `${effect.target === 'enemy' ? '적' : '아군'}에게 ${effect.value} 데미지!`}
          {effect.type === 'heal' && `HP ${effect.value} 회복!`}
          {effect.type !== 'attack' && effect.type !== 'heal' && `${effect.type} 효과!`}
        </div>
      )}
      {/* 전투 로그 */}
      <div className="bg-gray-800 rounded p-2 mt-2 text-xs h-24 overflow-y-auto">
        {log.slice(-6).map((line, i) => <div key={i}>{line}</div>)}
      </div>
      {/* 전투 종료 */}
      {battleEnd && (
        <div className="mt-4 text-center font-bold text-lg">
          {winner === 'party' ? '승리!' : '패배...'}
        </div>
      )}
    </div>
  );
} 