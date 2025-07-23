import React, { useState } from "react";
import { Howl, Howler } from 'howler';

// 속성/무기/스킬/상관관계/상태이상 등 데이터 예시
const ATTRIBUTES = [
  { id: "fire", name: "불", color: "#f87171" },
  { id: "water", name: "물", color: "#60a5fa" },
  { id: "wind", name: "바람", color: "#34d399" },
  { id: "earth", name: "땅", color: "#a3a3a3" },
  { id: "light", name: "빛", color: "#fde68a" },
  { id: "dark", name: "어둠", color: "#818cf8" },
];
const ATTRIBUTE_RELATION = {
  fire: { strong: ["wind"], weak: ["water"] },
  water: { strong: ["fire"], weak: ["earth"] },
  wind: { strong: ["earth"], weak: ["fire"] },
  earth: { strong: ["water"], weak: ["wind"] },
  light: { strong: ["dark"], weak: [] },
  dark: { strong: ["light"], weak: [] },
};
const WEAPON_TYPES = {
  sword: { name: "검", stagger: 0.3, speed: 1.0 },
  greatsword: { name: "대검", stagger: 0.7, speed: 0.7 },
  dagger: { name: "단검", stagger: 0.1, speed: 1.5 },
  bow: { name: "활", stagger: 0.2, speed: 1.2 },
  staff: { name: "지팡이", stagger: 0.2, speed: 1.0 },
};
const SKILLS = [
  { id: "attack", name: "공격", desc: "기본 공격", icon: "⚔️", cooldown: 0 },
  { id: "skill1", name: "속성 스킬", desc: "속성 피해 및 부가효과", icon: "✨", cooldown: 2 },
  { id: "guard", name: "방어", desc: "받는 피해 감소", icon: "🛡️", cooldown: 1 },
];

// 적 예시(실제 게임에서는 랜덤/다양화 가능)
const DEFAULT_ENEMY = {
  name: "파이어 슬라임",
  hp: 80,
  maxHp: 80,
  attribute: "fire",
  weapon: "none",
  skills: ["attack", "skill1"],
};

// 상태이상/버프 아이콘 데이터 예시
const STATUS_ICONS = {
  guard: { icon: "🛡️", label: "방어" },
  burn: { icon: "🔥", label: "화상" },
  poison: { icon: "☠️", label: "중독" },
  // ... 추가 가능
};

// 무료 샘플 BGM/SFX URL
const BGM_BATTLE = 'https://cdn.pixabay.com/audio/2022/10/16/audio_12b5b8b6b2.mp3';
const SFX_ATTACK = 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b2e3e.mp3';
const SFX_SKILL = 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b2e3e.mp3';
const SFX_GUARD = 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b2e3e.mp3';
const SFX_HIT = 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b2e3e.mp3';

// 엔딩 음악
const BGM_ENDING = 'https://cdn.pixabay.com/audio/2022/10/16/audio_12b5b8b6b2.mp3';

function getAttributeColor(attr) {
  return ATTRIBUTES.find((a) => a.id === attr)?.color || "#fff";
}

