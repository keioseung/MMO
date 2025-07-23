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

export default function GameCanvas({ onGameOver }) {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const runningRef = useRef(true);
  const scoreRef = useRef(0);
  const playerRef = useRef({
    x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2,
    y: CANVAS_HEIGHT - PLAYER_SIZE - 16,
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

  // 키 입력 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current[e.key] = true;
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
      if (keysRef.current["ArrowLeft"]) player.x -= PLAYER_SPEED;
      if (keysRef.current["ArrowRight"]) player.x += PLAYER_SPEED;
      if (keysRef.current["ArrowUp"]) player.y -= PLAYER_SPEED;
      if (keysRef.current["ArrowDown"]) player.y += PLAYER_SPEED;
      // 경계 체크
      player.x = Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_SIZE, player.x));
      player.y = Math.max(0, Math.min(CANVAS_HEIGHT - PLAYER_SIZE, player.y));

      // 탄막 생성 (난이도에 따라 간격/속도 증가)
      const now = Date.now();
      if (
        now - lastBulletTimeRef.current > bulletIntervalRef.current
      ) {
        const pos = getRandomEdgePosition();
        // 난이도에 따라 속도 증가
        const speed = bulletSpeedRef.current + Math.random() * 1.5;
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
        ctx.fillStyle = "#f87171";
        ctx.fill();
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
      ctx.fillStyle = "#60a5fa";
      ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);

      // 점수 계산 (생존 시간)
      scoreRef.current = Math.floor((now - startTimeRef.current) / 10);
      ctx.fillStyle = "#fff";
      ctx.font = "20px sans-serif";
      ctx.fillText(`점수: ${scoreRef.current}`, 16, 32);

      // 충돌 체크
      for (const b of bulletsRef.current) {
        const px = player.x + PLAYER_SIZE / 2;
        const py = player.y + PLAYER_SIZE / 2;
        const dist = Math.hypot(b.x - px, b.y - py);
        if (dist < BULLET_RADIUS + PLAYER_SIZE / 2) {
          runningRef.current = false;
          onGameOver(scoreRef.current);
          return;
        }
      }

      requestRef.current = requestAnimationFrame(gameLoop);
    }
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      runningRef.current = false;
      cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line
  }, []);

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
      <div className="mt-2 text-gray-400 text-sm">화살표 키로 이동</div>
    </div>
  );
} 