import React, { useRef, useEffect, useState } from "react";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const PLAYER_SIZE = 32;

// 오브젝트 종류 예시
const MAP_OBJECTS = [
  { id: 1, type: "tree", x: 60, y: 200, w: 40, h: 48 },
  { id: 2, type: "rock", x: 200, y: 400, w: 36, h: 36 },
  { id: 3, type: "chest", x: 320, y: 120, w: 32, h: 28 },
];

// 몬스터/보스 예시
const MONSTERS = [
  { id: 1, x: 80, y: 120, size: 36, active: true, name: "파이어 슬라임", attribute: "fire", color: "#f87171", hp: 80, maxHp: 80, isBoss: false },
  { id: 2, x: 250, y: 300, size: 36, active: true, name: "고블린", attribute: "earth", color: "#a3a3a3", hp: 100, maxHp: 100, isBoss: false },
  { id: 3, x: 180, y: 80, size: 44, active: true, name: "보스: 그림자 군주", attribute: "dark", color: "#818cf8", hp: 200, maxHp: 200, isBoss: true },
  { id: 4, x: 320, y: 500, size: 44, active: true, name: "보스: 대지의 수호자", attribute: "earth", color: "#a3e635", hp: 180, maxHp: 180, isBoss: true },
];

// 동료 예시
const ALLIES = [
  { id: 1, name: "세라", x: 100, y: 500, size: 28, color: "#a78bfa", joined: false },
];

