import React, { useRef, useEffect } from "react";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const PLAYER_SIZE = 32;
const PLAYER_SPEED = 4;
const BULLET_RADIUS = 12;
const BULLET_MIN_SPEED = 2;
const BULLET_MAX_SPEED = 7;
const BULLET_SPAWN_INTERVAL_START = 1200; // ms
const BULLET_SPAWN_INTERVAL_MIN = 400; // ms
const DIFFICULTY_INCREASE_INTERVAL = 3000; // ms

function getRandomEdgePosition() {
  // 탄막이 화면 위, 좌, 우에서 랜덤하게 등장
  const edge = Math.floor(Math.random() * 3);
  if (edge === 0) {
    // 위
    return {
      x: Math.random() * (CANVAS_WIDTH - BULLET_RADIUS * 2) + BULLET_RADIUS,
      y: -BULLET_RADIUS,
      vx: 0,
      vy: 1,
    };
  } else if (edge === 1) {
    // 왼쪽
    return {
      x: -BULLET_RADIUS,
      y: Math.random() * (CANVAS_HEIGHT - BULLET_RADIUS * 2) + BULLET_RADIUS,
      vx: 1,
      vy: 0,
    };
  } else {
    // 오른쪽
    return {
      x: CANVAS_WIDTH + BULLET_RADIUS,
      y: Math.random() * (CANVAS_HEIGHT - BULLET_RADIUS * 2) + BULLET_RADIUS,
      vx: -1,
      vy: 0,
    };
  }
}

