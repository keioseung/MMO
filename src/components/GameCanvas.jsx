import React, { useRef, useEffect, useState } from "react";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const TILE_SIZE = 32;
const PLAYER_SIZE = 32;

const TILESET_URL = "/images/lpc-tile-atlas.png";
const PLAYER_SPRITE_URL = "/images/lpc-character.png";
const MONSTER_SPRITE_URL = "/images/lpc-slime.png";
const ALLY_SPRITE_URL = "/images/lpc-female-mage.png";

const mapData = [
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,3,3,2,2,3,3,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
];
const tileMap = [
  { sx: 0, sy: 0 },    // 0: 잔디
  { sx: 32, sy: 0 },   // 1: 길
  { sx: 64, sy: 0 },   // 2: 풀
  { sx: 96, sy: 0 },   // 3: 바위
];

export default function GameCanvas({ character, onEnterBattle }) {
  const canvasRef = useRef(null);
  const [frame, setFrame] = useState(0); // 걷기 애니메이션 프레임
  // 이미지 로딩(useRef로 1회만 생성)
  const tileSetImg = useRef();
  const playerSpriteImg = useRef();
  const monsterSpriteImg = useRef();
  const allySpriteImg = useRef();
  const [imagesLoaded, setImagesLoaded] = useState(false);
  // 플레이어 위치
  const playerRef = useRef({
    x: 5 * TILE_SIZE,
    y: 4 * TILE_SIZE,
    vx: 0,
    vy: 0,
  });
  // 방향 상태(좌/우/상/하) 예시
  const [direction, setDirection] = useState('down');
  const [enemies] = useState([
    { id: 1, x: 7 * TILE_SIZE, y: 2 * TILE_SIZE, size: 32, active: true, name: "슬라임", sprite: MONSTER_SPRITE_URL },
    { id: 2, x: 9 * TILE_SIZE, y: 4 * TILE_SIZE, size: 32, active: true, name: "보스: 그림자 군주", sprite: MONSTER_SPRITE_URL },
  ]);
  const [allies, setAllies] = useState([
    { id: 1, name: "세라", x: 3 * TILE_SIZE, y: 5 * TILE_SIZE, size: 32, sprite: ALLY_SPRITE_URL, joined: false },
  ]);
  // 이미지 로딩 완료 체크
  useEffect(() => {
    let loaded = 0;
    let failed = false;
    function checkLoaded() { loaded++; if (loaded === 4) setImagesLoaded(true); }
    function onError(e) {
      failed = true;
      console.error('이미지 로딩 실패:', e?.target?.src);
      setImagesLoaded(true); // fallback 렌더링을 위해 true로 설정
    }
    tileSetImg.current = new window.Image(); tileSetImg.current.src = TILESET_URL; tileSetImg.current.onload = checkLoaded; tileSetImg.current.onerror = onError;
    playerSpriteImg.current = new window.Image(); playerSpriteImg.current.src = PLAYER_SPRITE_URL; playerSpriteImg.current.onload = checkLoaded; playerSpriteImg.current.onerror = onError;
    monsterSpriteImg.current = new window.Image(); monsterSpriteImg.current.src = MONSTER_SPRITE_URL; monsterSpriteImg.current.onload = checkLoaded; monsterSpriteImg.current.onerror = onError;
    allySpriteImg.current = new window.Image(); allySpriteImg.current.src = ALLY_SPRITE_URL; allySpriteImg.current.onload = checkLoaded; allySpriteImg.current.onerror = onError;
  }, []);
  // 걷기 애니메이션 프레임 순환
  useEffect(() => {
    const interval = setInterval(() => setFrame(f => (f + 1) % 9), 120);
    return () => clearInterval(interval);
  }, []);
  // 플레이어 이동(키보드)
  useEffect(() => {
    const keys = {};
    const handleKeyDown = (e) => { keys[e.key] = true; };
    const handleKeyUp = (e) => { keys[e.key] = false; };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    let running = true;
    function moveLoop() {
      const speed = 3;
      if (keys["ArrowLeft"] || keys["a"]) { playerRef.current.x -= speed; setDirection('left'); }
      if (keys["ArrowRight"] || keys["d"]) { playerRef.current.x += speed; setDirection('right'); }
      if (keys["ArrowUp"] || keys["w"]) { playerRef.current.y -= speed; setDirection('up'); }
      if (keys["ArrowDown"] || keys["s"]) { playerRef.current.y += speed; setDirection('down'); }
      playerRef.current.x = Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_SIZE, playerRef.current.x));
      playerRef.current.y = Math.max(0, Math.min(CANVAS_HEIGHT - PLAYER_SIZE, playerRef.current.y));
      if (running) requestAnimationFrame(moveLoop);
    }
    moveLoop();
    return () => { running = false; window.removeEventListener("keydown", handleKeyDown); window.removeEventListener("keyup", handleKeyUp); };
  }, []);
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
      playerRef.current.x = Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_SIZE, pos.x - offsetX));
      playerRef.current.y = Math.max(0, Math.min(CANVAS_HEIGHT - PLAYER_SIZE, pos.y - offsetY));
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
  }, []);
  // 맵/플레이어/몬스터/동료 그리기 및 충돌 체크
  useEffect(() => {
    if (!imagesLoaded) {
      console.log('이미지 로딩 중... drawLoop 진입 안함');
      return;
    }
    console.log('drawLoop 진입, imagesLoaded:', imagesLoaded);
    let running = true;
    function drawLoop() {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      // 맵 타일셋 렌더링
      for (let y = 0; y < mapData.length; y++) {
        for (let x = 0; x < mapData[0].length; x++) {
          const tile = mapData[y][x];
          const { sx, sy } = tileMap[tile];
          if (tileSetImg.current?.complete && tileSetImg.current?.naturalWidth > 0) {
            ctx.drawImage(tileSetImg.current, sx, sy, TILE_SIZE, TILE_SIZE, x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
          } else {
            ctx.fillStyle = ['#4ade80','#fbbf24','#a3e635','#64748b'][tile%4];
            ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        }
      }
      // 동료(맵 위)
      allies.forEach(ally => {
        if (!ally.joined) {
          // 그림자
          ctx.save();
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.ellipse(ally.x+16, ally.y+44, 12, 6, 0, 0, Math.PI*2);
          ctx.fillStyle = '#000';
          ctx.fill();
          ctx.restore();
          // 스프라이트 or fallback
          if (allySpriteImg.current?.complete && allySpriteImg.current?.naturalWidth > 0) {
            ctx.drawImage(allySpriteImg.current, 0, 0, 64, 64, ally.x, ally.y, 32, 48);
          } else {
            ctx.fillStyle = '#f472b6';
            ctx.fillRect(ally.x, ally.y, 32, 48);
          }
          // HP바
          ctx.fillStyle = '#222'; ctx.fillRect(ally.x, ally.y-10, 32, 5);
          ctx.fillStyle = '#22c55e'; ctx.fillRect(ally.x, ally.y-10, 32, 5);
          // 이름
          ctx.font = "12px sans-serif";
          ctx.fillStyle = "#fff";
          ctx.fillText(ally.name, ally.x, ally.y-16);
        }
      });
      // 플레이어(걷기 애니메이션, 방향별 프레임)
      const dirRow = { down: 0, left: 1, right: 2, up: 3 };
      const row = dirRow[direction] || 0;
      // 그림자
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.ellipse(playerRef.current.x+16, playerRef.current.y+44, 12, 6, 0, 0, Math.PI*2);
      ctx.fillStyle = '#000';
      ctx.fill();
      ctx.restore();
      if (playerSpriteImg.current?.complete && playerSpriteImg.current?.naturalWidth > 0) {
        ctx.drawImage(playerSpriteImg.current, frame*64, row*64, 64, 64, playerRef.current.x, playerRef.current.y, 32, 48);
      } else {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(playerRef.current.x, playerRef.current.y, 32, 48);
      }
      // HP바
      ctx.fillStyle = '#222'; ctx.fillRect(playerRef.current.x, playerRef.current.y-10, 32, 5);
      ctx.fillStyle = '#22c55e'; ctx.fillRect(playerRef.current.x, playerRef.current.y-10, 32, 5);
      // 이름
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#fff";
      ctx.fillText(character?.name || '플레이어', playerRef.current.x, playerRef.current.y-16);
      // 동료(합류 시 플레이어 뒤를 따라다니는 위치)
      allies.forEach((ally, i) => {
        if (ally.joined) {
          // 그림자
          ctx.save();
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.ellipse(playerRef.current.x - 36 + i * 40 + 14, playerRef.current.y + 44, 10, 5, 0, 0, Math.PI*2);
          ctx.fillStyle = '#000';
          ctx.fill();
          ctx.restore();
          if (allySpriteImg.current?.complete && allySpriteImg.current?.naturalWidth > 0) {
            ctx.drawImage(allySpriteImg.current, 0, 0, 64, 64, playerRef.current.x - 36 + i * 40, playerRef.current.y + 8, 28, 44);
          } else {
            ctx.fillStyle = '#f472b6';
            ctx.fillRect(playerRef.current.x - 36 + i * 40, playerRef.current.y + 8, 28, 44);
          }
          // HP바
          ctx.fillStyle = '#222'; ctx.fillRect(playerRef.current.x - 36 + i * 40, playerRef.current.y, 28, 4);
          ctx.fillStyle = '#22c55e'; ctx.fillRect(playerRef.current.x - 36 + i * 40, playerRef.current.y, 28, 4);
          // 이름
          ctx.font = "11px sans-serif";
          ctx.fillStyle = "#fff";
          ctx.fillText(ally.name, playerRef.current.x - 36 + i * 40, playerRef.current.y-10);
        }
      });
      // 몬스터/보스(스프라이트, 그림자, HP바, 이름)
      enemies.forEach((enemy) => {
        if (!enemy.active) return;
        // 그림자
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.ellipse(enemy.x+enemy.size/2, enemy.y+enemy.size-4, enemy.size/2.2, enemy.size/6, 0, 0, Math.PI*2);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.restore();
        if (monsterSpriteImg.current?.complete && monsterSpriteImg.current?.naturalWidth > 0) {
          ctx.drawImage(monsterSpriteImg.current, 0, 0, 64, 64, enemy.x, enemy.y, enemy.size, enemy.size);
        } else {
          ctx.fillStyle = '#a3e635';
          ctx.beginPath();
          ctx.arc(enemy.x+enemy.size/2, enemy.y+enemy.size/2, enemy.size/2, 0, Math.PI*2);
          ctx.fill();
        }
        // HP바
        ctx.fillStyle = '#222'; ctx.fillRect(enemy.x, enemy.y-10, enemy.size, 5);
        ctx.fillStyle = '#ef4444'; ctx.fillRect(enemy.x, enemy.y-10, enemy.size, 5);
        // 이름
        ctx.font = "12px sans-serif";
        ctx.fillStyle = enemy.name.includes("보스") ? "#facc15" : "#fff";
        ctx.fillText(enemy.name, enemy.x, enemy.y - 16);
        // 충돌 체크(플레이어)
        const px = playerRef.current.x + PLAYER_SIZE / 2;
        const py = playerRef.current.y + PLAYER_SIZE / 2;
        const ex = enemy.x + enemy.size / 2;
        const ey = enemy.y + enemy.size / 2;
        const dist = Math.hypot(px - ex, py - ey);
        if (dist < PLAYER_SIZE / 2 + enemy.size / 2) {
          console.log('onEnterBattle 호출:', enemy);
          onEnterBattle({
            name: enemy.name,
            hp: 100,
            maxHp: 100,
            attribute: "fire",
            weapon: "none",
            skills: ["attack", "skill1"],
            isBoss: enemy.name.includes("보스")
          });
          running = false;
          return;
        }
      });
      if (running) requestAnimationFrame(drawLoop);
    }
    drawLoop();
    return () => { running = false; };
  }, [frame, onEnterBattle, allies, enemies, imagesLoaded, direction]);
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
      {!imagesLoaded && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 text-white px-6 py-3 rounded shadow-lg z-20">
          이미지 로딩 중...<br/>만약 오래 걸리면 새로고침 해보세요.<br/>(혹은 이미지 서버가 막혔을 수 있습니다)
        </div>
      )}
      <div className="mt-2 text-gray-400 text-sm">{`이동: 화살표/WASD, 모바일은 드래그`}</div>
    </div>
  );
} 