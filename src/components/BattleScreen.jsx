import React, { useState } from "react";

// 임시 스킬/이펙트 데이터 (실제 데이터 파일과 연동 가능)
const skillData = {
  slash: { name: "베기", power: 18, type: "atk", effect: "slash" },
  guard: { name: "방어", power: 0, type: "def", effect: "guard" },
  fireball: { name: "파이어볼", power: 24, type: "atk", effect: "fire" },
  heal: { name: "힐", power: 20, type: "heal", effect: "heal" },
  arrow_shot: { name: "화살", power: 14, type: "atk", effect: "arrow" },
  evasion: { name: "회피", power: 0, type: "buff", effect: "evasion" },
  body_slam: { name: "몸통박치기", power: 8, type: "atk", effect: "slam" },
  club_attack: { name: "몽둥이질", power: 12, type: "atk", effect: "club" },
  dark_blast: { name: "다크블래스트", power: 40, type: "atk", effect: "dark" },
  summon_minions: { name: "소환", power: 0, type: "summon", effect: "summon" },
};

function getInitialParty(character, allies = []) {
  // character: 주인공, allies: 동료
  return [character, ...allies].map((c) => ({ ...c, hp: c.stats.hp, mp: c.stats.mp, alive: true, status: [] }));
}
function getInitialEnemies(enemyList) {
  return enemyList.map((e) => ({ ...e, hp: e.stats.hp, mp: e.stats.mp || 0, alive: true, status: [] }));
}