export default function GameCanvas({ character, onEnterBattle }) {
  const canvasRef = useRef(null);
  const playerRef = useRef({
    x: CANVAS_WIDTH / 2 - (character?.size || PLAYER_SIZE) / 2,
    y: CANVAS_HEIGHT - (character?.size || PLAYER_SIZE) - 16,
    vx: 0,
    vy: 0,
  });
  const [enemies, setEnemies] = useState(MONSTERS);
  const [objects, setObjects] = useState(MAP_OBJECTS);
  const [allies, setAllies] = useState(ALLIES);
  const [storyFlags, setStoryFlags] = useState({ allyJoined: false, boss1Defeated: false, boss2Defeated: false, chestOpened: false });

  // 플레이어 이동(키보드)
  useEffect(() => {
    const keys = {};
    const handleKeyDown = (e) => { keys[e.key] = true; };
    const handleKeyUp = (e) => { keys[e.key] = false; };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    let running = true;
    function moveLoop() {
      const speed = character?.speed || 4;
      if (keys["ArrowLeft"] || keys["a"]) playerRef.current.x -= speed;
      if (keys["ArrowRight"] || keys["d"]) playerRef.current.x += speed;
      if (keys["ArrowUp"] || keys["w"]) playerRef.current.y -= speed;
      if (keys["ArrowDown"] || keys["s"]) playerRef.current.y += speed;
      playerRef.current.x = Math.max(0, Math.min(CANVAS_WIDTH - (character?.size || PLAYER_SIZE), playerRef.current.x));
      playerRef.current.y = Math.max(0, Math.min(CANVAS_HEIGHT - (character?.size || PLAYER_SIZE), playerRef.current.y));
      if (running) requestAnimationFrame(moveLoop);
    }
    moveLoop();
    return () => { running = false; window.removeEventListener("keydown", handleKeyDown); window.removeEventListener("keyup", handleKeyUp); };
  }, [character]);
  // 터치/드래그로 플레이어 이동 (모바일 지원)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dragging = false;
    let offsetX = 0, offsetY = 0;
    function getTouchPos(e) {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    function onTouchStart(e) {
      dragging = true;
      const pos = getTouchPos(e);
      offsetX = pos.x - playerRef.current.x;
      offsetY = pos.y - playerRef.current.y;
    }
    function onTouchMove(e) {
      if (!dragging) return;
      const pos = getTouchPos(e);
      playerRef.current.x = Math.max(0, Math.min(CANVAS_WIDTH - (character?.size || PLAYER_SIZE), pos.x - offsetX));
      playerRef.current.y = Math.max(0, Math.min(CANVAS_HEIGHT - (character?.size || PLAYER_SIZE), pos.y - offsetY));
    }
    function onTouchEnd() { dragging = false; }
    canvas.addEventListener('touchstart', onTouchStart);
    canvas.addEventListener('touchmove', onTouchMove);
    canvas.addEventListener('touchend', onTouchEnd);
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [character]);
  // 맵/플레이어/몬스터/오브젝트/동료 그리기 및 충돌 체크
  useEffect(() => {
    let running = true;
    function drawLoop() {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      // 맵 배경
      ctx.fillStyle = "#222";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      // 오브젝트
      objects.forEach(obj => {
        ctx.save();
        if (obj.type === "tree") ctx.fillStyle = "#15803d";
        if (obj.type === "rock") ctx.fillStyle = "#78716c";
        if (obj.type === "chest") ctx.fillStyle = storyFlags.chestOpened ? "#fbbf24" : "#a16207";
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        ctx.restore();
      });
      // 동료
      allies.forEach(ally => {
        if (!ally.joined) {
          ctx.fillStyle = ally.color;
          ctx.beginPath();
          ctx.arc(ally.x + ally.size / 2, ally.y + ally.size / 2, ally.size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = "12px sans-serif";
          ctx.fillStyle = "#fff";
          ctx.fillText(ally.name, ally.x, ally.y - 4);
        }
      });
      // 플레이어
      ctx.fillStyle = character?.color || "#60a5fa";
      ctx.fillRect(playerRef.current.x, playerRef.current.y, character?.size || PLAYER_SIZE, character?.size || PLAYER_SIZE);
      // 동료(합류 시 플레이어 옆)
      allies.forEach((ally, i) => {
        if (ally.joined) {
          ctx.fillStyle = ally.color;
          ctx.beginPath();
          ctx.arc(playerRef.current.x - 36 + i * 40, playerRef.current.y + 8, ally.size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = "12px sans-serif";
          ctx.fillStyle = "#fff";
          ctx.fillText(ally.name, playerRef.current.x - 36 + i * 40, playerRef.current.y);
        }
      });
      // 몬스터/보스
      enemies.forEach((enemy) => {
        if (!enemy.active) return;
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, enemy.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "12px sans-serif";
        ctx.fillStyle = enemy.isBoss ? "#facc15" : "#fff";
        ctx.fillText(enemy.name, enemy.x, enemy.y - 4);
        // 충돌 체크(플레이어)
        const px = playerRef.current.x + (character?.size || PLAYER_SIZE) / 2;
        const py = playerRef.current.y + (character?.size || PLAYER_SIZE) / 2;
        const ex = enemy.x + enemy.size / 2;
        const ey = enemy.y + enemy.size / 2;
        const dist = Math.hypot(px - ex, py - ey);
        if (dist < (character?.size || PLAYER_SIZE) / 2 + enemy.size / 2) {
          // 멀티보스/협동 전투 진입: 동료 합류 여부, 여러 보스/몬스터 전달
          const joinedAllies = allies.filter(a => a.joined);
          const activeBosses = enemies.filter(e => e.active && e.isBoss);
          onEnterBattle({
            name: enemy.name,
            hp: enemy.hp,
            maxHp: enemy.maxHp,
            attribute: enemy.attribute,
            weapon: "none",
            skills: ["attack", "skill1"],
            isBoss: enemy.isBoss,
            allies: joinedAllies,
            multiBoss: activeBosses.length > 1 ? activeBosses : undefined,
            storyFlags,
          });
          running = false;
          return;
        }
      });
      // 오브젝트 충돌/상호작용(상자 오픈, 동료 합류 등)
      objects.forEach(obj => {
        const px = playerRef.current.x + (character?.size || PLAYER_SIZE) / 2;
        const py = playerRef.current.y + (character?.size || PLAYER_SIZE) / 2;
        if (
          px > obj.x && px < obj.x + obj.w &&
          py > obj.y && py < obj.y + obj.h
        ) {
          if (obj.type === "chest" && !storyFlags.chestOpened) {
            setStoryFlags(f => ({ ...f, chestOpened: true }));
          }
        }
      });
      // 동료 합류(플레이어가 동료에 닿으면 합류)
      allies.forEach((ally, i) => {
        if (!ally.joined) {
          const px = playerRef.current.x + (character?.size || PLAYER_SIZE) / 2;
          const py = playerRef.current.y + (character?.size || PLAYER_SIZE) / 2;
          const ax = ally.x + ally.size / 2;
          const ay = ally.y + ally.size / 2;
          const dist = Math.hypot(px - ax, py - ay);
          if (dist < (character?.size || PLAYER_SIZE) / 2 + ally.size / 2) {
            setAllies(a => a.map(al => al.id === ally.id ? { ...al, joined: true } : al));
            setStoryFlags(f => ({ ...f, allyJoined: true }));
          }
        }
      });
      if (running) requestAnimationFrame(drawLoop);
    }
    drawLoop();
    return () => { running = false; };
  }, [character, enemies, objects, allies, storyFlags, onEnterBattle]);
  return (
    <div className="flex flex-col items-center relative">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="bg-gray-800 rounded shadow-lg border-2 border-gray-600 relative z-10"
        tabIndex={0}
        style={{ outline: "none", touchAction: "none" }}
      />
      <div className="mt-2 text-gray-400 text-sm">{`이동: 화살표/WASD, 모바일은 드래그`}</div>
    </div>
  );
} 