export default function BattleScreen({ character, enemy = {}, allies = [], multiBoss = [], storyFlags = {}, onWin, onLose, ...rest }) {
  if (!enemy || !enemy.name) {
    return <div className="flex flex-col items-center justify-center bg-gray-900 p-6 rounded-lg shadow-lg w-[420px] min-h-[420px] text-white">전투 데이터 오류: 몬스터 정보가 없습니다.</div>;
  }
  // 플레이어/적 상태
  const [player, setPlayer] = useState({
    name: character.name,
    hp: 100,
    maxHp: 100,
    attribute: "light",
    weapon: "sword",
    skills: ["attack", "skill1", "guard"],
    weaponLevel: 1,
    status: [],
  });
  const [foe, setFoe] = useState(enemy);
  const [turn, setTurn] = useState("player");
  const [log, setLog] = useState(["전투가 시작되었습니다!"]);
  const [selectedSkill, setSelectedSkill] = useState("attack");
  const [battleEnd, setBattleEnd] = useState(false);
  const [playerAnim, setPlayerAnim] = useState("");
  const [enemyAnim, setEnemyAnim] = useState("");
  // 스킬 쿨타임 상태
  const [skillCooldowns, setSkillCooldowns] = useState({ attack: 0, skill1: 0, guard: 0 });
  // 파티클 상태
  const [particle, setParticle] = useState(null); // 'fire' | 'lightning' | 'aura' | null
  // 카메라 줌 상태
  const [zoom, setZoom] = useState(1);
  // 컷씬 상태
  const [cutscene, setCutscene] = useState(false);
  // QTE 상태
  const [qte, setQte] = useState(null); // { active: bool, success: bool|null, key: string, time: number, progress: number }
  // 엔딩 컷씬 상태
  const [ending, setEnding] = useState(false);
  const [endingType, setEndingType] = useState('normal'); // 'normal' | 'true' | 'bad' 등
  // 보스 페이즈 상태
  const [bossPhase, setBossPhase] = useState(1); // 1: 기본, 2: 분노
  const [phaseCutscene, setPhaseCutscene] = useState(false);

  const mapImg = character?.mapImg || "/maps/forest.jpg";
  const playerImg = character?.characterImg || "/characters/hero.png";
  const enemyImg = enemy.img || "/enemies/slime.png";

  // 속성 상성 계산
  function calcAttributeEffect(attacker, defender) {
    const rel = ATTRIBUTE_RELATION[attacker.attribute] || {};
    if (rel.strong?.includes(defender.attribute)) return 1.5;
    if (rel.weak?.includes(defender.attribute)) return 0.5;
    return 1.0;
  }

  // 턴 진행
  function handlePlayerAction() {
    if (battleEnd) return;
    if (skillCooldowns[selectedSkill] > 0) return;
    let dmg = 0;
    let msg = "";
    // 효과음
    if (selectedSkill === "attack") new Howl({ src: [SFX_ATTACK], volume: 0.7 }).play();
    if (selectedSkill === "skill1") {
      new Howl({ src: [SFX_SKILL], volume: 0.7 }).play();
      setParticle('fire');
      setZoom(1.15);
      setTimeout(() => setParticle(null), 700);
      setTimeout(() => setZoom(1), 700);
    }
    if (selectedSkill === "guard") new Howl({ src: [SFX_GUARD], volume: 0.7 }).play();
    if (selectedSkill === "attack") {
      dmg = 15 + player.weaponLevel * 2;
      dmg *= calcAttributeEffect(player, foe);
      msg = `${player.name}의 공격! ${dmg.toFixed(0)} 피해`;
      setEnemyAnim("hit-flash");
      setTimeout(() => setEnemyAnim(""), 400);
    } else if (selectedSkill === "skill1") {
      dmg = 22 + player.weaponLevel * 3;
      dmg *= calcAttributeEffect(player, foe);
      msg = `${player.name}의 속성 스킬! ${dmg.toFixed(0)} 피해`;
      setEnemyAnim("skill-glow");
      setTimeout(() => setEnemyAnim(""), 600);
    } else if (selectedSkill === "guard") {
      msg = `${player.name}가 방어 태세! 다음 턴 받는 피해 50% 감소`;
      setPlayerAnim("guard-glow");
      setTimeout(() => setPlayerAnim(""), 600);
      setPlayer((p) => ({ ...p, status: [...p.status, "guard"] }));
    }
    if (selectedSkill !== "guard") {
      setFoe((f) => {
        const newHp = Math.max(0, f.hp - dmg);
        return { ...f, hp: newHp };
      });
    }
    setLog((l) => [...l, msg]);
    // 쿨타임 적용
    const skillData = SKILLS.find(s => s.id === selectedSkill);
    if (skillData && skillData.cooldown > 0) {
      setSkillCooldowns((prev) => ({ ...prev, [selectedSkill]: skillData.cooldown + 1 }));
    }
    // 모든 스킬 쿨타임 1씩 감소(단, 사용한 스킬은 위에서 재설정)
    setSkillCooldowns((prev) => Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, k === selectedSkill ? prev[k] : Math.max(0, v - 1)])));
    setTurn("enemy");
  }

  // 보스 페이즈별 스킬/패턴
  function handleEnemyAction() {
    if (battleEnd) return;
    setTimeout(() => {
      let dmg = 12 * bossAttackPower;
      let msg = `${foe.name}의 공격!`;
      dmg *= calcAttributeEffect(foe, player);
      if (player.status.includes("guard")) {
        dmg *= 0.5;
        msg += " (방어로 피해 감소)";
      }
      // 페이즈2: 연속공격/광역기/상태이상
      if (enemy?.isBoss && bossPhase === 2 && Math.random() < 0.5) {
        // 광역기(강한 한방)
        dmg *= 1.5;
        msg = `${foe.name}의 광역기! ${dmg.toFixed(0)} 피해 (상태이상: 화상)`;
        setPlayer((p) => ({ ...p, status: [...p.status, "burn"] }));
      } else if (enemy?.isBoss && bossPhase === 2 && Math.random() < 0.5) {
        // 연속공격(2회)
        dmg = Math.floor(dmg * 0.7);
        msg = `${foe.name}의 연속공격! 각 ${dmg} 피해`;
        setPlayer((p) => {
          let hp1 = Math.max(0, p.hp - dmg);
          let hp2 = Math.max(0, hp1 - dmg);
          return { ...p, hp: hp2, status: p.status.filter((s) => s !== "guard") };
        });
        setLog((l) => [...l, `${msg}`]);
        setTurn("player");
        return;
      }
      setPlayerAnim("hit-shake");
      setTimeout(() => setPlayerAnim(""), 400);
      setPlayer((p) => {
        const newHp = Math.max(0, p.hp - dmg);
        return { ...p, hp: newHp, status: p.status.filter((s) => s !== "guard") };
      });
      setLog((l) => [...l, `${msg} ${dmg.toFixed(0)} 피해`]);
      setTurn("player");
    }, 900);
  }

  // 턴/종료 체크
  React.useEffect(() => {
    if (foe.hp <= 0 && !battleEnd) {
      setBattleEnd(true);
      setLog((l) => [...l, `${foe.name}을(를) 쓰러뜨렸다!`]);
      setTimeout(onWin, 1200);
    } else if (player.hp <= 0 && !battleEnd) {
      setBattleEnd(true);
      setLog((l) => [...l, `${player.name}이(가) 쓰러졌다...`]);
      setTimeout(onLose, 1200);
    } else if (turn === "enemy" && !battleEnd) {
      handleEnemyAction();
    }
    // eslint-disable-next-line
  }, [turn, foe.hp, player.hp]);

  // 적 턴 끝나면 쿨타임 감소
  React.useEffect(() => {
    if (turn === "player" && !battleEnd) {
      setSkillCooldowns((prev) => Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, Math.max(0, v - 1)])));
    }
  }, [turn, battleEnd]);

  // 보스 등장 시 카메라 줌
  React.useEffect(() => {
    if (enemy?.isBoss) {
      setParticle('aura');
      setZoom(1.2);
      setTimeout(() => setParticle(null), 1200);
      setTimeout(() => setZoom(1), 1200);
    }
  }, [enemy]);

  // 보스 등장 시 컷씬
  React.useEffect(() => {
    if (enemy?.isBoss) {
      setCutscene(true);
      setTimeout(() => setCutscene(false), 2200);
    }
  }, [enemy]);

  // QTE 빈도: 보스 페이즈에 따라 증가
  React.useEffect(() => {
    if (enemy?.isBoss && turn === 'enemy' && !battleEnd && foe.hp > 0) {
      const qteFreq = bossPhase === 2 ? 15 : 30; // 분노 시 15씩, 기본 30씩
      if ((foe.maxHp - foe.hp) % qteFreq < 1 && foe.hp !== foe.maxHp) {
        const qteKey = ['A','S','D','F'][Math.floor(Math.random()*4)];
        setQte({ active: true, success: null, key: qteKey, time: 2000, progress: 0 });
      }
    }
  }, [turn, foe.hp, battleEnd, enemy, foe.maxHp, bossPhase]);
  // QTE 진행
  React.useEffect(() => {
    if (qte?.active && qte.success === null) {
      let start = Date.now();
      const timer = setInterval(() => {
        const elapsed = Date.now() - start;
        setQte(q => q && { ...q, progress: Math.min(1, elapsed / q.time) });
        if (elapsed >= qte.time) {
          setQte(q => q && { ...q, active: false, success: false });
          clearInterval(timer);
        }
      }, 16);
      const onKey = (e) => {
        if (e.key.toUpperCase() === qte.key && qte.active && qte.success === null) {
          setQte(q => q && { ...q, active: false, success: true });
          clearInterval(timer);
        }
      };
      window.addEventListener('keydown', onKey);
      return () => { clearInterval(timer); window.removeEventListener('keydown', onKey); };
    }
  }, [qte]);
  // QTE 결과 처리
  React.useEffect(() => {
    if (qte && qte.success !== null) {
      if (qte.success) {
        setLog(l => [...l, 'QTE 성공! 보스의 특수 공격을 회피했다!']);
      } else {
        setLog(l => [...l, 'QTE 실패! 보스의 특수 공격에 맞았다!']);
        setPlayer(p => ({ ...p, hp: Math.max(0, p.hp - 30) }));
      }
      setTimeout(() => setQte(null), 1200);
    }
  }, [qte]);

  // BGM 관리
  React.useEffect(() => {
    const bgm = new Howl({ src: [BGM_BATTLE], loop: true, volume: 0.4 });
    bgm.play();
    return () => { bgm.stop(); };
  }, []);

  // 보스 처치(승리) 시 엔딩 컷씬
  React.useEffect(() => {
    if (enemy?.isBoss && foe.hp <= 0 && !battleEnd) {
      // 멀티엔딩 분기 예시
      let type = 'normal';
      if (score >= 3000 && qte && qte.success) type = 'true';
      else if (score < 1000) type = 'bad';
      setEndingType(type);
      setEnding(true);
      const endingBgm = new Howl({ src: [BGM_ENDING], loop: false, volume: 0.5 });
      endingBgm.play();
      setTimeout(() => {
        setEnding(false);
        onWin();
      }, 4000);
    }
  }, [foe.hp, enemy, battleEnd, onWin, score, qte]);

  // 보스 페이즈 전환(HP 50% 이하)
  React.useEffect(() => {
    if (enemy?.isBoss && bossPhase === 1 && foe.hp > 0 && foe.hp <= foe.maxHp / 2) {
      setBossPhase(2);
      setPhaseCutscene(true);
      setParticle('aura');
      setZoom(1.25);
      setTimeout(() => setPhaseCutscene(false), 1800);
      setTimeout(() => setZoom(1), 1800);
      setLog(l => [...l, '보스가 분노 페이즈로 돌입했다!']);
    }
  }, [foe.hp, enemy, bossPhase]);

  // 보스 페이즈별 패턴 변화(예시: 분노 시 QTE 빈도 증가, 공격력 증가)
  const bossAttackPower = bossPhase === 2 ? 1.5 : 1;

  return (
    <div className="flex flex-col items-center justify-center bg-gray-900 p-6 rounded-lg shadow-lg w-[420px] min-h-[420px] relative overflow-hidden"
      style={{ transition: 'transform 0.5s cubic-bezier(.4,2,.6,1)', transform: `scale(${zoom})` }}>
      <img src={mapImg} alt="map" className="absolute inset-0 w-full h-full object-cover opacity-60 z-0" />
      {/* 컷씬 오버레이 */}
      {cutscene && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black bg-opacity-80 animate-fadein">
          <div className="text-2xl font-bold text-red-400 mb-2 drop-shadow-lg">{foe.name}</div>
          <div className="text-lg text-white mb-2 drop-shadow-lg">"{foe.bossLine || '이 세계의 균형을 무너뜨릴 자는 누구냐!'}"</div>
        </div>
      )}
      {/* 보스 페이즈 컷씬 오버레이 */}
      {phaseCutscene && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-80 animate-fadein">
          <div className="text-2xl font-bold text-red-500 mb-2 drop-shadow-lg">보스 분노!</div>
          <div className="text-lg text-white mb-2 drop-shadow-lg">"이제 진정한 힘을 보여주마!"</div>
        </div>
      )}
      {/* 파티클 오버레이 */}
      {particle === 'fire' && <div className="particle-fire" />}
      {particle === 'aura' && <div className="particle-aura" />}
      {/* QTE 오버레이 */}
      {qte?.active && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-60 animate-fadein">
          <div className="text-2xl font-bold text-yellow-300 mb-2 drop-shadow-lg">QTE! {qte.key} 키를 눌러 회피!</div>
          <div className="w-64 h-4 bg-gray-700 rounded overflow-hidden mb-2">
            <div className="h-full bg-blue-400 transition-all" style={{ width: `${(1-qte.progress)*100}%` }} />
          </div>
        </div>
      )}
      {/* 엔딩 컷씬 오버레이 */}
      {ending && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-90 animate-fadein">
          <img src={playerImg} alt="ending" className="w-28 h-28 rounded-full mb-4 object-cover border-4 border-yellow-300 shadow-xl" />
          <div className="text-3xl font-bold text-yellow-200 mb-2 drop-shadow-lg">
            {endingType === 'true' ? '진엔딩!' : endingType === 'bad' ? '비극적 결말' : '승리!'}
          </div>
          <div className="text-lg text-white mb-2 drop-shadow-lg">
            {endingType === 'true' ? '세계의 균형이 완전히 회복되었다!' :
             endingType === 'bad' ? '균형은 무너지고, 어둠이 세상을 덮었다...' :
             `${character.name}의 모험은 전설이 되었다...`}
          </div>
        </div>
      )}
      <div className="flex flex-row w-full justify-between mb-4 z-10">
        <div className="flex flex-col items-center">
          <img src={playerImg} alt="player" className={`w-20 h-20 rounded-lg mb-1 object-cover border-2 border-blue-400 shadow ${playerAnim}`} />
          <div className="font-bold text-lg" style={{ color: getAttributeColor(player.attribute) }}>{player.name}</div>
          <div className="w-32 h-3 bg-gray-700 rounded mb-1 overflow-hidden relative">
            <div className="h-full bg-green-400 transition-all duration-500" style={{ width: `${(player.hp/player.maxHp)*100}%` }} />
          </div>
          <div className="flex flex-row gap-1 mb-1">
            {player.status.map((s, i) => STATUS_ICONS[s] && (
              <span key={i} title={STATUS_ICONS[s].label} className="text-lg animate-pulse select-none cursor-help">{STATUS_ICONS[s].icon}</span>
            ))}
          </div>
          <div className="text-xs text-gray-400 mb-1">HP: {player.hp} / {player.maxHp}</div>
          <div className="text-xs text-gray-400 mb-1">속성: {ATTRIBUTES.find(a => a.id === player.attribute)?.name}</div>
          <div className="text-xs text-gray-400 mb-1">무기: {WEAPON_TYPES[player.weapon]?.name} (Lv.{player.weaponLevel})</div>
        </div>
        <div className="flex flex-col items-center">
          <img src={enemyImg} alt="enemy" className={`w-20 h-20 rounded-lg mb-1 object-cover border-2 border-red-400 shadow ${enemyAnim}`} />
          <div className="font-bold text-lg" style={{ color: getAttributeColor(foe.attribute) }}>{foe.name}</div>
          <div className="w-32 h-3 bg-gray-700 rounded mb-1 overflow-hidden relative">
            <div className="h-full bg-red-400 transition-all duration-500" style={{ width: `${(foe.hp/foe.maxHp)*100}%` }} />
          </div>
          <div className="flex flex-row gap-1 mb-1">
            {foe.status && foe.status.map((s, i) => STATUS_ICONS[s] && (
              <span key={i} title={STATUS_ICONS[s].label} className="text-lg animate-pulse select-none cursor-help">{STATUS_ICONS[s].icon}</span>
            ))}
          </div>
          <div className="text-xs text-gray-400 mb-1">HP: {foe.hp} / {foe.maxHp}</div>
          <div className="text-xs text-gray-400 mb-1">속성: {ATTRIBUTES.find(a => a.id === foe.attribute)?.name}</div>
        </div>
      </div>
      <div className="flex flex-col items-center w-full mb-4 z-10">
        <div className="w-full h-32 bg-gray-800 rounded p-2 overflow-y-auto text-xs text-gray-200 mb-2 opacity-95">
          {log.map((line, i) => <div key={i}>{line}</div>)}
        </div>
        {turn === "player" && !battleEnd && (
          <div className="flex flex-row gap-2 w-full justify-center">
            {player.skills.map((sk) => {
              const skillData = SKILLS.find(s => s.id === sk);
              const cd = skillCooldowns[sk] || 0;
              return (
                <button
                  key={sk}
                  className={`px-3 py-2 rounded font-semibold text-sm transition border-2 flex flex-col items-center relative
                    ${selectedSkill === sk ? "bg-blue-500 text-white border-blue-400" : "bg-gray-700 text-gray-200 border-gray-600 hover:border-blue-400"}
                    ${cd > 0 ? "opacity-50 cursor-not-allowed" : ""}
                    ${selectedSkill === sk && cd === 0 ? "skill-glow" : ""}
                  `}
                  onClick={() => setSelectedSkill(sk)}
                  disabled={cd > 0}
                  title={skillData?.desc + (cd > 0 ? ` (쿨타임 ${cd}턴)` : "")}
                >
                  <span className="text-xl mb-1">{skillData?.icon}</span>
                  <span>{skillData?.name}</span>
                  {cd > 0 && <span className="absolute top-1 right-2 text-xs text-red-300">{cd}</span>}
                </button>
              );
            })}
            <button
              className="px-4 py-2 rounded bg-green-500 text-white font-bold ml-2"
              onClick={handlePlayerAction}
              disabled={skillCooldowns[selectedSkill] > 0}
            >행동</button>
          </div>
        )}
        {battleEnd && (
          <div className="mt-4 text-lg font-bold text-yellow-300">전투 종료</div>
        )}
      </div>
    </div>
  );
} 