export default function GameCanvas({ onGameOver, character }) {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const runningRef = useRef(true);
  const scoreRef = useRef(0);
  const playerRef = useRef({
    x: CANVAS_WIDTH / 2 - (character?.size || 32) / 2,
    y: CANVAS_HEIGHT - (character?.size || 32) - 16,
    vx: 0,
    vy: 0,
  });
  const bulletsRef = useRef([]);
  const keysRef = useRef({});
  const bulletIntervalRef = useRef(BULLET_SPAWN_INTERVAL_START);
  const lastBulletTimeRef = useRef(0);
  const lastDifficultyIncreaseRef = useRef(0);
  const bulletSpeedRef = useRef(BULLET_MIN_SPEED);
  const startTimeRef = useRef(Date.now());
  // 특수효과 상태
  const [specialState, setSpecialState] = React.useState({
    used: false, // 리아드: 무적 1회 사용 여부
    invincible: false, // 리아드/카일: 무적 상태
    slow: false, // 세라: 감속 상태
    slowUsed: false, // 세라: 감속 1회 사용 여부
    stealth: false, // 카일: 은신 상태
    stealthCooldown: 0, // 카일: 은신 쿨타임
    shield: 0, // 이리스: 보호막 개수
    shieldAnim: false, // 이리스: 보호막 애니메이션
  });
  const [eventText, setEventText] = React.useState("");
  const eventTimes = [30, 60, 90]; // 초 단위
  const eventMessages = [
    "[균형의 파편]을 향한 여정이 시작된다...",
    "공허의 군주가 어둠 속에서 움직이기 시작했다.",
    "에테르의 흐름이 불안정해진다. 운명의 선택이 다가온다..."
  ];

  // 키 입력 처리 (특수효과)
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current[e.key] = true;
      // 세라: Shift로 감속 발동
      if (character?.id === "sera" && e.key === "Shift" && !specialState.slowUsed) {
        setSpecialState((s) => ({ ...s, slow: true, slowUsed: true }));
        setTimeout(() => setSpecialState((s) => ({ ...s, slow: false })), 3000);
      }
      // 카일: Space로 은신 발동
      if (character?.id === "kyle" && e.key === " " && specialState.stealthCooldown <= 0 && !specialState.stealth) {
        setSpecialState((s) => ({ ...s, stealth: true, stealthCooldown: 8 }));
        setTimeout(() => setSpecialState((s) => ({ ...s, stealth: false })), 1000);
      }
    };
    const handleKeyUp = (e) => {
      keysRef.current[e.key] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [character, specialState.slowUsed, specialState.stealth, specialState.stealthCooldown]);

  // 카일: 은신 쿨타임 감소
  useEffect(() => {
    if (character?.id === "kyle" && specialState.stealthCooldown > 0) {
      const timer = setInterval(() => {
        setSpecialState((s) => ({ ...s, stealthCooldown: Math.max(0, s.stealthCooldown - 1) }));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [character, specialState.stealthCooldown]);

  // 이리스: 30초마다 자동 보호막 (최대 2회)
  React.useEffect(() => {
    if (character?.id !== "iris") return;
    setSpecialState((s) => ({ ...s, shield: 1 })); // 시작 시 1회 부여
    const interval = setInterval(() => {
      setSpecialState((s) => ({ ...s, shield: Math.min(2, s.shield + 1) }));
    }, 30000);
    return () => clearInterval(interval);
  }, [character]);

  // 스토리 이벤트 타이머
  React.useEffect(() => {
    let timers = [];
    eventTimes.forEach((sec, idx) => {
      timers.push(setTimeout(() => {
        setEventText(eventMessages[idx]);
        setTimeout(() => setEventText(""), 3000);
      }, sec * 1000));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  // 게임 루프
  useEffect(() => {
    runningRef.current = true;
    scoreRef.current = 0;
    bulletsRef.current = [];
    bulletIntervalRef.current = BULLET_SPAWN_INTERVAL_START;
    bulletSpeedRef.current = BULLET_MIN_SPEED;
    lastBulletTimeRef.current = 0;
    lastDifficultyIncreaseRef.current = 0;
    startTimeRef.current = Date.now();

    function gameLoop() {
      if (!runningRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 플레이어 이동
      const player = playerRef.current;
      const speed = character?.speed || PLAYER_SPEED;
      if (keysRef.current["ArrowLeft"]) player.x -= speed;
      if (keysRef.current["ArrowRight"]) player.x += speed;
      if (keysRef.current["ArrowUp"]) player.y -= speed;
      if (keysRef.current["ArrowDown"]) player.y += speed;
      // 경계 체크
      player.x = Math.max(0, Math.min(CANVAS_WIDTH - (character?.size || PLAYER_SIZE), player.x));
      player.y = Math.max(0, Math.min(CANVAS_HEIGHT - (character?.size || PLAYER_SIZE), player.y));

      // 탄막 생성 (난이도에 따라 간격/속도 증가)
      const now = Date.now();
      let bulletSpeed = bulletSpeedRef.current;
      // 세라: 감속 특수효과
      if (character?.id === "sera" && specialState.slow) {
        bulletSpeed = bulletSpeedRef.current * 0.4;
      }
      if (
        now - lastBulletTimeRef.current > bulletIntervalRef.current
      ) {
        const pos = getRandomEdgePosition();
        // 난이도에 따라 속도 증가
        const speed = bulletSpeed + Math.random() * 1.5;
        bulletsRef.current.push({
          x: pos.x,
          y: pos.y,
          vx: pos.vx * speed,
          vy: pos.vy * speed,
        });
        lastBulletTimeRef.current = now;
      }
      // 난이도 점진적 상승
      if (
        now - lastDifficultyIncreaseRef.current > DIFFICULTY_INCREASE_INTERVAL
      ) {
        bulletIntervalRef.current = Math.max(
          BULLET_SPAWN_INTERVAL_MIN,
          bulletIntervalRef.current - 120
        );
        bulletSpeedRef.current = Math.min(
          BULLET_MAX_SPEED,
          bulletSpeedRef.current + 0.5
        );
        lastDifficultyIncreaseRef.current = now;
      }

      // 탄막 이동 및 그리기
      bulletsRef.current.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;
        ctx.beginPath();
        ctx.arc(b.x, b.y, BULLET_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = specialState.slow ? "#a5b4fc" : "#f87171";
        ctx.globalAlpha = specialState.stealth ? 0.3 : 1.0;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });
      // 탄막 화면 밖 제거
      bulletsRef.current = bulletsRef.current.filter(
        (b) =>
          b.x > -BULLET_RADIUS &&
          b.x < CANVAS_WIDTH + BULLET_RADIUS &&
          b.y > -BULLET_RADIUS &&
          b.y < CANVAS_HEIGHT + BULLET_RADIUS
      );

      // 플레이어 그리기
      ctx.fillStyle = character?.color || "#60a5fa";
      ctx.globalAlpha = (specialState.invincible || specialState.stealth) ? 0.4 : 1.0;
      ctx.fillRect(player.x, player.y, character?.size || PLAYER_SIZE, character?.size || PLAYER_SIZE);
      // 이리스: 보호막 애니메이션
      if (character?.id === "iris" && (specialState.shield > 0 || specialState.shieldAnim)) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(
          player.x + (character?.size || PLAYER_SIZE) / 2,
          player.y + (character?.size || PLAYER_SIZE) / 2,
          (character?.size || PLAYER_SIZE) / 2 + 8 + (specialState.shieldAnim ? 6 : 0),
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = specialState.shieldAnim ? "#fef08a" : "#34d399";
        ctx.lineWidth = specialState.shieldAnim ? 6 : 4;
        ctx.globalAlpha = specialState.shieldAnim ? 0.7 : 0.4;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        ctx.restore();
      }
      ctx.globalAlpha = 1.0;

      // 점수 계산 (생존 시간)
      scoreRef.current = Math.floor((now - startTimeRef.current) / 10);
      ctx.fillStyle = "#fff";
      ctx.font = "20px sans-serif";
      ctx.fillText(`점수: ${scoreRef.current}`, 16, 32);

      // 충돌 체크
      let hit = false;
      for (const b of bulletsRef.current) {
        const px = player.x + (character?.size || PLAYER_SIZE) / 2;
        const py = player.y + (character?.size || PLAYER_SIZE) / 2;
        const dist = Math.hypot(b.x - px, b.y - py);
        if (dist < BULLET_RADIUS + (character?.size || PLAYER_SIZE) / 2) {
          hit = true;
          break;
        }
      }
      // 특수효과: 무적/은신/보호막 적용
      if (hit) {
        if (character?.id === "liad" && !specialState.used) {
          setSpecialState((s) => ({ ...s, used: true, invincible: true }));
          setTimeout(() => setSpecialState((s) => ({ ...s, invincible: false })), 1000);
          hit = false;
        } else if (character?.id === "kyle" && specialState.stealth) {
          hit = false;
        } else if (character?.id === "sera" && specialState.slow) {
          hit = false;
        } else if (character?.id === "iris" && specialState.shield > 0) {
          setSpecialState((s) => ({ ...s, shield: s.shield - 1, shieldAnim: true }));
          setTimeout(() => setSpecialState((s) => ({ ...s, shieldAnim: false })), 600);
          hit = false;
        }
      }
      if (hit && !specialState.invincible && !specialState.stealth) {
        runningRef.current = false;
        onGameOver(scoreRef.current);
        return;
      }

      requestRef.current = requestAnimationFrame(gameLoop);
    }
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      runningRef.current = false;
      cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line
  }, [character, specialState]);

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="bg-gray-700 rounded shadow-lg border-2 border-gray-600"
        tabIndex={0}
        style={{ outline: "none" }}
      />
      {eventText && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 text-white text-lg px-8 py-4 rounded shadow-lg z-50 animate-fadein">
          {eventText}
        </div>
      )}
      <div className="mt-2 text-gray-400 text-sm">화살표 키로 이동</div>
      {character && (
        <div className="mt-2 p-2 rounded bg-gray-800 text-gray-200 text-center w-80 border border-gray-700">
          <div className="font-bold text-lg mb-1" style={{ color: character.color }}>{character.name} <span className="text-xs text-gray-400">({character.title})</span></div>
          <div className="text-xs text-gray-400 mb-1">{character.job}</div>
          <div className="text-xs text-gray-300">{character.description}</div>
          <div className="text-xs text-yellow-300 mt-2">특수효과: {character.special}</div>
          {character.id === "liad" && <div className="text-xs text-blue-400">무적 사용: {specialState.used ? "O" : "X"}</div>}
          {character.id === "sera" && <div className="text-xs text-blue-400">감속 사용: {specialState.slowUsed ? "O" : "X"} {specialState.slow && "(발동 중)"}</div>}
          {character.id === "kyle" && <div className="text-xs text-blue-400">은신 쿨타임: {specialState.stealthCooldown > 0 ? `${specialState.stealthCooldown}s` : "사용 가능"} {specialState.stealth && "(발동 중)"}</div>}
          {character.id === "iris" && <div className="text-xs text-green-400">보호막: {specialState.shield} / 2</div>}
        </div>
      )}
    </div>
  );
} 