export default function BattleScreen({ character, allies = [], enemyList = [], onWin, onLose, ranking, onGameOver, achievements, achievementList }) {
  // 파티/적 상태
  const [party, setParty] = useState(getInitialParty(character, allies));
  const [enemies, setEnemies] = useState(getInitialEnemies(enemyList.length ? enemyList : [enemyList,].filter(Boolean)));
  const [turnIdx, setTurnIdx] = useState(0); // 턴 순서 인덱스 (파티+적)
  const [phase, setPhase] = useState("select"); // select(행동선택)/anim(이펙트)/enemy(적턴)/end(승패)
  const [log, setLog] = useState([]);
  const [effect, setEffect] = useState(null); // {type, targetIdx, skillId}
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [targetIdx, setTargetIdx] = useState(null);

  // 턴 순서: 파티(살아있는 순) → 적(살아있는 순)
  const allActors = [...party, ...enemies];
  const isPartyTurn = turnIdx < party.length && party[turnIdx]?.alive;
  const isEnemyTurn = turnIdx >= party.length && enemies[turnIdx - party.length]?.alive;
  const currentActor = isPartyTurn ? party[turnIdx] : enemies[turnIdx - party.length];

  // 승패 판정
  const partyAlive = party.some((m) => m.alive);
  const enemyAlive = enemies.some((e) => e.alive);
  if (!partyAlive) {
    setTimeout(() => onLose && onLose(), 500);
    return <div className="p-4 bg-gray-900 text-white rounded">패배! 파티 전멸</div>;
  }
  if (!enemyAlive) {
    setTimeout(() => onWin && onWin(), 500);
    return <div className="p-4 bg-gray-900 text-white rounded">승리! 적 전멸</div>;
  }

  // 턴 진행
  function nextTurn() {
    let next = turnIdx + 1;
    // 다음 살아있는 캐릭터/적 찾기
    for (let i = 0; i < allActors.length; i++) {
      const idx = (next + i) % allActors.length;
      if ((idx < party.length && party[idx].alive) || (idx >= party.length && enemies[idx - party.length].alive)) {
        setTurnIdx(idx);
        setPhase(idx < party.length ? "select" : "enemy");
        setSelectedSkill(null);
        setTargetIdx(null);
        return;
      }
    }
  }

  // 파티 행동 선택
  function handleSkillSelect(skillId) {
    setSelectedSkill(skillId);
  }
  function handleTargetSelect(idx) {
    setTargetIdx(idx);
  }
  function handleAction() {
    if (!selectedSkill || targetIdx == null) return;
    const skill = skillData[selectedSkill];
    setEffect({ type: skill.effect, targetIdx, skillId: selectedSkill });
    setPhase("anim");
    setTimeout(() => {
      // 실제 데미지/효과 적용
      if (skill.type === "atk") {
        // 공격: 적/아군 HP 감소
        if (isPartyTurn) {
          const newEnemies = enemies.map((e, i) =>
            i === targetIdx ? { ...e, hp: Math.max(0, e.hp - skill.power), alive: e.hp - skill.power > 0 } : e
          );
          setEnemies(newEnemies);
          setLog((l) => [...l, `${currentActor.name}의 ${skill.name}! → ${enemies[targetIdx].name}에게 ${skill.power} 데미지`]);
        } else {
          const newParty = party.map((m, i) =>
            i === targetIdx ? { ...m, hp: Math.max(0, m.hp - skill.power), alive: m.hp - skill.power > 0 } : m
          );
          setParty(newParty);
          setLog((l) => [...l, `${currentActor.name}의 ${skill.name}! → ${party[targetIdx].name}에게 ${skill.power} 데미지`]);
        }
      } else if (skill.type === "heal") {
        // 회복: 아군 HP 증가
        if (isPartyTurn) {
          const newParty = party.map((m, i) =>
            i === targetIdx ? { ...m, hp: Math.min(m.stats.hp, m.hp + skill.power) } : m
          );
          setParty(newParty);
          setLog((l) => [...l, `${currentActor.name}의 ${skill.name}! → ${party[targetIdx].name} HP +${skill.power}`]);
        }
      }
      setEffect(null);
      nextTurn();
    }, 800);
  }

  // 적 AI (랜덤 공격)
  React.useEffect(() => {
    if (phase === "enemy" && isEnemyTurn) {
      const skillId = currentActor.skills[0];
      const alivePartyIdx = party.map((m, i) => m.alive ? i : null).filter((i) => i != null);
      const target = alivePartyIdx[Math.floor(Math.random() * alivePartyIdx.length)];
      setTimeout(() => {
        setSelectedSkill(skillId);
        setTargetIdx(target);
        setTimeout(handleAction, 500);
      }, 700);
    }
    // eslint-disable-next-line
  }, [phase, isEnemyTurn]);

  // 이펙트/애니메이션 레이어 (간단 효과)
  function renderEffect() {
    if (!effect) return null;
    const skill = skillData[effect.skillId];
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="text-4xl animate-bounce font-bold" style={{ color: 'gold', textShadow: '0 0 8px #fff' }}>
          {skill.name}!
        </div>
      </div>
    );
  }

  // UI 렌더링
  return (
    <div className="relative p-4 bg-gray-900 text-white rounded shadow-lg min-h-[400px]">
      <h3 className="font-bold mb-2">전투</h3>
      <div className="flex gap-8">
        {/* 파티 UI */}
        <div>
          <div className="font-bold mb-1">아군 파티</div>
          <ul>
            {party.map((m, i) => (
              <li key={m.id} className={`mb-1 p-1 rounded ${i === turnIdx && isPartyTurn ? 'bg-blue-800' : ''} ${!m.alive ? 'opacity-50' : ''}`}>
                <span className="font-semibold">{m.name}</span> (HP: {m.hp}/{m.stats.hp}, MP: {m.mp}/{m.stats.mp})
                {m.status.length > 0 && <span className="ml-2 text-xs text-yellow-300">[{m.status.join(', ')}]</span>}
                {isPartyTurn && i === turnIdx && m.alive && phase === "select" && (
                  <div className="mt-1 flex gap-2">
                    {m.skills.map((sk) => (
                      <button key={sk} className={`btn btn-xs ${selectedSkill === sk ? 'bg-green-600' : 'bg-gray-700'}`} onClick={() => handleSkillSelect(sk)}>
                        {skillData[sk]?.name || sk}
                      </button>
                    ))}
                    {selectedSkill && (
                      <>
                        <span className="ml-2">→ 대상:</span>
                        {(selectedSkill && skillData[selectedSkill]?.type === 'heal' ? party : enemies).map((t, idx) => t.alive && (
                          <button key={idx} className={`btn btn-xs ml-1 ${targetIdx === idx ? 'bg-pink-600' : 'bg-gray-700'}`} onClick={() => handleTargetSelect(idx)}>
                            {t.name}
                          </button>
                        ))}
                        {targetIdx != null && <button className="btn btn-xs ml-2 bg-yellow-700" onClick={handleAction}>실행</button>}
                      </>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        {/* 적 UI */}
        <div>
          <div className="font-bold mb-1">적</div>
          <ul>
            {enemies.map((e, i) => (
              <li key={e.id} className={`mb-1 p-1 rounded ${i + party.length === turnIdx && isEnemyTurn ? 'bg-red-800' : ''} ${!e.alive ? 'opacity-50' : ''}`}>
                <span className="font-semibold">{e.name}</span> (HP: {e.hp}/{e.stats.hp})
                {e.status.length > 0 && <span className="ml-2 text-xs text-yellow-300">[{e.status.join(', ')}]</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* 이펙트 레이어 */}
      {renderEffect()}
      {/* 로그 */}
      <div className="mt-4 bg-gray-800 rounded p-2 text-xs h-24 overflow-y-auto">
        {log.slice(-5).map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}
// (추후: 합동기, 상태이상, 아이템, QTE, 고급 이펙트, 파티 교체 등 확장 가능) 